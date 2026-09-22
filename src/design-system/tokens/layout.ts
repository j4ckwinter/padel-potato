/** Shared review and product layout widths. Components remain fluid within them. */
export const layoutWidths = Object.freeze({
  compact: 320,
  content: 352,
  viewport: 390,
} as const);

export type LayoutWidthToken = keyof typeof layoutWidths;

export const responsiveWidths = Object.freeze({
  fill: '100%',
} as const);

export type ResponsiveWidthToken = keyof typeof responsiveWidths;
