export const playLevelOptions = Object.freeze([
  { value: 'beginner', label: 'Beginner' },
  { value: 'improver', label: 'Improver' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const);

export const playSideOptions = Object.freeze([
  { value: 'left', label: 'Left side' },
  { value: 'right', label: 'Right side' },
  { value: 'either', label: 'Either side' },
] as const);

export const playVibeOptions = Object.freeze([
  { value: 'social', label: 'Social' },
  { value: 'competitive', label: 'Competitive' },
] as const);

export type PlayDraft = Readonly<{
  level: (typeof playLevelOptions)[number]['value'] | null;
  side: (typeof playSideOptions)[number]['value'] | null;
  vibe: (typeof playVibeOptions)[number]['value'] | null;
}>;
export function isPlayDraft(value: unknown): value is PlayDraft {
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
