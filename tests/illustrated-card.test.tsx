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

const illustratedParticipants = [
  { initials: 'AM', name: 'Alex Morgan', slot: 1 },
  { initials: 'JT', name: 'Jamie Taylor', slot: 2 },
  { initials: 'SK', name: 'Sam Kim', slot: 3 },
  { initials: 'RB', name: 'Riley Brown', slot: 4 },
] as const satisfies readonly IllustratedCardParticipant[];

const illustratedCardExamples = {
  gameCreated: {
    detailPrimary: 'Your court is booked and',
    detailSecondary: 'ready to share.',
    eyebrow: 'Success',
    onShareGame: jest.fn(),
    participants: [illustratedParticipants[0], illustratedParticipants[1]],
    title: 'Game created!',
    type: 'gameCreated',
  },
  invitePlayers: {
    detailPrimary: 'Share this game and fill',
    detailSecondary: 'the remaining player slots.',
    eyebrow: 'Players',
    onInvitePlayers: jest.fn(),
    participants: [illustratedParticipants[0], illustratedParticipants[1]],
    title: 'Bring your crew',
    type: 'invitePlayers',
  },
  matchResult: {
    detailPrimary: 'You won 6\u20134, 6\u20133',
    detailSecondary: 'View scores and highlights',
    eyebrow: 'Completed',
    onViewResults: jest.fn(),
    participants: illustratedParticipants,
    title: 'Great match!',
    type: 'matchResult',
  },
  nextGame: {
    detailPrimary: 'Padel United \u00b7 Court 3',
    detailSecondary: '18:30 \u00b7 90 min',
    eyebrow: 'Your next game',
    onViewGame: jest.fn(),
    participants: illustratedParticipants,
    title: 'Tuesday Social Padel',
    type: 'nextGame',
  },
} as const satisfies Record<string, IllustratedCardProps>;

describe('Illustrated Card runtime contract', () => {
  it.each([
    [
      'nextGame',
      illustratedCardExamples.nextGame,
      'View',
      'View game',
      'phase4-artwork-illustrated-card-next-game',
    ],
    [
      'matchResult',
      illustratedCardExamples.matchResult,
      'Results',
      'View results',
      'phase4-artwork-illustrated-card-match-result',
    ],
    [
      'invitePlayers',
      illustratedCardExamples.invitePlayers,
      'Invite',
      'Invite players',
      'phase4-artwork-illustrated-card-invite-players',
    ],
    [
      'gameCreated',
      illustratedCardExamples.gameCreated,
      'Share',
      'Share game',
      'phase4-artwork-illustrated-card-game-created',
    ],
  ] as Array<[string, IllustratedCardProps, string, string, string]>)(
    'renders exact %s content, one CTA, and mapped decorative mascot',
    async (_branch, props, visibleAction, actionName, artworkTestId) => {
      const screen = await render(<IllustratedCard {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('illustrated-card').props.style),
      ).toEqual(expect.objectContaining({ minHeight: 176, width: 352 }));
      expect(screen.getByText(props.eyebrow)).toBeTruthy();
      expect(screen.getByText(props.title)).toBeTruthy();
      expect(screen.getByText(props.detailPrimary)).toBeTruthy();
      expect(screen.getByText(props.detailSecondary)).toBeTruthy();
      expect(
        screen.getByText(visibleAction, { includeHiddenElements: true }),
      ).toBeTruthy();
      expect(screen.getByRole('button', { name: actionName })).toBeTruthy();
      expect(
        screen.getByTestId(artworkTestId, { includeHiddenElements: true }),
      ).toBeTruthy();
      expect(screen.queryAllByRole('button')).toHaveLength(1);
      expect(screen.queryAllByRole('image')).toHaveLength(0);
    },
  );

  it.each([
    [illustratedCardExamples.nextGame, 'View game'],
    [illustratedCardExamples.matchResult, 'View results'],
    [illustratedCardExamples.invitePlayers, 'Invite players'],
    [illustratedCardExamples.gameCreated, 'Share game'],
  ] as Array<[IllustratedCardProps, string]>)(
    'emits only the %s CTA intent',
    async (props, actionName) => {
      const screen = await render(<IllustratedCard {...props} />);
      await userEvent
        .setup()
        .press(screen.getByRole('button', { name: actionName }));
      const callback =
        props.type === 'nextGame'
          ? props.onViewGame
          : props.type === 'matchResult'
            ? props.onViewResults
            : props.type === 'invitePlayers'
              ? props.onInvitePlayers
              : props.onShareGame;
      expect(callback).toHaveBeenCalledTimes(1);
    },
  );

  it('announces exact participant order while hiding redundant initial decoration', async () => {
    const screen = await render(
      <IllustratedCard {...illustratedCardExamples.nextGame} />,
    );
    expect(
      screen.getByLabelText(
        'Players: Alex Morgan, Jamie Taylor, Sam Kim, Riley Brown',
      ),
    ).toBeTruthy();
    expect(
      screen.getByTestId('illustrated-card-participant-decoration', {
        includeHiddenElements: true,
      }).props.accessibilityElementsHidden,
    ).toBe(true);
  });

  it.each([
    { ...illustratedCardExamples.nextGame, title: '' },
    { ...illustratedCardExamples.nextGame, detailPrimary: null },
    { ...illustratedCardExamples.nextGame, onViewGame: null },
    { ...illustratedCardExamples.nextGame, onViewResults: jest.fn() },
    {
      ...illustratedCardExamples.nextGame,
      participants: illustratedParticipants.slice(0, 3),
    },
    {
      ...illustratedCardExamples.nextGame,
      participants: [...illustratedParticipants].reverse(),
    },
    {
      ...illustratedCardExamples.invitePlayers,
      participants: illustratedParticipants,
    },
    {
      ...illustratedCardExamples.gameCreated,
      participants: [illustratedParticipants[1], illustratedParticipants[0]],
    },
    { ...illustratedCardExamples.matchResult, onViewResults: undefined },
    { ...illustratedCardExamples.gameCreated, extra: true },
    { ...illustratedCardExamples.nextGame, type: 'unknown' },
    {
      ...illustratedCardExamples.nextGame,
      participants: [
        { ...illustratedParticipants[0], initials: '' },
        ...illustratedParticipants.slice(1),
      ],
    },
    {
      ...illustratedCardExamples.nextGame,
      participants: [
        { ...illustratedParticipants[0], initials: '   ' },
        ...illustratedParticipants.slice(1),
      ],
    },
    {
      ...illustratedCardExamples.nextGame,
      participants: [
        { ...illustratedParticipants[0], initials: 'ALEX' },
        ...illustratedParticipants.slice(1),
      ],
    },
  ])(
    'rejects unsupported content, callbacks, participant states, or tuples %#',
    (props) => {
      expect(() => IllustratedCard(invalidProps(props))).toThrow(
        /Unsupported Illustrated Card/u,
      );
    },
  );
});

