import { isAvailabilityDraft, type AvailabilityDraft } from './availability';
import { isProfileDraft, type ProfileDraft } from './profile';
import { isPlayDraft, type PlayDraft } from './playPreferences';
type CompletePlayStepDraft = {
  [Key in keyof PlayDraft]: NonNullable<PlayDraft[Key]>;
};

export type OnboardingDraft = Readonly<{
  profile: ProfileDraft;
  play: CompletePlayStepDraft;
  availability: AvailabilityDraft;
}>;

export function isCompleteOnboardingDraft(
  value: unknown,
): value is OnboardingDraft {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    isProfileDraft(draft.profile) &&
    isPlayDraft(draft.play) &&
    draft.play.level !== null &&
    draft.play.side !== null &&
    draft.play.vibe !== null &&
    isAvailabilityDraft(draft.availability) &&
    draft.availability.days.length > 0 &&
    draft.availability.times.length > 0 &&
    draft.availability.frequency !== null
  );
}
