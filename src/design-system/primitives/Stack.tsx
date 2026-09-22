import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { spacing, type SpacingToken } from '../tokens';
import {
  containerLayoutStyleKeys,
  containerOwnedStyleKeys,
  guardStructuralStyle,
  resolveDesignToken,
  resolveLayoutTokenProps,
  type ContainerLayoutStyle,
  type LayoutTokenProps,
} from './styleGuards';

const alignments = {
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
} as const satisfies Readonly<Record<string, ViewStyle['alignItems']>>;

const justifications = {
  center: 'center',
  end: 'flex-end',
  spaceAround: 'space-around',
  spaceBetween: 'space-between',
  spaceEvenly: 'space-evenly',
  start: 'flex-start',
} as const satisfies Readonly<Record<string, ViewStyle['justifyContent']>>;

export type LayoutAlignment = keyof typeof alignments;
export type LayoutJustification = keyof typeof justifications;

export type StackProps = Omit<ViewProps, 'style'> &
  LayoutTokenProps & {
    align?: LayoutAlignment;
    gap?: SpacingToken;
    justify?: LayoutJustification;
    padding?: SpacingToken;
    style?: StyleProp<ContainerLayoutStyle>;
  };

export function Stack({
  align = 'stretch',
  gap = 'space16',
  height,
  justify = 'start',
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
  padding,
  style,
  width,
  ...props
}: StackProps) {
  guardStructuralStyle(
    style,
    containerOwnedStyleKeys,
    containerLayoutStyleKeys,
  );

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

  const ownedStyle: ViewStyle = {
    alignItems: resolveDesignToken(alignments, align),
    flexDirection: 'column',
    gap: resolveDesignToken(spacing, gap),
    justifyContent: resolveDesignToken(justifications, justify),
    ...(padding === undefined
      ? undefined
      : { padding: resolveDesignToken(spacing, padding) }),
  };

  return <View {...props} style={[style, layoutStyle, ownedStyle]} />;
}
