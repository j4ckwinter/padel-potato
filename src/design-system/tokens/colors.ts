const source = (designName: string, sourceId: string) =>
  Object.freeze({
    designName,
    sourceId,
    fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
    pageId: '482a7222-5a3b-8086-8008-a6072bd7e924',
    revision: 292,
  } as const);

export const colors = Object.freeze({
  accent: '#ade533',
  border: '#edede8',
  canvas: '#fbf8f0',
  danger: '#ffd6d6',
  deep: '#384540',
  info: '#d6edfa',
  ink: '#0e1716',
  muted: '#636b6e',
  olive: '#636657',
  surface: '#ffffff',
  surfaceAccent: '#d1f28a',
  surfaceMuted: '#f0f0eb',
  textSecondary: '#3b4742',
  warning: '#ffeb9e',
  focusRing: '#ADE533',
} as const);

export type ColorToken = keyof typeof colors;

export const colorSources = Object.freeze({
  accent: source('color.accent', '482a7222-5a3b-8086-8008-a6072ba51242'),
  border: source('color.border', '482a7222-5a3b-8086-8008-a6072bb99dbc'),
  canvas: source('color.canvas', '482a7222-5a3b-8086-8008-a6072bb32981'),
  danger: source('color.danger', '482a7222-5a3b-8086-8008-a6072bbb5f25'),
  deep: source('color.deep', '482a7222-5a3b-8086-8008-a6072bb124b3'),
  info: source('color.info', '482a7222-5a3b-8086-8008-a6072bb836a8'),
  ink: source('color.ink', '482a7222-5a3b-8086-8008-a6072ba7fed1'),
  muted: source('color.muted', '482a7222-5a3b-8086-8008-a6072bbd0527'),
  olive: source('color.olive', '482a7222-5a3b-8086-8008-a6072bb6a79d'),
  surface: source('color.surface', '482a7222-5a3b-8086-8008-a6072babe9c2'),
  surfaceAccent: source(
    'color.surfaceAccent',
    '482a7222-5a3b-8086-8008-a6072baa38e7',
  ),
  surfaceMuted: source(
    'color.surfaceMuted',
    '482a7222-5a3b-8086-8008-a6072bad8395',
  ),
  textSecondary: source(
    'color.textSecondary',
    '482a7222-5a3b-8086-8008-a6072baf945e',
  ),
  warning: source('color.warning', '482a7222-5a3b-8086-8008-a6072bb4bf99'),
  focusRing: source('focus.ring.color', '482a7222-5a3b-8086-8008-a60e5ed0af1b'),
} as const satisfies Readonly<Record<ColorToken, ReturnType<typeof source>>>);
