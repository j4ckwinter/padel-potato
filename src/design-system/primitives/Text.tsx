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
import {
  guardStructuralStyle,
  resolveDesignToken,
  resolveLayoutTokenProps,
  type ContainerLayoutStyle,
  type LayoutTokenProps,
} from './styleGuards';

const textLayoutStyleKeys = [
  'alignSelf',
  'bottom',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'left',
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

export type TextLayoutStyle = ContainerLayoutStyle &
  Pick<TextStyle, 'textAlign'>;

export type TextProps = Omit<NativeTextProps, 'style'> &
  LayoutTokenProps & {
    color?: ColorToken;
    style?: StyleProp<TextLayoutStyle>;
    variant: TypographyToken;
  };

export function Text({
  color = 'ink',
  height,
  margin,
  marginBottom,
  marginHorizontal,
  marginLeft,
  marginRight,
  marginTop,
  marginVertical,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  style,
  variant,
  width,
  ...props
}: TextProps) {
  guardStructuralStyle(style, textOwnedStyleKeys, textLayoutStyleKeys);

  const typographyStyle = resolveDesignToken(typography, variant);
  const textColor = resolveDesignToken(colors, color);
  const layoutStyle = resolveLayoutTokenProps({
    height,
    margin,
    marginBottom,
    marginHorizontal,
    marginLeft,
    marginRight,
    marginTop,
    marginVertical,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    width,
  });

  return (
    <NativeText
      {...props}
      style={[style, layoutStyle, typographyStyle, { color: textColor }]}
    />
  );
}
