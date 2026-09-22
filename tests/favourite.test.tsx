import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import { Children } from 'react';

import FavouriteStories, {
  Boundaries as FavouriteBoundaries,
  Interactive as FavouriteInteractive,
  Variants as FavouriteVariants,
} from '../src/design-system/components/actions/Favourite.stories';

import {
  Favourite,
  type FavouriteProps,
} from '../src/design-system/components/actions/Favourite';

import * as actions from '../src/design-system/components/actions';

import { favouriteFixtures } from '../src/design-system/stories/fixtures';

describe('Favourite controlled public contract', () => {
  it('emits the opposite checked value once and remains controlled until rerender', async () => {
    const onCheckedChange = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <Favourite
        accessibilityLabel="Add Alex to favourites"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const subject = screen.getByRole('checkbox', {
      checked: false,
      name: 'Add Alex to favourites',
    });
    await user.press(subject);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(subject.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
    expect(
      screen.queryByTestId('favourite-selected-fill', {
        includeHiddenElements: true,
      }),
    ).toBeNull();

    await screen.rerender(
      <Favourite
        accessibilityLabel="Add Alex to favourites"
        checked
        onCheckedChange={onCheckedChange}
      />,
    );
    expect(
      screen.getByRole('checkbox', {
        checked: true,
        name: 'Add Alex to favourites',
      }),
    ).toBeTruthy();
    expect(
      screen.getByTestId('favourite-selected-fill', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
    expect(
      screen.getByTestId('artwork-favourite-heart', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('blocks disabled changes and keeps exact 44-point geometry', async () => {
    const onCheckedChange = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <Favourite
        accessibilityLabel="Add Alex to favourites"
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const subject = screen.getByRole('checkbox', {
      checked: false,
      disabled: true,
      name: 'Add Alex to favourites',
    });
    await user.press(subject);

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(subject.props.hitSlop).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
    expect(flattenedStyle(subject.props.style)).toEqual(
      expect.objectContaining({
        minHeight: 44,
        minWidth: 44,
      }),
    );
  });

  it('rejects blank names, invalid controlled values, and simulated transient props', () => {
    const onCheckedChange = jest.fn();
    expect(() =>
      Favourite({
        accessibilityLabel: '',
        checked: false,
        onCheckedChange,
      }),
    ).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty accessibility label/u,
    );
    expect(() =>
      Favourite({
        accessibilityLabel: 'Favourite',
        checked: 'mixed',
        onCheckedChange,
      } as unknown as FavouriteProps),
    ).toThrow(/Unsupported design-system value: mixed/u);
    expect(() =>
      Favourite({
        accessibilityLabel: 'Favourite',
        checked: false,
        onCheckedChange,
        pressed: true,
      } as unknown as FavouriteProps),
    ).toThrow(/Unsupported design-system value: pressed/u);
  });
});

describe('Favourite Storybook and action barrel contract', () => {
  it('publishes only the bounded action components and their public registries', () => {
    expect(Object.keys(actions).sort()).toEqual([
      'Button',
      'Favourite',
      'IconButton',
    ]);
  });

  it('publishes the exact group, declared configurations, and long-name target boundary', () => {
    expect(FavouriteStories.title).toBe('Actions/Favourite');
    expect(FavouriteStories.argTypes).toEqual(
      expect.objectContaining({
        checked: { control: 'boolean' },
        disabled: { control: 'boolean' },
        onCheckedChange: { action: 'checked changed' },
      }),
    );
    const variants = FavouriteVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(Children.toArray(variants.props.children)).toHaveLength(
      favouriteFixtures.length,
    );

    const boundaries = FavouriteBoundaries.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    expect(JSON.stringify(boundaries)).toContain('200%');
    expect(JSON.stringify(boundaries)).toContain('44-point');
  });

  it('keeps the interactive story accessible name stable when checked changes', async () => {
    const story = FavouriteInteractive.render?.(
      {
        accessibilityLabel: 'Alex favourite',
        checked: false,
        onCheckedChange: jest.fn(),
      },
      {} as never,
    ) as React.ReactElement;
    const screen = await render(story);
    const unchecked = screen.getByRole('checkbox', {
      checked: false,
      name: 'Alex favourite',
    });

    await userEvent.setup().press(unchecked);

    expect(
      screen.getByRole('checkbox', { checked: true, name: 'Alex favourite' }),
    ).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: /add|remove/iu })).toBeNull();
  });
});
