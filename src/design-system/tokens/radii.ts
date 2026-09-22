export const radii = Object.freeze({
  radius12: 12,
  radius16: 16,
  radius20: 20,
  radius28: 28,
  radius36: 36,
  radius8: 8,
} as const);

export type RadiusToken = keyof typeof radii;
