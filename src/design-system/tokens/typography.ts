import type { TextStyle } from 'react-native';

export const fontAssets = Object.freeze({
  Inter_400Regular: require('../../../assets/fonts/Inter-Regular.ttf'),
  Inter_600SemiBold: require('../../../assets/fonts/Inter-SemiBold.ttf'),
  Inter_700Bold: require('../../../assets/fonts/Inter-Bold.ttf'),
} as const);

export type FoundationFontFamily = keyof typeof fontAssets;

export const fontProvenance = Object.freeze({
  family: 'Inter',
  version: '4.1',
  license: 'SIL Open Font License 1.1',
  licenseFile: 'assets/fonts/OFL.txt',
  officialRepository: 'https://github.com/rsms/inter',
  officialRelease:
    'https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip',
  googleFontsMetadata:
    'https://github.com/google/fonts/blob/main/ofl/inter/METADATA.pb',
  archiveSha256:
    '9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e',
} as const);

type FoundationTextStyle = Readonly<
  TextStyle & {
    fontFamily: FoundationFontFamily;
    fontStyle: 'normal';
    fontWeight: '400' | '600' | '700';
  }
>;

const style = <T extends FoundationTextStyle>(value: T) => Object.freeze(value);

export const typography = Object.freeze({
  body: style({
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: 16.8,
    letterSpacing: 0,
  }),
  bodyStrong: style({
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
  }),
  caption: style({
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: 13.2,
    letterSpacing: 0,
  }),
  display: style({
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 33.6,
    letterSpacing: 0,
  }),
  heading: style({
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 21.6,
    letterSpacing: 0,
  }),
  label: style({
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 14.4,
    letterSpacing: 0,
  }),
  micro: style({
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 12,
    letterSpacing: 0,
  }),
  section: style({
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 24,
    letterSpacing: 0,
  }),
  title: style({
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 30,
    letterSpacing: 0,
  }),
} as const satisfies Readonly<Record<string, FoundationTextStyle>>);

export type TypographyToken = keyof typeof typography;

const source = (
  designName: string,
  sourceId: string,
  sourceWeight: 400 | 600 | 700,
  runtimeFamily: FoundationFontFamily,
) =>
  Object.freeze({
    designName,
    sourceId,
    sourceFamily: 'Inter',
    sourceWeight,
    runtimeFamily,
    fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
    pageId: '482a7222-5a3b-8086-8008-a6072bd7e924',
    revision: 292,
  } as const);

export const typographySources = Object.freeze({
  body: source(
    'Body',
    '482a7222-5a3b-8086-8008-a6072b69005a',
    400,
    'Inter_400Regular',
  ),
  bodyStrong: source(
    'Body Strong',
    '482a7222-5a3b-8086-8008-a6072b4a8597',
    600,
    'Inter_600SemiBold',
  ),
  caption: source(
    'Caption',
    '482a7222-5a3b-8086-8008-a6072b84b5bb',
    400,
    'Inter_400Regular',
  ),
  display: source(
    'Display',
    '482a7222-5a3b-8086-8008-a6072aee7656',
    700,
    'Inter_700Bold',
  ),
  heading: source(
    'Heading',
    '482a7222-5a3b-8086-8008-a6072b33c237',
    700,
    'Inter_700Bold',
  ),
  label: source(
    'Label',
    '482a7222-5a3b-8086-8008-a6072b76f580',
    600,
    'Inter_600SemiBold',
  ),
  micro: source(
    'Micro',
    '482a7222-5a3b-8086-8008-a6072b92b5b9',
    600,
    'Inter_600SemiBold',
  ),
  section: source(
    'Section',
    '482a7222-5a3b-8086-8008-a6072b1ca408',
    700,
    'Inter_700Bold',
  ),
  title: source(
    'Title',
    '482a7222-5a3b-8086-8008-a6072b05bfb9',
    700,
    'Inter_700Bold',
  ),
} as const satisfies Readonly<
  Record<TypographyToken, ReturnType<typeof source>>
>);
