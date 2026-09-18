import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { spacing, type SpacingToken } from '../tokens';
import type { LayoutAlignment, LayoutJustification } from './Stack';
import {
  containerLayoutStyleKeys,
  containerOwnedStyleKeys,
  guardStyle,
  resolveBooleanDesignValue,
  resolveDesignToken,
  type ContainerLayoutStyle,
} from './styleGuards';

const alignments = {
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
} as const satisfies Readonly<Record<LayoutAlignment, ViewStyle['alignItems']>>;

const justifications = {
  center: 'center',
  end: 'flex-end',
  spaceAround: 'space-around',
  spaceBetween: 'space-between',
  spaceEvenly: 'space-evenly',
  start: 'flex-start',
} as const satisfies Readonly<
  Record<LayoutJustification, ViewStyle['justifyContent']>
>;

export type InlineProps = Omit<ViewProps, 'style'> & {
  align?: LayoutAlignment;
  gap?: SpacingToken;
  justify?: LayoutJustification;
  padding?: SpacingToken;
  style?: StyleProp<ContainerLayoutStyle>;
  wrap?: boolean;
};

export function Inline({
  align = 'stretch',
  gap = 'space16',
  justify = 'start',
  padding,
  style,
  wrap = false,
  ...props
}: InlineProps) {
  guardStyle(style, containerOwnedStyleKeys, containerLayoutStyleKeys);

  const ownedStyle: ViewStyle = {
    alignItems: resolveDesignToken(alignments, align),
    flexDirection: 'row',
    flexWrap: resolveBooleanDesignValue(wrap, 'wrap', 'nowrap'),
    gap: resolveDesignToken(spacing, gap),
    justifyContent: resolveDesignToken(justifications, justify),
    ...(padding === undefined
      ? undefined
      : { padding: resolveDesignToken(spacing, padding) }),
  };

  return <View {...props} style={[style, ownedStyle]} />;
}
