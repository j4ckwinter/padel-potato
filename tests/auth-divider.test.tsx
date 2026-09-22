import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle } from './helpers/componentTest';

import { render } from '@testing-library/react-native';

import React from 'react';

import {
  AuthDivider,
  type AuthDividerProps,
} from '../src/design-system/components/authentication/AuthDivider';

describe('AuthDivider static public contract', () => {
  it('renders readable default or custom content at exact geometry with hidden rules', async () => {
    const screen = await render(<AuthDivider />);
    const label = screen.getByText('or');
    const container = screen.getByTestId('auth-divider');
    const rules = screen.getAllByTestId(/auth-divider-rule/u, {
      includeHiddenElements: true,
    });

    expect(label).toBeTruthy();
    expect(flattenedStyle(container.props.style)).toEqual(
      expect.objectContaining({
        minHeight: 24,
        width: '100%',
      }),
    );
    expect(rules).toHaveLength(2);
    expect(
      rules.every(
        (rule) =>
          rule.props.accessible === false &&
          rule.props.accessibilityElementsHidden === true &&
          rule.props.importantForAccessibility === 'no-hide-descendants',
      ),
    ).toBe(true);
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    await screen.rerender(<AuthDivider label="or continue with email" />);
    expect(screen.getByText('or continue with email')).toBeTruthy();
  });

  it('rejects blank required content and all interaction or state props', () => {
    expect(() => AuthDivider({ label: '' })).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty label/u,
    );
    expect(() => AuthDivider({ label: '   ' })).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty label/u,
    );
    expect(() =>
      AuthDivider({ onPress: jest.fn() } as unknown as AuthDividerProps),
    ).toThrow(/Unsupported design-system value: onPress/u);
    expect(() =>
      AuthDivider({ disabled: true } as unknown as AuthDividerProps),
    ).toThrow(/Unsupported design-system value: disabled/u);
  });
});
