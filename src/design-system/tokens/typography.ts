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
