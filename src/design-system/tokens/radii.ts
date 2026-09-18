const source = (designName: string, sourceId: string) =>
  Object.freeze({
    designName,
    sourceId,
    fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
    pageId: '482a7222-5a3b-8086-8008-a6072bd7e924',
    revision: 292,
  } as const);

export const radii = Object.freeze({
  radius12: 12,
  radius16: 16,
  radius20: 20,
  radius28: 28,
  radius36: 36,
  radius8: 8,
} as const);

export type RadiusToken = keyof typeof radii;

export const radiusSources = Object.freeze({
  radius12: source('radius.12', '482a7222-5a3b-8086-8008-a6072bcf0bc4'),
  radius16: source('radius.16', '482a7222-5a3b-8086-8008-a6072bd0c57c'),
  radius20: source('radius.20', '482a7222-5a3b-8086-8008-a6072bd2e100'),
  radius28: source('radius.28', '482a7222-5a3b-8086-8008-a6072bd49f48'),
  radius36: source('radius.36', '482a7222-5a3b-8086-8008-a6072bd6b8cb'),
  radius8: source('radius.8', '482a7222-5a3b-8086-8008-a6072bcd81d1'),
} as const satisfies Readonly<Record<RadiusToken, ReturnType<typeof source>>>);
