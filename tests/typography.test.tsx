import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

const mockUseFonts = jest.fn<() => [boolean, Error | null]>();

jest.mock('expo-font', () => ({
  useFonts: () => mockUseFonts(),
}));

import { FoundationFontGate } from '../src/design-system/fonts/FoundationFontGate';
import { colors, spacing } from '../src/design-system/tokens';
import preview from '../.rnstorybook/preview';

const content = <Text>Authoritative typography specimen</Text>;

describe('FoundationFontGate', () => {
  it('hides children behind an accessible loading state while fonts are pending', async () => {
    mockUseFonts.mockReturnValue([false, null]);

    const { getByLabelText, queryByText } = await render(
      <FoundationFontGate>{content}</FoundationFontGate>,
    );

    expect(
      getByLabelText('Loading foundation fonts').props.accessibilityState,
    ).toEqual({ busy: true });
    expect(queryByText('Authoritative typography specimen')).toBeNull();
  });

  it('is applied once at the shared Storybook preview boundary', async () => {
    mockUseFonts.mockReturnValue([false, null]);
    const decorators = preview.decorators as unknown as Array<
      (Story: () => React.JSX.Element) => React.JSX.Element
    >;
    const decorator = decorators[0];

    expect(decorators).toHaveLength(1);
    const { getByLabelText, queryByTestId, queryByText } = await render(
      decorator(() => <Text>Storybook typography specimen</Text>),
    );
    expect(getByLabelText('Loading foundation fonts')).toBeVisible();
    expect(queryByTestId('storybook-catalogue-frame')).toBeNull();
    expect(queryByText('Storybook typography specimen')).toBeNull();
  });

  it('composes the token-backed mobile catalogue frame inside the font gate', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    const decorators = preview.decorators as unknown as Array<
      (Story: () => React.JSX.Element) => React.JSX.Element
    >;

    const { getByTestId, getByText } = await render(
      decorators[0](() => <Text>Framed Storybook specimen</Text>),
    );

    expect(getByTestId('storybook-catalogue-frame')).toHaveStyle({
      backgroundColor: colors.canvas,
      flex: 1,
      gap: spacing.space24,
      paddingHorizontal: spacing.space16,
      paddingVertical: spacing.space24,
    });
    expect(getByText('Framed Storybook specimen')).toBeVisible();
  });

  it('renders children only after all authoritative font assets load', async () => {
    mockUseFonts.mockReturnValue([true, null]);

    const { getByText, queryByLabelText } = await render(
      <FoundationFontGate>{content}</FoundationFontGate>,
    );

    expect(getByText('Authoritative typography specimen')).toBeVisible();
    expect(queryByLabelText('Loading foundation fonts')).toBeNull();
  });

  it('shows an accessible diagnostic and withholds children after a load error', async () => {
    mockUseFonts.mockReturnValue([
      false,
      new Error('Inter 600 could not be decoded'),
    ]);

    const { getByLabelText, getByText, queryByText } = await render(
      <FoundationFontGate>{content}</FoundationFontGate>,
    );

    expect(getByLabelText('Foundation fonts failed to load')).toBeVisible();
    expect(getByText('Inter 600 could not be decoded')).toBeVisible();
    expect(queryByText('Authoritative typography specimen')).toBeNull();
  });

  it('takes the deterministic ready path when a manifest uses only system fonts', async () => {
    mockUseFonts.mockClear();

    const { getByText } = await render(
      <FoundationFontGate assets={{}}>{content}</FoundationFontGate>,
    );

    expect(getByText('Authoritative typography specimen')).toBeVisible();
    expect(mockUseFonts).not.toHaveBeenCalled();
  });
});
