import { describe, expect, it, jest } from '@jest/globals';

import { invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import {} from '../src/design-system/stories/fixtures';

import { StatusChip } from '../src/design-system/components/status/StatusChip';

describe('Status Chip runtime and semantic contract', () => {
  it.each(['neutral', 'success', 'warning', 'info', 'error'] as const)(
    'renders %s/default as static labelled content',
    async (style) => {
      const screen = await render(
        <StatusChip
          label={`${style} status`}
          style={style}
          variant="default"
        />,
      );
      expect(screen.getByText(`${style} status`)).toBeTruthy();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    },
  );

  it('emits the next selected value without changing controlled state', async () => {
    const onSelectedChange = jest.fn();
    const screen = await render(
      <StatusChip
        label="Confirmed"
        onSelectedChange={onSelectedChange}
        selected
        style="success"
        variant="selectable"
      />,
    );
    const chip = screen.getByRole('checkbox', { name: 'Confirmed' });
    expect(chip).toBeChecked();
    await userEvent.setup().press(chip);
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(chip).toBeChecked();
  });

  it('exposes the authored disabled branch and suppresses activation', async () => {
    const screen = await render(
      <StatusChip label="Unavailable" style="neutral" variant="disabled" />,
    );
    const chip = screen.getByRole('button', { name: 'Unavailable' });
    expect(chip).toBeDisabled();
    await userEvent.setup().press(chip);
    expect(chip).toBeDisabled();
  });

  it.each([
    { label: 'Wrong', style: 'warning', variant: 'selectable' },
    {
      label: 'Wrong',
      onSelectedChange: jest.fn(),
      selected: true,
      style: 'success',
      variant: 'default',
    },
    { label: 'Wrong', style: 'success', variant: 'disabled' },
    { label: '', style: 'neutral', variant: 'default' },
  ])('rejects an unsupported chip tuple %#', (props) => {
    expect(() => StatusChip(invalidProps(props))).toThrow(
      /Unsupported Status Chip/u,
    );
  });
});
