import type { Preview } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { FoundationFontGate } from '../src/design-system/fonts/FoundationFontGate';
import { colors, spacing } from '../src/design-system/tokens';

const styles = StyleSheet.create({
  catalogueFrame: {
    backgroundColor: colors.canvas,
    flex: 1,
    gap: spacing.space24,
    paddingHorizontal: spacing.space16,
    paddingVertical: spacing.space24,
  },
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <FoundationFontGate>
        <View style={styles.catalogueFrame} testID="storybook-catalogue-frame">
          <Story />
        </View>
      </FoundationFontGate>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