describe('Illustrated Card Storybook and public contract', () => {
  it('exports a narrow card family and all five exact Cards stories', () => {
    expect(Object.keys(CardComponents)).toEqual(['IllustratedCard']);
    expect(IllustratedCardStories.title).toBe('Cards/Illustrated Card');
    expect([
      IllustratedCardCanonical,
      IllustratedCardVariants,
      IllustratedCardStates,
      IllustratedCardBoundaries,
      IllustratedCardInteractive,
    ]).toHaveLength(5);
  });

  it('normalizes controls into complete branches with exact participant cardinality', () => {
    expect(normalizeIllustratedCardStoryArgs({ type: 'nextGame' })).toEqual(
      expect.objectContaining({
        participants: illustratedParticipants,
        type: 'nextGame',
      }),
    );
    expect(
      normalizeIllustratedCardStoryArgs({ type: 'invitePlayers' }),
    ).toEqual(
      expect.objectContaining({
        participants: [illustratedParticipants[0], illustratedParticipants[1]],
        type: 'invitePlayers',
      }),
    );
  });

  it('renders every supported configuration in order with readable labels', () => {
    const variantsJson = JSON.stringify(
      IllustratedCardVariants.render?.({} as never, {} as never),
    );
    let previousIndex = -1;
    for (const fixture of illustratedCardFixtures) {
      const currentIndex = variantsJson.indexOf(fixture.label);
      expect(currentIndex).toBeGreaterThan(previousIndex);
      previousIndex = currentIndex;
    }
  });

  it('records long-content, partial-participant, 200%-scale, and native-review boundaries', () => {
    const boundaryJson = JSON.stringify(
      IllustratedCardBoundaries.render?.({} as never, {} as never),
    );
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('partial participant');
    expect(boundaryJson).toContain('Phase 5');
    expect(boundaryJson).toContain('View game');
  });
});
