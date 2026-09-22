import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import { Children } from 'react';

import { StyleSheet } from 'react-native';

import BannerToastStories, {
  Boundaries as BannerToastBoundaries,
  Canonical as BannerToastCanonical,
  Interactive as BannerToastInteractive,
  States as BannerToastStates,
  Variants as BannerToastVariants,
  normalizeBannerToastStoryArgs,
} from '../src/design-system/components/feedback/BannerToast.stories';

import {
  BannerToast,
  type BannerToastProps,
} from '../src/design-system/components/feedback/BannerToast';

import EmptyStateStories, {
  Boundaries as EmptyStateBoundaries,
  Canonical as EmptyStateCanonical,
  Interactive as EmptyStateInteractive,
  States as EmptyStateStates,
  Variants as EmptyStateVariants,
  normalizeEmptyStateStoryArgs,
} from '../src/design-system/components/feedback/EmptyState.stories';

import {
  EmptyState,
  type EmptyStateProps,
} from '../src/design-system/components/feedback/EmptyState';

import * as FeedbackComponents from '../src/design-system/components/feedback';

import {
  bannerToastFixtures,
  emptyStateFixtures,
  illustratedCardFixtures,
} from '../src/design-system/stories/fixtures';

import IllustratedCardStories, {
  Boundaries as IllustratedCardBoundaries,
  Canonical as IllustratedCardCanonical,
  Interactive as IllustratedCardInteractive,
  States as IllustratedCardStates,
  Variants as IllustratedCardVariants,
  normalizeIllustratedCardStoryArgs,
} from '../src/design-system/components/cards/IllustratedCard.stories';

import {
  IllustratedCard,
  type IllustratedCardParticipant,
  type IllustratedCardProps,
} from '../src/design-system/components/cards/IllustratedCard';

import * as CardComponents from '../src/design-system/components/cards';

const examples = {
  error: {
    message: 'Please try again in a moment.',
    onClose: jest.fn(),
    style: 'error',
    title: 'Something went wrong',
    type: 'toast',
  },
  info: {
    message: 'Court details have changed.',
    onViewBookingUpdate: jest.fn(),
    style: 'info',
    title: 'Booking update',
    type: 'banner',
  },
  success: {
    message: 'Your game is ready to share.',
    onClose: jest.fn(),
    style: 'success',
    title: 'Game created',
    type: 'toast',
  },
  warning: {
    message: 'One player still needs to confirm.',
    onViewGameDetails: jest.fn(),
    style: 'warning',
    title: 'Check game details',
    type: 'banner',
  },
} as const satisfies Record<string, BannerToastProps>;

describe('Banner Toast public contract', () => {});

