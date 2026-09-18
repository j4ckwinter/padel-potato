const source = (designName: string, sourceId: string) =>
  Object.freeze({
    designName,
    sourceId,
    fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
    pageId: '482a7222-5a3b-8086-8008-a6072bd7e924',
    revision: 292,
  } as const);

export const spacing = Object.freeze({
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

export const spacingSources = Object.freeze({
  space12: source('space.12', '482a7222-5a3b-8086-8008-a6072bc267f5'),
  space16: source('space.16', '482a7222-5a3b-8086-8008-a6072bc42252'),
  space20: source('space.20', '482a7222-5a3b-8086-8008-a6072bc67f7f'),
  space24: source('space.24', '482a7222-5a3b-8086-8008-a6072bc826dd'),
  space32: source('space.32', '482a7222-5a3b-8086-8008-a6072bc9ddb9'),
  space4: source('space.4', '482a7222-5a3b-8086-8008-a6072bbed5bc'),
  space40: source('space.40', '482a7222-5a3b-8086-8008-a6072bcb648e'),
  space8: source('space.8', '482a7222-5a3b-8086-8008-a6072bc0bac7'),
} as const satisfies Readonly<
  Record<SpacingToken, ReturnType<typeof source>>
>);
