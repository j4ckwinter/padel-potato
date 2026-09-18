const source = (designName: string, sourceId: string) =>
  Object.freeze({
    designName,
    sourceId,
    fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
    pageId: '482a7222-5a3b-8086-8008-a6072bd7e924',
    revision: 292,
  } as const);

export const opacity = Object.freeze({
  opacityDisabled: 0.4,
} as const);

export type OpacityToken = keyof typeof opacity;

export const opacitySources = Object.freeze({
  opacityDisabled: source(
    'opacity.disabled',
    '482a7222-5a3b-8086-8008-a60e5ebdb065',
  ),
} as const satisfies Readonly<Record<OpacityToken, ReturnType<typeof source>>>);
