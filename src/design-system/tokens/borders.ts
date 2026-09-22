export const borders = Object.freeze({
  borderDefault: 1,
  focusRingWidth: 2,
} as const);

export type BorderToken = keyof typeof borders;
