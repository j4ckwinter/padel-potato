import { Directory, File, Paths } from 'expo-file-system';
import { launchImageLibraryAsync } from 'expo-image-picker';

import {
  profileFieldLimits,
  profilePhotoMaximumBytes,
} from '../../design-system/configuration/profile';

export type ProfileDraft = Readonly<{
  displayName: string;
  homeLocation: string;
  photoUri: string | null;
}>;

function draftKey(userId: string) {
  if (!userId.trim()) throw new Error('A user is required to save a profile.');
  return `padel-potato.profile-draft.v1.${encodeURIComponent(userId)}`;
}

function isProfileDraft(value: unknown): value is ProfileDraft {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.displayName === 'string' &&
    draft.displayName.trim().length > 0 &&
    draft.displayName.trim().length <= profileFieldLimits.displayName &&
    typeof draft.homeLocation === 'string' &&
    draft.homeLocation.trim().length > 0 &&
    draft.homeLocation.trim().length <= profileFieldLimits.homeLocation &&
    (draft.photoUri === null ||
      (typeof draft.photoUri === 'string' &&
        draft.photoUri.startsWith('file://')))
  );
}

export function loadProfileDraft(userId: string): ProfileDraft | null {
  try {
    const stored = localStorage.getItem(draftKey(userId));
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    return record.version === 1 && isProfileDraft(record.draft)
      ? {
          ...record.draft,
          displayName: record.draft.displayName.trim(),
          homeLocation: record.draft.homeLocation.trim(),
        }
      : null;
  } catch {
    return null;
  }
}

export async function saveProfileDraft(userId: string, draft: ProfileDraft) {
  const key = draftKey(userId);
  if (!isProfileDraft(draft)) throw new Error('The profile draft is invalid.');
  localStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      draft: {
        ...draft,
        displayName: draft.displayName.trim(),
        homeLocation: draft.homeLocation.trim(),
      },
    }),
  );
}

export async function pickProfilePhoto(): Promise<string | null> {
  const result = await launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    quality: 1,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset || !/^(file|content):\/\//u.test(asset.uri)) {
    throw new Error('Choose a photo from your device on iOS or Android.');
  }
  const extension = asset.uri.split('?')[0].split('.').pop()?.toLowerCase();
  const mimeType =
    asset.mimeType ??
    (extension === 'jpg' || extension === 'jpeg'
      ? 'image/jpeg'
      : extension === 'png'
        ? 'image/png'
        : undefined);
  if (mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
    throw new Error('Choose a JPEG or PNG photo.');
  }
  const source = new File(asset.uri);
  if (!source.exists) throw new Error('The selected photo could not be read.');
  const size = source.size;
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('The selected photo could not be read.');
  }
  if (
    size > profilePhotoMaximumBytes ||
    (asset.fileSize ?? 0) > profilePhotoMaximumBytes
  ) {
    throw new Error('Choose a photo no larger than 5 MB.');
  }
  const directory = new Directory(Paths.document, 'profile-photos');
  directory.create({ idempotent: true, intermediates: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${mimeType === 'image/png' ? 'png' : 'jpg'}`;
  const destination = new File(directory, filename);
  try {
    await source.copy(destination);
  } catch {
    throw new Error('The selected photo could not be saved. Please try again.');
  }
  return destination.uri;
}
