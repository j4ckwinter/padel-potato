export const dimensions = Object.freeze({
  controlHeight40: 40,
  controlHeight44: 44,
  controlHeight48: 48,
  iconSize20: 20,
} as const);

export type DimensionToken = keyof typeof dimensions;
