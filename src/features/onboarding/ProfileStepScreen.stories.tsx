import type { Meta, StoryObj } from '@storybook/react-native';

import { ProfileStepScreen } from './ProfileStepScreen';

const meta = {
  title: 'Screens/Onboarding/Your profile',
  component: ProfileStepScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    initialDraft: { displayName: '', homeLocation: '', photoUri: null },
    onContinue: (): void | Promise<void> => undefined,
    onPickPhoto: async () => null,
  },
} satisfies Meta<typeof ProfileStepScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {};
export const ReturningDraft: Story = {
  args: {
    initialDraft: {
      displayName: 'Jack',
      homeLocation: 'London',
      photoUri: null,
    },
  },
};
export const SaveFailure: Story = {
  args: {
    onContinue: async () => {
      throw new Error('Unavailable');
    },
  },
};
