import {
  playLevelOptions,
  playSideOptions,
  playVibeOptions,
} from '../../design-system/configuration/playPreferences';
import type { PlayStepDraft } from './PlayStepScreen';

function draftKey(userId: string) {
  if (!userId.trim())
    throw new Error('A user is required to save preferences.');
  return `padel-potato.play-draft.v1.${encodeURIComponent(userId)}`;
}

function isPlayDraft(value: unknown): value is PlayStepDraft {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    Object.keys(draft).length === 3 &&
    (draft.level === null ||
      playLevelOptions.some((option) => option.value === draft.level)) &&
    (draft.side === null ||
      playSideOptions.some((option) => option.value === draft.side)) &&
    (draft.vibe === null ||
      playVibeOptions.some((option) => option.value === draft.vibe))
  );
}

export function loadPlayDraft(userId: string): PlayStepDraft | null {
  try {
    const stored = localStorage.getItem(draftKey(userId));
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    return record.version === 1 && isPlayDraft(record.draft)
      ? record.draft
      : null;
  } catch {
    return null;
  }
}

export async function savePlayDraft(
  userId: string,
  draft: PlayStepDraft,
): Promise<void> {
  const key = draftKey(userId);
  if (!isPlayDraft(draft)) throw new Error('The play preferences are invalid.');
  localStorage.setItem(key, JSON.stringify({ version: 1, draft }));
}
