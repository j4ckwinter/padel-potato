import { sizing } from './sizing';

/** @deprecated Prefer the generic `sizing` scale for new code. */
export const dimensions = Object.freeze({
  controlHeight40: sizing.size40,
  controlHeight44: sizing.size44,
  controlHeight48: sizing.size48,
  iconSize20: sizing.size20,
} as const);

export type DimensionToken = keyof typeof dimensions;
