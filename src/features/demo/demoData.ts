import type {
  GameCardProps,
  PlayerItemIdentity,
} from '../../design-system/components/content';
import type { CreatedGame } from '../games/gameRepository';

export type DemoPlayer = Readonly<{
  bio: string;
  collection: 'discover' | 'friends';
  favourite: boolean;
  id: string;
  identity: PlayerItemIdentity;
  level: string;
  preferences: Readonly<{
    days: string;
    side: string;
    timeOfDay: string;
  }>;
  stats: Readonly<{
    gamesPlayed: string;
    rating: string;
    winRate: string;
  }>;
}>;

export const demoPlayers = [
  {
    bio: 'Friendly right-side player who enjoys organised evening games.',
    collection: 'friends',
    favourite: true,
    id: 'alex-morgan',
    identity: {
      initials: 'AM',
      name: 'Alex Morgan',
      presence: 'away',
      supportingText: 'Intermediate · Rating 4.7',
    },
    level: 'Intermediate',
    preferences: {
      days: 'Weekdays',
      side: 'Right',
      timeOfDay: 'Evenings',
    },
    stats: { gamesPlayed: '48', rating: '4.7', winRate: '68%' },
  },
  {
    bio: 'Competitive left-side player who is always up for a weekend match.',
    collection: 'friends',
    favourite: false,
    id: 'jamie-taylor',
    identity: {
      initials: 'JT',
      name: 'Jamie Taylor',
      presence: 'offline',
      supportingText: 'Intermediate · Rating 4.5',
    },
    level: 'Intermediate',
    preferences: {
      days: 'Weekends',
      side: 'Left',
      timeOfDay: 'Mornings',
    },
    stats: { gamesPlayed: '31', rating: '4.5', winRate: '61%' },
  },
  {
    bio: 'Experienced player who likes fast rallies and social post-match drinks.',
    collection: 'friends',
    favourite: true,
    id: 'sam-kim',
    identity: {
      initials: 'SK',
      name: 'Sam Kim',
      presence: 'away',
      supportingText: 'Advanced · Rating 4.8',
    },
    level: 'Advanced',
    preferences: {
      days: 'Monday–Saturday',
      side: 'Left',
      timeOfDay: 'Evenings',
    },
    stats: { gamesPlayed: '56', rating: '4.8', winRate: '72%' },
  },
  {
    bio: 'Relaxed all-court player looking for regular local games.',
    collection: 'discover',
    favourite: false,
    id: 'riley-brown',
    identity: {
      initials: 'RB',
      name: 'Riley Brown',
      presence: 'offline',
      supportingText: 'Intermediate · Rating 4.4',
    },
    level: 'Intermediate',
    preferences: {
      days: 'Weekends',
      side: 'Either',
      timeOfDay: 'Afternoons',
    },
    stats: { gamesPlayed: '22', rating: '4.4', winRate: '57%' },
  },
  {
    bio: 'Newer player building confidence through friendly morning games.',
    collection: 'discover',
    favourite: false,
    id: 'taylor-singh',
    identity: {
      initials: 'TS',
      name: 'Taylor Singh',
      presence: 'away',
      supportingText: 'Beginner · Rating 3.9',
    },
    level: 'Beginner',
    preferences: {
      days: 'Weekdays',
      side: 'Either',
      timeOfDay: 'Mornings',
    },
    stats: { gamesPlayed: '12', rating: '3.9', winRate: '50%' },
  },
  {
    bio: 'Advanced right-side player who enjoys competitive weekend fixtures.',
    collection: 'discover',
    favourite: false,
    id: 'morgan-lee',
    identity: {
      initials: 'ML',
      name: 'Morgan Lee',
      presence: 'offline',
      supportingText: 'Advanced · Rating 4.9',
    },
    level: 'Advanced',
    preferences: {
      days: 'Weekends',
      side: 'Right',
      timeOfDay: 'Afternoons',
    },
    stats: { gamesPlayed: '63', rating: '4.9', winRate: '74%' },
  },
] as const satisfies readonly DemoPlayer[];

export const demoGameParticipants = [
  {
    id: demoPlayers[0].id,
    identity: {
      ...demoPlayers[0].identity,
      supportingText: 'Organiser · Rating 4.7',
    },
  },
  {
    id: demoPlayers[1].id,
    identity: {
      ...demoPlayers[1].identity,
      supportingText: 'Confirmed · Rating 4.5',
    },
  },
  {
    id: demoPlayers[2].id,
    identity: {
      ...demoPlayers[2].identity,
      supportingText: 'Confirmed · Rating 4.8',
    },
  },
  {
    id: demoPlayers[3].id,
    identity: {
      ...demoPlayers[3].identity,
      supportingText: 'Confirmed · Rating 4.4',
    },
  },
] as const;

export function findDemoPlayerById(id: string) {
  return demoPlayers.find((player) => player.id === id) ?? null;
}

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
