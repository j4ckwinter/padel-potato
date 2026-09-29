import type { GameCardProps } from '../../design-system/components/content';
import type { CreatedGame } from '../games/gameRepository';

export const demoGamePlayers = [
  {
    initials: 'AM',
    name: 'Alex Morgan',
    presence: 'away',
    supportingText: 'Organiser · Rating 4.7',
  },
  {
    initials: 'P2',
    name: 'Player 2',
    presence: 'offline',
    supportingText: 'Included by organiser',
  },
  {
    initials: 'P3',
    name: 'Player 3',
    presence: 'offline',
    supportingText: 'Included by organiser',
  },
  {
    initials: 'P4',
    name: 'Player 4',
    presence: 'offline',
    supportingText: 'Included by organiser',
  },
] as const;

type BrowsableGameCardProps = Extract<
  GameCardProps,
  { variant: 'next' | 'open' }
>;
type DemoGameCardProps = BrowsableGameCardProps extends infer Props
  ? Props extends Readonly<{ onViewGame: () => void }>
    ? Omit<Props, 'onViewGame'>
    : never
  : never;

export type DemoGameCardEntry = Readonly<{
  card: DemoGameCardProps;
  collection: 'discover' | 'mine';
  game: CreatedGame;
}>;

const cardParticipants = [
  { initials: 'AM', name: 'Alex Morgan', presence: 'online', slot: 1 },
  { initials: 'JT', name: 'Jamie Taylor', presence: 'online', slot: 2 },
  { initials: 'SK', name: 'Sam Kim', presence: 'online', slot: 3 },
  { initials: 'RB', name: 'Riley Brown', presence: 'online', slot: 4 },
] as const;

export const demoGameCards = [
  {
    card: {
      full: false,
      participants: [cardParticipants[0]],
      time: 'Wed 30 Sep · 18:30 · 90 min',
      title: 'Wednesday Evening Padel',
      variant: 'open',
      venue: 'Padel United Shoreditch',
    },
    collection: 'discover',
    game: {
      id: 'demo-shoreditch-evening',
      name: 'Wednesday Evening Padel',
      schedule: {
        date: '2026-09-30',
        startsAt: '2026-09-30T17:30:00.000Z',
        status: 'complete',
        time: '18:30',
      },
      setup: {
        currentPlayerCount: 1,
        durationMinutes: 90,
        format: 'Social game',
      },
      venue: 'Padel United Shoreditch',
    },
  },
  {
    card: {
      full: false,
      participants: [
        cardParticipants[0],
        cardParticipants[1],
        cardParticipants[2],
      ],
      time: 'Sat 3 Oct · 09:00 · 60 min',
      title: 'Saturday Morning Padel',
      variant: 'open',
      venue: 'Stratford Padel Club',
    },
    collection: 'discover',
    game: {
      id: 'demo-stratford-morning',
      name: 'Saturday Morning Padel',
      schedule: {
        date: '2026-10-03',
        startsAt: '2026-10-03T08:00:00.000Z',
        status: 'complete',
        time: '09:00',
      },
      setup: {
        currentPlayerCount: 3,
        durationMinutes: 60,
        format: 'Competitive game',
      },
      venue: 'Stratford Padel Club',
    },
  },
  {
    card: {
      full: false,
      participants: [cardParticipants[0], cardParticipants[1]],
      time: 'Sun 4 Oct · 11:30 · 90 min',
      title: 'Sunday Social Padel',
      variant: 'open',
      venue: 'Canary Wharf Padel',
    },
    collection: 'discover',
    game: {
      id: 'demo-canary-social',
      name: 'Sunday Social Padel',
      schedule: {
        date: '2026-10-04',
        startsAt: '2026-10-04T10:30:00.000Z',
        status: 'complete',
        time: '11:30',
      },
      setup: {
        currentPlayerCount: 2,
        durationMinutes: 90,
        format: 'Social game',
      },
      venue: 'Canary Wharf Padel',
    },
  },
  {
    card: {
      participants: cardParticipants,
      time: 'Thu 1 Oct · 19:00 · 90 min',
      title: 'Thursday Evening Padel',
      variant: 'next',
      venue: 'Padel United Shoreditch',
    },
    collection: 'mine',
    game: {
      id: 'demo-my-next-game',
      name: 'Thursday Evening Padel',
      schedule: {
        date: '2026-10-01',
        startsAt: '2026-10-01T18:00:00.000Z',
        status: 'complete',
        time: '19:00',
      },
      setup: {
        currentPlayerCount: 4,
        durationMinutes: 90,
        format: 'Social game',
      },
      venue: 'Padel United Shoreditch',
    },
  },
  {
    card: {
      full: false,
      participants: [cardParticipants[0], cardParticipants[1]],
      time: 'Tue 6 Oct · 18:30 · 60 min',
      title: 'Tuesday After-work Padel',
      variant: 'open',
      venue: 'Canary Wharf Padel',
    },
    collection: 'mine',
    game: {
      id: 'demo-my-open-game',
      name: 'Tuesday After-work Padel',
      schedule: {
        date: '2026-10-06',
        startsAt: '2026-10-06T17:30:00.000Z',
        status: 'complete',
        time: '18:30',
      },
      setup: {
        currentPlayerCount: 2,
        durationMinutes: 60,
        format: 'Competitive game',
      },
      venue: 'Canary Wharf Padel',
    },
  },
] as const satisfies readonly DemoGameCardEntry[];
