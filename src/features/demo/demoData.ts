import type { PlayerItemIdentity } from '../../design-system/components/content';
import type { Game, GameParticipants, GamePlayer } from '../games/game';

export type DemoPlayerProfile = Readonly<{
  bio: string;
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

export type DemoPlayer = DemoPlayerProfile &
  Readonly<{
    collection: 'discover' | 'friends';
    favourite: boolean;
  }>;

export const demoCurrentUser = {
  bio: 'Friendly right-side player who enjoys organised evening games.',
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
} as const satisfies DemoPlayerProfile;

export const demoPlayers = [
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

export function findDemoPlayerById(id: string) {
  return demoPlayers.find((player) => player.id === id) ?? null;
}

function gamePlayer(profile: DemoPlayerProfile): GamePlayer {
  if (typeof profile.identity.initials !== 'string') {
    throw new Error('Demo game players require initials.');
  }

  return {
    id: profile.id,
    initials: profile.identity.initials,
    name: profile.identity.name,
    rating: profile.stats.rating,
  };
}

export const demoCurrentGamePlayer = gamePlayer(demoCurrentUser);
const jamie = gamePlayer(demoPlayers[0]);
const sam = gamePlayer(demoPlayers[1]);
const riley = gamePlayer(demoPlayers[2]);
const taylor = gamePlayer(demoPlayers[3]);
const morgan = gamePlayer(demoPlayers[4]);

export function demoParticipantsForCount(
  count: 1 | 2 | 3 | 4,
): GameParticipants {
  const organiser = {
    player: demoCurrentGamePlayer,
    role: 'organiser',
  } as const;

  switch (count) {
    case 1:
      return [organiser];
    case 2:
      return [organiser, { player: jamie, role: 'player' }];
    case 3:
      return [
        organiser,
        { player: jamie, role: 'player' },
        { player: sam, role: 'player' },
      ];
    case 4:
      return [
        organiser,
        { player: jamie, role: 'player' },
        { player: sam, role: 'player' },
        { player: riley, role: 'player' },
      ];
  }
}

export const demoGames = [
  {
    id: 'demo-shoreditch-evening',
    name: 'Wednesday Evening Padel',
    participants: [{ player: riley, role: 'organiser' }],
    schedule: {
      date: '2026-09-30',
      startsAt: '2026-09-30T17:30:00.000Z',
      status: 'complete',
      time: '18:30',
    },
    setup: { durationMinutes: 90, format: 'Social game' },
    venue: 'Padel United Shoreditch',
  },
  {
    id: 'demo-stratford-morning',
    name: 'Saturday Morning Padel',
    participants: [
      { player: morgan, role: 'organiser' },
      { player: taylor, role: 'player' },
      { player: riley, role: 'player' },
    ],
    schedule: {
      date: '2026-10-03',
      startsAt: '2026-10-03T08:00:00.000Z',
      status: 'complete',
      time: '09:00',
    },
    setup: { durationMinutes: 60, format: 'Competitive game' },
    venue: 'Stratford Padel Club',
  },
  {
    id: 'demo-canary-social',
    name: 'Sunday Social Padel',
    participants: [
      { player: riley, role: 'organiser' },
      { player: taylor, role: 'player' },
    ],
    schedule: {
      date: '2026-10-04',
      startsAt: '2026-10-04T10:30:00.000Z',
      status: 'complete',
      time: '11:30',
    },
    setup: { durationMinutes: 90, format: 'Social game' },
    venue: 'Canary Wharf Padel',
  },
  {
    id: 'demo-my-next-game',
    name: 'Thursday Evening Padel',
    participants: [
      { player: demoCurrentGamePlayer, role: 'organiser' },
      { player: jamie, role: 'player' },
      { player: sam, role: 'player' },
      { player: riley, role: 'player' },
    ],
    schedule: {
      date: '2026-10-01',
      startsAt: '2026-10-01T18:00:00.000Z',
      status: 'complete',
      time: '19:00',
    },
    setup: { durationMinutes: 90, format: 'Social game' },
    venue: 'Padel United Shoreditch',
  },
  {
    id: 'demo-my-open-game',
    name: 'Tuesday After-work Padel',
    participants: [
      { player: demoCurrentGamePlayer, role: 'organiser' },
      { player: jamie, role: 'player' },
    ],
    schedule: {
      date: '2026-10-06',
      startsAt: '2026-10-06T17:30:00.000Z',
      status: 'complete',
      time: '18:30',
    },
    setup: { durationMinutes: 60, format: 'Competitive game' },
    venue: 'Canary Wharf Padel',
  },
  {
    id: 'demo-my-lunch-game',
    name: 'Wednesday Lunch Padel',
    participants: [{ player: demoCurrentGamePlayer, role: 'organiser' }],
    schedule: {
      date: '2026-10-07',
      startsAt: '2026-10-07T11:30:00.000Z',
      status: 'complete',
      time: '12:30',
    },
    setup: { durationMinutes: 60, format: 'Social game' },
    venue: 'Padel United Shoreditch',
  },
  {
    id: 'demo-my-friday-game',
    name: 'Friday Evening Padel',
    participants: [
      { player: sam, role: 'organiser' },
      { player: demoCurrentGamePlayer, role: 'player' },
      { player: taylor, role: 'player' },
    ],
    schedule: {
      date: '2026-10-09',
      startsAt: '2026-10-09T18:30:00.000Z',
      status: 'complete',
      time: '19:30',
    },
    setup: { durationMinutes: 90, format: 'Competitive game' },
    venue: 'Stratford Padel Club',
  },
] as const satisfies readonly Game[];
