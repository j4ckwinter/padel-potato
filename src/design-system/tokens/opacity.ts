export const opacity = Object.freeze({
  opacityDisabled: 0.4,
} as const);

export type OpacityToken = keyof typeof opacity;
