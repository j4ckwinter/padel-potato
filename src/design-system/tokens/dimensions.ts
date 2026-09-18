const source = (designName: string, sourceId: string) =>
  Object.freeze({
    designName,
    sourceId,
    fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
    pageId: '482a7222-5a3b-8086-8008-a6072bd7e924',
    revision: 292,
  } as const);

export const dimensions = Object.freeze({
  controlHeight40: 40,
  controlHeight44: 44,
  controlHeight48: 48,
  iconSize20: 20,
} as const);

export type DimensionToken = keyof typeof dimensions;

export const dimensionSources = Object.freeze({
  controlHeight40: source(
    'control.height.40',
    '482a7222-5a3b-8086-8008-a60e5e58e0cf',
  ),
  controlHeight44: source(
    'control.height.44',
    '482a7222-5a3b-8086-8008-a60e5e62fb1e',
  ),
  controlHeight48: source(
    'control.height.48',
    '482a7222-5a3b-8086-8008-a60e5e6f55dc',
  ),
  iconSize20: source(
    'icon.size.20',
    '482a7222-5a3b-8086-8008-a60e5e832077',
  ),
} as const satisfies Readonly<
  Record<DimensionToken, ReturnType<typeof source>>
>);
