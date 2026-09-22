import {
  Text as NativeText,
  type StyleProp,
  type TextProps as NativeTextProps,
  type TextStyle,
} from 'react-native';

import {
  colors,
  typography,
  type ColorToken,
  type TypographyToken,
} from '../tokens';
import { guardStyle, resolveDesignToken } from './styleGuards';

const textLayoutStyleKeys = [
  'alignSelf',
  'bottom',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'height',
  'left',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'position',
  'right',
  'textAlign',
  'top',
  'width',
] as const satisfies readonly (keyof TextStyle)[];

const textOwnedStyleKeys = [
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
] as const satisfies readonly (keyof TextStyle)[];

export type TextLayoutStyle = Pick<
  TextStyle,
  (typeof textLayoutStyleKeys)[number]
>;

export type TextProps = Omit<NativeTextProps, 'style'> & {
  color?: ColorToken;
  style?: StyleProp<TextLayoutStyle>;
  variant: TypographyToken;
};

export function Text({ color = 'ink', style, variant, ...props }: TextProps) {
  guardStyle(style, textOwnedStyleKeys, textLayoutStyleKeys);

  const typographyStyle = resolveDesignToken(typography, variant);
  const textColor = resolveDesignToken(colors, color);

  return (
    <NativeText
      {...props}
      style={[style, typographyStyle, { color: textColor }]}
    />
  );
}
