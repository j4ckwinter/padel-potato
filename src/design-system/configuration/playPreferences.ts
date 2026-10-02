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
