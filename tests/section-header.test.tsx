import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import {
  SectionHeader,
  type SectionHeaderProps,
} from '../src/design-system/components/navigation/SectionHeader';

describe('SectionHeader optional action pair', () => {
  it('declares an effective 44-point action within independent wrapper clearance', async () => {
    const onActionPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <SectionHeader
        actionLabel="See all ›"
        onActionPress={onActionPress}
        title="Open games near you"
      />,
    );
    const action = screen.getByRole('button', { name: 'See all ›' });
    expect(action.props.hitSlop).toEqual({
      bottom: 2,
      left: 2,
      right: 2,
      top: 2,
    });
    expect(flattenedStyle(action.props.style)).toEqual(
      expect.objectContaining({
        minHeight: 40,
        minWidth: 40,
      }),
    );
    const visualRowStyle = flattenedStyle(
      screen.getByTestId('section-header-visual-row').props.style,
    );
    const wrapperStyle = flattenedStyle(
      screen.getByTestId('section-header').props.style,
    );
    const actionContentStyle = flattenedStyle(
      screen.getByTestId('section-header-action-content').props.style,
    );
    expect(visualRowStyle).toEqual(
      expect.objectContaining({ minHeight: 28, width: '100%' }),
    );
    expect(wrapperStyle).toEqual(
      expect.objectContaining({ minHeight: 44, width: '100%' }),
    );
    expect(actionContentStyle).toEqual(
      expect.objectContaining({ minHeight: 40, paddingLeft: 8 }),
    );
    expect(actionContentStyle.paddingRight).toBeUndefined();
    expect(action.props.hitSlop.left + action.props.hitSlop.right).toBe(4);
    expect(flattenedStyle(action.props.style).minHeight).toBe(40);
    await user.press(action);
    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  it('rejects partial, blank, and routing-shaped action contracts', () => {
    expect(() =>
      SectionHeader({
        actionLabel: 'See all ›',
        title: 'Games',
      } as unknown as SectionHeaderProps),
    ).toThrow(
      /actionLabel and onActionPress must both be present or both be absent/u,
    );
    expect(() =>
      SectionHeader({
        onActionPress: jest.fn(),
        title: 'Games',
      } as unknown as SectionHeaderProps),
    ).toThrow(
      /actionLabel and onActionPress must both be present or both be absent/u,
    );
    expect(() =>
      SectionHeader({
        actionLabel: ' ',
        onActionPress: jest.fn(),
        title: 'Games',
      }),
    ).toThrow(/non-empty action label/u);
    expect(() =>
      SectionHeader({
        navigate: jest.fn(),
        title: 'Games',
      } as unknown as SectionHeaderProps),
    ).toThrow(/Unsupported design-system value: navigate/u);
  });
});
