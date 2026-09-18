import type { Preview } from '@storybook/react-native';

import { FoundationFontGate } from '../src/design-system/fonts/FoundationFontGate';

const preview: Preview = {
  decorators: [
    (Story) => (
      <FoundationFontGate>
        <Story />
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
