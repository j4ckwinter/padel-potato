export const profileFieldLimits = Object.freeze({
  displayName: 80,
  homeLocation: 120,
});

export const profilePhotoMaximumBytes = 5 * 1024 * 1024;

export type ProfileDraft = Readonly<{
  displayName: string;
  homeLocation: string;
  photoUri: string | null;
}>;

export function isProfileDraft(value: unknown): value is ProfileDraft {
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
