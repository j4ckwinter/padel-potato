import type { Meta, StoryObj } from '@storybook/react-native';
import { AvailabilityStepScreen } from './AvailabilityStepScreen';

const meta = {
  title: 'Screens/Onboarding/When you play',
  component: AvailabilityStepScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    initialDraft: { days: [], times: [], frequency: null },
    onDraftChange: () => undefined,
    onBack: () => undefined,
    onFinish: async () => undefined,
  },
} satisfies Meta<typeof AvailabilityStepScreen>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Canonical: Story = {};
export const Selected: Story = {
  args: {
    initialDraft: {
      days: ['weekdays', 'saturday'],
      times: ['afternoon', 'evening'],
      frequency: 'three-or-more',
    },
  },
};
export const SaveFailure: Story = {
  args: {
    initialDraft: Selected.args?.initialDraft,
    onFinish: async () => {
      throw new Error('Unavailable');
    },
  },
};
