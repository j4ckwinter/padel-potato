import {
  isAvailabilityDraft,
  type AvailabilityDraft,
} from '../../design-system/configuration/availability';

function draftKey(userId: string) {
  if (!userId.trim())
    throw new Error('A user is required to save preferences.');
  return `padel-potato.availability-draft.v1.${encodeURIComponent(userId)}`;
}

export function loadAvailabilityDraft(
  userId: string,
): AvailabilityDraft | null {
  try {
    const stored = localStorage.getItem(draftKey(userId));
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    return record.version === 1 && isAvailabilityDraft(record.draft)
      ? record.draft
      : null;
  } catch {
    return null;
  }
}

export async function saveAvailabilityDraft(
  userId: string,
  draft: AvailabilityDraft,
): Promise<void> {
  const key = draftKey(userId);
  if (!isAvailabilityDraft(draft))
    throw new Error('The availability is invalid.');
  localStorage.setItem(key, JSON.stringify({ version: 1, draft }));
}
