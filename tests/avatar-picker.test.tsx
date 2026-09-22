import { describe, expect, it, jest } from '@jest/globals';

import { invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import {} from '../src/design-system/stories/fixtures';

import {
  AvatarPicker,
  type AvatarPickerProps,
} from '../src/design-system/components/identity/AvatarPicker';

const rejectedImageSources = [
  { uri: 'ftp://example.com/player.webp' },
  { uri: 'blob:https://example.com/player-id' },
  { uri: 'ws://example.com/player.webp' },
  { uri: '//example.com/player.webp' },
  { uri: 'player.webp' },
] as const;

describe('Avatar Picker runtime and semantic contract', () => {
  it.each([
    ['empty', 'Add a profile photo', 136],
    ['initials', 'Change profile photo', 136],
    ['photo', 'Change profile photo', 136],
    ['error', 'Add a profile photo', 160],
  ] as ['empty' | 'initials' | 'photo' | 'error', string, number][])(
    'renders the controlled %s branch as one named button',
    async (variant, name, height) => {
      const common = { onPress: jest.fn(), variant } as const;
      const props =
        variant === 'initials'
          ? { ...common, initials: 'AM' }
          : variant === 'photo'
            ? { ...common, source: { uri: 'file:///profile.webp' } }
            : common;
      const screen = await render(
        <AvatarPicker {...(props as AvatarPickerProps)} />,
      );

      expect(screen.getByRole('button', { name })).toHaveStyle({ height });
      if (variant === 'error') {
        expect(screen.getByText('Choose a JPG or PNG under 5 MB')).toBeTruthy();
        expect(
          screen.getByRole('button', { name }).props.accessibilityHint,
        ).toBe('Choose a JPG or PNG under 5 MB');
      }
    },
  );

  it('emits intent without mutating its controlled content', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <AvatarPicker onPress={onPress} variant="empty" />,
    );

    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Add a profile photo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'Add a profile photo' }),
    ).toBeTruthy();
  });

  it.each([
    { initials: 'AM', onPress: jest.fn(), variant: 'empty' },
    {
      onPress: jest.fn(),
      source: { uri: 'https://example.com/photo.jpg' },
      variant: 'photo',
    },
    { onPress: null, variant: 'empty' },
    { onPress: jest.fn(), variant: 'selected' },
  ])('rejects an unsupported picker configuration %#', (props) => {
    expect(() => AvatarPicker(invalidProps(props))).toThrow(
      /Unsupported Avatar Picker/u,
    );
  });

  it.each([
    ...rejectedImageSources,
    'ftp://example.com/player.webp',
    'file:///bare-string.webp',
  ])('rejects a non-local or malformed picker source %#', (source) => {
    expect(() =>
      AvatarPicker({
        onPress: jest.fn(),
        source,
        variant: 'photo',
      } as never),
    ).toThrow(/bundled or local image source/u);
  });
});
