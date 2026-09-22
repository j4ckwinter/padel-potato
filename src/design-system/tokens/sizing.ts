/** Fixed UI geometry on the shared four-point grid. */
export const sizing = Object.freeze({
  size0: 0,
  size4: 4,
  size8: 8,
  size12: 12,
  size16: 16,
  size20: 20,
  size24: 24,
  size28: 28,
  size32: 32,
  size36: 36,
  size40: 40,
  size44: 44,
  size48: 48,
  size52: 52,
  size56: 56,
  size64: 64,
  size72: 72,
  size76: 76,
  size80: 80,
  size88: 88,
  size92: 92,
  size104: 104,
  size112: 112,
} as const);

export type SizingToken = keyof typeof sizing;
