import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  colors,
  layoutWidths,
  spacing,
  type LayoutWidthToken,
} from '../tokens';

export type StoryFrameWidth = LayoutWidthToken;

export function StoryFrame({
  children,
  width,
}: Readonly<{ children: ReactNode; width: StoryFrameWidth }>) {
  return (
    <View
      accessibilityLabel={`${layoutWidths[width]} pixel review frame`}
      style={[styles.frame, { width: layoutWidths[width] }]}
      testID={`story-frame-${width}`}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'flex-start',
    backgroundColor: colors.canvas,
    maxWidth: '100%',
    padding: spacing.space16,
  },
});
