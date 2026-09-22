import { describe, expect, it } from '@jest/globals';

import { render } from '@testing-library/react-native';

import {} from '../src/design-system/stories/fixtures';

import { StepProgress } from '../src/design-system/components/progress/StepProgress';

describe('Step Progress runtime and semantic contract', () => {
  it.each([
    [1, 'Step 1 of 3'],
    [2, 'Step 2 of 3'],
    [3, 'Step 3 of 3'],
  ] as [1 | 2 | 3, string][])(
    'renders exact active step %i',
    async (value, label) => {
      const screen = await render(<StepProgress value={value} />);
      const progress = screen.getByRole('progressbar', { name: label });
      expect(progress).toHaveAccessibilityValue({
        min: 1,
        max: 3,
        now: value,
        text: label,
      });
      expect(screen.getByText(label)).toBeTruthy();
    },
  );

  it('renders explicit completion text/value', async () => {
    const screen = await render(<StepProgress value="complete" />);
    const progress = screen.getByRole('progressbar', {
      name: 'Setup complete',
    });
    expect(progress).toHaveAccessibilityValue({
      min: 1,
      max: 3,
      now: 3,
      text: 'Setup complete',
    });
    expect(screen.getByText('Setup complete')).toBeTruthy();
  });

  it.each([0, 4, null, undefined, '3', 'done'])(
    'rejects arbitrary progress %p',
    (value) => {
      expect(() => StepProgress({ value } as never)).toThrow(
        /Unsupported Step Progress/u,
      );
    },
  );
});
