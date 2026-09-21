import { describe, expect, it, jest } from '@jest/globals';
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
import { phase4Families } from '../src/design-system/components/phase4SourceRegistry';

const bannerToastRecords = phase4Families[12].records;
const emptyStateRecords = phase4Families[13].records;

const flattenedStyle = (style: unknown) => StyleSheet.flatten(
  style as Parameters<typeof StyleSheet.flatten>[0],
) as Record<string, unknown>;

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

describe('Banner Toast source contract', () => {
  it('retains the four authored tuples and exact 352x72/88 geometry in source order', () => {
    expect(bannerToastRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { style: 'error', type: 'toast' },
      { style: 'warning', type: 'banner' },
      { style: 'info', type: 'banner' },
      { style: 'success', type: 'toast' },
    ]);
    expect(bannerToastRecords.map(({ metrics }) => metrics.normalized)).toEqual([
      { height: 72, width: 352 },
      { height: 88, width: 352 },
      { height: 88, width: 352 },
      { height: 72, width: 352 },
    ]);
  });
});

describe('Banner Toast runtime and announcement contract', () => {
  it.each(Object.entries(examples))('renders the exact %s branch', async (_name, props) => {
    const screen = await render(<BannerToast {...props} />);
    const rootStyle = flattenedStyle(screen.getByTestId('banner-toast').props.style);
    expect(rootStyle).toEqual(expect.objectContaining({
      minHeight: props.type === 'toast' ? 72 : 88,
      width: 352,
    }));
    expect(screen.getByRole('alert', {
      name: `${props.title}. ${props.message}`,
    })).toBeTruthy();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it.each([
    ['error', examples.error, 'Close error message'],
    ['success', examples.success, 'Close success message'],
    ['info', examples.info, 'View booking update'],
    ['warning', examples.warning, 'View game details'],
  ] as Array<[string, BannerToastProps, string]>)('emits the %s branch intent once from a named 44-point target', async (
    _name,
    props,
    actionName,
  ) => {
    const screen = await render(<BannerToast {...props} />);
    const action = screen.getByRole('button', { name: actionName });
    expect(flattenedStyle(action.props.style)).toEqual(expect.objectContaining({
      minHeight: 44,
      minWidth: 44,
    }));
    await userEvent.setup().press(action);
    const callback = props.type === 'toast'
      ? props.onClose
      : props.style === 'info'
        ? props.onViewBookingUpdate
        : props.onViewGameDetails;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('preserves one stable announcement boundary and content across unrelated rerenders', async () => {
    const onClose = jest.fn();
    const screen = await render(<BannerToast {...examples.success} onClose={onClose} />);
    const before = screen.getByTestId('banner-toast-announcement');
    expect(before.props.accessibilityLiveRegion).toBe('polite');
    expect(before.props.accessibilityLabel).toBe(
      'Game created. Your game is ready to share.',
    );

    await screen.rerender(<BannerToast {...examples.success} onClose={onClose} />);
    const after = screen.getByTestId('banner-toast-announcement');
    expect(after).toBe(before);
    expect(after.props.accessibilityLabel).toBe(before.props.accessibilityLabel);
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
  ])('rejects unsupported content, callbacks, properties, or tuples %#', (props) => {
    expect(() => BannerToast(props as never)).toThrow(/Unsupported Banner Toast/u);
  });

  it('retains complete long Unicode announcement content and a reachable action', async () => {
    const title = 'Booking update for Łucía, Nguyễn, and 東京';
    const message = 'Court details have changed for an exceptionally long Tuesday evening social game, including the entrance instructions.';
    const screen = await render(
      <BannerToast
        message={message}
        onViewBookingUpdate={jest.fn()}
        style="info"
        title={title}
        type="banner"
      />,
    );
    expect(screen.getByRole('alert', { name: `${title}. ${message}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View booking update' })).toBeTruthy();
    expect(screen.getByTestId('banner-toast-copy', {
      includeHiddenElements: true,
    }).props.style).toEqual(
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
    expect(normalizeBannerToastStoryArgs({
      onClose: jest.fn(),
      onViewBookingUpdate: jest.fn(),
      onViewGameDetails: jest.fn(),
      style: 'info',
      type: 'toast',
    })).toEqual(expect.objectContaining({ style: 'info', type: 'banner' }));
  });

  it('renders every source record in exact order with visible provenance', () => {
    const variants = BannerToastVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{ children: React.ReactNode }>;
    const children = Children.toArray(variants.props.children);
    expect(children).toHaveLength(bannerToastRecords.length);
    const variantJson = JSON.stringify(variants);
    let previousIndex = -1;
    for (const record of bannerToastRecords) {
      const currentIndex = variantJson.indexOf(record.id);
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
    expect((interactive.type as { name?: string }).name).toBe('InteractiveBannerToastHarness');
  });
});

describe('Feedback family public boundary', () => {
  it('exports only the two feedback components and intentional runtime constants', () => {
    expect(Object.keys(FeedbackComponents).sort()).toEqual([
      'BannerToast',
      'EmptyState',
      'bannerToastStyles',
      'bannerToastTypes',
    ]);
  });
});

const emptyStateExamples = {
  noGames: { content: 'noGames', onCreateGame: jest.fn() },
  noNotifications: { content: 'noNotifications' },
  noPlayers: { content: 'noPlayers', onInvitePlayers: jest.fn() },
} as const satisfies Record<string, EmptyStateProps>;

describe('Empty State source and approved-copy contract', () => {
  it('retains the three authored tuples and exact 352x220 geometry in source order', () => {
    expect(emptyStateRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { content: 'noPlayers', state: 'withAction' },
      { content: 'noNotifications', state: 'noAction' },
      { content: 'noGames', state: 'withAction' },
    ]);
    expect(emptyStateRecords.map(({ metrics }) => metrics.normalized)).toEqual([
      { height: 220, width: 352 },
      { height: 220, width: 352 },
      { height: 220, width: 352 },
    ]);
  });

  it.each([
    ['noGames', emptyStateExamples.noGames, 'No games', 'You don\u2019t have any games scheduled yet.', 'Create game', 'phase4-artwork-empty-state-no-games'],
    ['noNotifications', emptyStateExamples.noNotifications, 'No notifications', 'You\u2019re all caught up. New updates will appear here.', null, 'phase4-artwork-empty-state-no-notifications'],
    ['noPlayers', emptyStateExamples.noPlayers, 'No players', 'Invite friends to start building your padel group.', 'Invite players', 'phase4-artwork-empty-state-no-players'],
  ] as Array<[string, EmptyStateProps, string, string, string | null, string]>)('renders exact approved %s copy, action, and decorative artwork', async (
    _branch,
    props,
    heading,
    body,
    actionName,
    artworkTestId,
  ) => {
    const screen = await render(<EmptyState {...props} />);
    expect(flattenedStyle(screen.getByTestId('empty-state').props.style)).toEqual(
      expect.objectContaining({ minHeight: 220, width: 352 }),
    );
    expect(screen.getByText(heading)).toBeTruthy();
    expect(screen.getByText(body)).toBeTruthy();
    expect(screen.getByTestId(artworkTestId, { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    if (actionName === null) {
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    } else {
      expect(screen.getByRole('button', { name: actionName })).toBeTruthy();
    }
  });

  it.each([
    [emptyStateExamples.noGames, 'Create game'],
    [emptyStateExamples.noPlayers, 'Invite players'],
  ] as Array<[Extract<EmptyStateProps, { content: 'noGames' | 'noPlayers' }>, string]>)('emits only the exact branch action %s', async (props, actionName) => {
    const screen = await render(<EmptyState {...props} />);
    await userEvent.setup().press(screen.getByRole('button', { name: actionName }));
    const callback = props.content === 'noGames' ? props.onCreateGame : props.onInvitePlayers;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each([
    { content: 'noGames' },
    { content: 'noGames', onCreateGame: null },
    { content: 'noGames', onInvitePlayers: jest.fn() },
    { content: 'noNotifications', onCreateGame: jest.fn() },
    { content: 'noNotifications', onInvitePlayers: jest.fn() },
    { content: 'noPlayers' },
    { content: 'noPlayers', onInvitePlayers: null },
    { content: 'noPlayers', onCreateGame: jest.fn() },
    { content: 'unknown' },
    { content: 'noGames', extra: true, onCreateGame: jest.fn() },
  ])('rejects unsupported Empty State content or callback pairing %#', (props) => {
    expect(() => EmptyState(props as never)).toThrow(/Unsupported Empty State/u);
  });
});

describe('Empty State Storybook contract', () => {
  it('accounts for all five categories under the exact Feedback title', () => {
    expect(EmptyStateStories.title).toBe('Feedback/Empty State');
    expect([
      EmptyStateCanonical,
      EmptyStateVariants,
      EmptyStateStates,
      EmptyStateBoundaries,
      EmptyStateInteractive,
    ]).toHaveLength(5);
  });

  it('normalizes controls to complete source-valid action branches', () => {
    expect(normalizeEmptyStateStoryArgs({ content: 'noGames' })).toEqual(
      expect.objectContaining({ content: 'noGames', onCreateGame: expect.any(Function) }),
    );
    expect(normalizeEmptyStateStoryArgs({
      content: 'noNotifications',
      onCreateGame: jest.fn(),
      onInvitePlayers: jest.fn(),
    })).toEqual({ content: 'noNotifications' });
    expect(normalizeEmptyStateStoryArgs({ content: 'noPlayers' })).toEqual(
      expect.objectContaining({ content: 'noPlayers', onInvitePlayers: expect.any(Function) }),
    );
  });

  it('renders every source record in exact order with visible provenance', () => {
    const variants = EmptyStateVariants.render?.({} as never, {} as never) as React.ReactElement;
    const variantsJson = JSON.stringify(variants);
    let previousIndex = -1;
    for (const record of emptyStateRecords) {
      const currentIndex = variantsJson.indexOf(record.id);
      expect(currentIndex).toBeGreaterThan(previousIndex);
      previousIndex = currentIndex;
    }
  });

  it('records approved long-copy 200%-scale and native-review boundaries', () => {
    const boundaryJson = JSON.stringify(
      EmptyStateBoundaries.render?.({} as never, {} as never),
    );
    expect(boundaryJson).toContain('You don\u2019t have any games scheduled yet.');
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('Phase 5');
    expect(boundaryJson).toContain('Create game');
  });
});
