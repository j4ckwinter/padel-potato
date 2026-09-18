const source = (designName: string, sourceId: string) =>
  Object.freeze({
    designName,
    sourceId,
    fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
    pageId: '482a7222-5a3b-8086-8008-a6072bd7e924',
    revision: 292,
  } as const);

export const borders = Object.freeze({
  borderDefault: 1,
  focusRingWidth: 2,
} as const);

export type BorderToken = keyof typeof borders;

export const borderSources = Object.freeze({
  borderDefault: source(
    'border.default',
    '482a7222-5a3b-8086-8008-a60e5e976196',
  ),
  focusRingWidth: source(
    'focus.ring.width',
    '482a7222-5a3b-8086-8008-a60e5eab3030',
  ),
} as const satisfies Readonly<Record<BorderToken, ReturnType<typeof source>>>);