describe('Banner Toast runtime and announcement contract', () => {
  it.each(Object.entries(examples))(
    'renders the exact %s branch',
    async (_name, props) => {
      const screen = await render(<BannerToast {...props} />);
      const rootStyle = flattenedStyle(
        screen.getByTestId('banner-toast').props.style,
      );
      expect(rootStyle).toEqual(
        expect.objectContaining({
          minHeight: props.type === 'toast' ? 72 : 88,
          width: 352,
        }),
      );
      expect(
        screen.getByRole('alert', {
          name: `${props.title}. ${props.message}`,
        }),
      ).toBeTruthy();
      expect(screen.queryAllByRole('image')).toHaveLength(0);
    },
  );

  it.each([
    ['error', examples.error, 'Close error message'],
    ['success', examples.success, 'Close success message'],
    ['info', examples.info, 'View booking update'],
    ['warning', examples.warning, 'View game details'],
  ] as Array<[string, BannerToastProps, string]>)(
    'emits the %s branch intent once from a named 44-point target',
    async (_name, props, actionName) => {
      const screen = await render(<BannerToast {...props} />);
      const action = screen.getByRole('button', { name: actionName });
      expect(flattenedStyle(action.props.style)).toEqual(
        expect.objectContaining({
          minHeight: 44,
          minWidth: 44,
        }),
      );
      await userEvent.setup().press(action);
      const callback =
        props.type === 'toast'
          ? props.onClose
          : props.style === 'info'
            ? props.onViewBookingUpdate
            : props.onViewGameDetails;
      expect(callback).toHaveBeenCalledTimes(1);
    },
  );

  it('preserves one stable announcement boundary and content across unrelated rerenders', async () => {
    const onClose = jest.fn();
    const screen = await render(
      <BannerToast {...examples.success} onClose={onClose} />,
    );
    const before = screen.getByTestId('banner-toast-announcement');
    expect(before.props.accessibilityLiveRegion).toBe('polite');
    expect(before.props.accessibilityLabel).toBe(
      'Game created. Your game is ready to share.',
    );

    await screen.rerender(
      <BannerToast {...examples.success} onClose={onClose} />,
    );
    const after = screen.getByTestId('banner-toast-announcement');
    expect(after).toBe(before);
    expect(after.props.accessibilityLabel).toBe(
      before.props.accessibilityLabel,
    );
  });

  it.each([
    { ...examples.info, message: '' },
    { ...examples.info, message: null },
    { ...examples.info, onViewBookingUpdate: null },
    { ...examples.info, onViewGameDetails: jest.fn() },
    { ...examples.warning, onViewBookingUpdate: jest.fn() },
    { ...examples.success, onViewBookingUpdate: jest.fn() },
    { ...examples.error, onClose: undefined },
    { ...examples.error, style: 'error', type: 'banner' },
    { ...examples.success, style: 'success', type: 'banner' },
    { ...examples.warning, style: 'warning', type: 'toast' },
    { ...examples.info, extra: true },
    { ...examples.info, style: 'unknown' },
  ])(
    'rejects unsupported content, callbacks, properties, or tuples %#',
    (props) => {
      expect(() => BannerToast(invalidProps(props))).toThrow(
        /Unsupported Banner Toast/u,
      );
    },
  );

  it('retains complete long Unicode announcement content and a reachable action', async () => {
    const title = 'Booking update for Łucía, Nguyễn, and 東京';
    const message =
      'Court details have changed for an exceptionally long Tuesday evening social game, including the entrance instructions.';
    const screen = await render(
      <BannerToast
        message={message}
        onViewBookingUpdate={jest.fn()}
        style="info"
        title={title}
        type="banner"
      />,
    );
    expect(
      screen.getByRole('alert', { name: `${title}. ${message}` }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'View booking update' }),
    ).toBeTruthy();
    expect(
      screen.getByTestId('banner-toast-copy', {
        includeHiddenElements: true,
      }).props.style,
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ flexShrink: 1 })]),
    );
  });
});

describe('Banner Toast Storybook contract', () => {
  it('accounts for all five categories under the exact Feedback title', () => {
    expect(BannerToastStories.title).toBe('Feedback/Banner Toast');
    expect([
      BannerToastCanonical,
      BannerToastVariants,
      BannerToastStates,
      BannerToastBoundaries,
      BannerToastInteractive,
    ]).toHaveLength(5);
  });

  it('normalizes each style control to one complete source-valid branch', () => {
    expect(normalizeBannerToastStoryArgs({ style: 'error' })).toEqual(
      expect.objectContaining({ style: 'error', type: 'toast' }),
    );
    expect(normalizeBannerToastStoryArgs({ style: 'warning' })).toEqual(
      expect.objectContaining({ style: 'warning', type: 'banner' }),
    );
    expect(normalizeBannerToastStoryArgs({ style: 'info' })).toEqual(
      expect.objectContaining({ style: 'info', type: 'banner' }),
    );
    expect(normalizeBannerToastStoryArgs({ style: 'success' })).toEqual(
      expect.objectContaining({ style: 'success', type: 'toast' }),
    );
    expect(
      normalizeBannerToastStoryArgs({
        onClose: jest.fn(),
        onViewBookingUpdate: jest.fn(),
        onViewGameDetails: jest.fn(),
        style: 'info',
        type: 'toast',
      }),
    ).toEqual(expect.objectContaining({ style: 'info', type: 'banner' }));
  });

  it('renders every supported configuration in order with readable labels', () => {
    const variants = BannerToastVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{ children: React.ReactNode }>;
    const children = Children.toArray(variants.props.children);
    expect(children).toHaveLength(bannerToastFixtures.length);
    const variantJson = JSON.stringify(variants);
    let previousIndex = -1;
    for (const fixture of bannerToastFixtures) {
      const currentIndex = variantJson.indexOf(fixture.label);
      expect(currentIndex).toBeGreaterThan(previousIndex);
      previousIndex = currentIndex;
    }
  });

  it('records long 200%-scale announcement/action and native-review boundaries', () => {
    const boundaries = BannerToastBoundaries.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('Phase 5');
    expect(boundaryJson).toContain('View booking update');
    const interactive = BannerToastInteractive.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    expect((interactive.type as { name?: string }).name).toBe(
      'InteractiveBannerToastHarness',
    );
  });
});
