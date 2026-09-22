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

const emptyStateExamples = {
  noGames: { content: 'noGames', onCreateGame: jest.fn() },
  noNotifications: { content: 'noNotifications' },
  noPlayers: { content: 'noPlayers', onInvitePlayers: jest.fn() },
} as const satisfies Record<string, EmptyStateProps>;

describe('Empty State approved-copy contract', () => {
  it.each([
    [
      'noGames',
      emptyStateExamples.noGames,
      'No games',
      'You don\u2019t have any games scheduled yet.',
      'Create game',
      'phase4-artwork-empty-state-no-games',
    ],
    [
      'noNotifications',
      emptyStateExamples.noNotifications,
      'No notifications',
      'You\u2019re all caught up. New updates will appear here.',
      null,
      'phase4-artwork-empty-state-no-notifications',
    ],
    [
      'noPlayers',
      emptyStateExamples.noPlayers,
      'No players',
      'Invite friends to start building your padel group.',
      'Invite players',
      'phase4-artwork-empty-state-no-players',
    ],
  ] as Array<[string, EmptyStateProps, string, string, string | null, string]>)(
    'renders exact approved %s copy, action, and decorative artwork',
    async (_branch, props, heading, body, actionName, artworkTestId) => {
      const screen = await render(<EmptyState {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('empty-state').props.style),
      ).toEqual(expect.objectContaining({ minHeight: 220, width: 352 }));
      expect(screen.getByText(heading)).toBeTruthy();
      expect(screen.getByText(body)).toBeTruthy();
      expect(
        screen.getByTestId(artworkTestId, { includeHiddenElements: true }),
      ).toBeTruthy();
      expect(screen.queryAllByRole('image')).toHaveLength(0);
      if (actionName === null) {
        expect(screen.queryAllByRole('button')).toHaveLength(0);
      } else {
        expect(screen.getByRole('button', { name: actionName })).toBeTruthy();
      }
    },
  );

  it.each([
    [emptyStateExamples.noGames, 'Create game'],
    [emptyStateExamples.noPlayers, 'Invite players'],
  ] as Array<
    [Extract<EmptyStateProps, { content: 'noGames' | 'noPlayers' }>, string]
  >)('emits only the exact branch action %s', async (props, actionName) => {
    const screen = await render(<EmptyState {...props} />);
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: actionName }));
    const callback =
      props.content === 'noGames' ? props.onCreateGame : props.onInvitePlayers;
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
  ])(
    'rejects unsupported Empty State content or callback pairing %#',
    (props) => {
      expect(() => EmptyState(invalidProps(props))).toThrow(
        /Unsupported Empty State/u,
      );
    },
  );
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
      expect.objectContaining({
        content: 'noGames',
        onCreateGame: expect.any(Function),
      }),
    );
    expect(
      normalizeEmptyStateStoryArgs({
        content: 'noNotifications',
        onCreateGame: jest.fn(),
        onInvitePlayers: jest.fn(),
      }),
    ).toEqual({ content: 'noNotifications' });
    expect(normalizeEmptyStateStoryArgs({ content: 'noPlayers' })).toEqual(
      expect.objectContaining({
        content: 'noPlayers',
        onInvitePlayers: expect.any(Function),
      }),
    );
  });

  it('renders every supported configuration in order with readable labels', () => {
    const variants = EmptyStateVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    const variantsJson = JSON.stringify(variants);
    let previousIndex = -1;
    for (const fixture of emptyStateFixtures) {
      const currentIndex = variantsJson.indexOf(fixture.label);
      expect(currentIndex).toBeGreaterThan(previousIndex);
      previousIndex = currentIndex;
    }
  });

  it('records approved long-copy 200%-scale and native-review boundaries', () => {
    const boundaryJson = JSON.stringify(
      EmptyStateBoundaries.render?.({} as never, {} as never),
    );
    expect(boundaryJson).toContain(
      'You don\u2019t have any games scheduled yet.',
    );
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('Phase 5');
    expect(boundaryJson).toContain('Create game');
  });
});
