export const spacing = Object.freeze({
  space0: 0,
  space12: 12,
  space16: 16,
  space20: 20,
  space24: 24,
  space32: 32,
  space4: 4,
  space40: 40,
  space8: 8,
} as const);

export type SpacingToken = keyof typeof spacing;
