import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import {
  borders,
  colors,
  radii,
  spacing,
  type BorderToken,
  type ColorToken,
  type RadiusToken,
  type SpacingToken,
} from '../tokens';
import {
  containerLayoutStyleKeys,
  guardStyle,
  resolveDesignToken,
  type ContainerLayoutStyle,
} from './styleGuards';

const surfaceOwnedStyleKeys = [
  'backgroundColor',
  'borderBottomColor',
  'borderBottomEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderBottomWidth',
  'borderColor',
  'borderEndColor',
  'borderEndWidth',
  'borderLeftColor',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightWidth',
  'borderStartColor',
  'borderStartWidth',
  'borderTopColor',
  'borderTopEndRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderTopWidth',
  'borderWidth',
  'boxShadow',
  'elevation',
  'padding',
  'paddingBottom',
  'paddingEnd',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
] as const satisfies readonly (keyof ViewStyle)[];

export type SurfaceProps = Omit<ViewProps, 'style'> & {
  background?: ColorToken;
  borderColor?: ColorToken;
  borderWidth?: BorderToken;
  padding?: SpacingToken;
  radius?: RadiusToken;
  style?: StyleProp<ContainerLayoutStyle>;
};

export function Surface({
  background = 'surface',
  borderColor,
  borderWidth,
  padding = 'space16',
  radius,
  style,
  ...props
}: SurfaceProps) {
  guardStyle(style, surfaceOwnedStyleKeys, containerLayoutStyleKeys);

  const ownedStyle: ViewStyle = {
    backgroundColor: resolveDesignToken(colors, background),
    padding: resolveDesignToken(spacing, padding),
    ...(borderColor === undefined
      ? undefined
      : { borderColor: resolveDesignToken(colors, borderColor) }),
    ...(borderWidth === undefined
      ? undefined
      : { borderWidth: resolveDesignToken(borders, borderWidth) }),
    ...(radius === undefined
      ? undefined
      : { borderRadius: resolveDesignToken(radii, radius) }),
  };

  return <View {...props} style={[style, ownedStyle]} />;
}
