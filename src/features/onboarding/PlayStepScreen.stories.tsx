import type { Meta, StoryObj } from '@storybook/react-native';
import { PlayStepScreen } from './PlayStepScreen';

const meta = {
  title: 'Screens/Onboarding/How you play',
  component: PlayStepScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    initialDraft: { level: null, side: null, vibe: null },
    onDraftChange: () => undefined,
    onBack: () => undefined,
    onContinue: async () => undefined,
  },
} satisfies Meta<typeof PlayStepScreen>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Canonical: Story = {};
export const Selected: Story = {
  args: { initialDraft: { level: 'improver', side: 'either', vibe: 'social' } },
};
export const SaveFailure: Story = {
  args: {
    initialDraft: Selected.args?.initialDraft,
    onContinue: async () => {
      throw new Error('Unavailable');
    },
  },
};
