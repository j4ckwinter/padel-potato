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
    favourite: boolean;
    recentlyPlayedWith: boolean;
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
    recentlyPlayedWith: true,
  },
  {
    bio: 'Experienced player who likes fast rallies and social post-match drinks.',
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
    recentlyPlayedWith: true,
  },
  {
    bio: 'Relaxed all-court player looking for regular local games.',
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
    recentlyPlayedWith: false,
  },
  {
    bio: 'Newer player building confidence through friendly morning games.',
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
    recentlyPlayedWith: false,
  },
  {
    bio: 'Advanced right-side player who enjoys competitive weekend fixtures.',
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
    recentlyPlayedWith: false,
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
    lifecycle: { status: 'scheduled' },
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
    lifecycle: { status: 'scheduled' },
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
    lifecycle: { status: 'scheduled' },
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
    lifecycle: { status: 'scheduled' },
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
    lifecycle: { status: 'scheduled' },
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
    lifecycle: { status: 'scheduled' },
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
    lifecycle: { status: 'scheduled' },
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
  {
    id: 'demo-completed-game',
    lifecycle: {
      completedAt: '2026-09-27T18:30:00.000Z',
      result: {
        sets: [
          [6, 4],
          [6, 3],
        ],
        teams: [
          [demoCurrentGamePlayer.id, jamie.id],
          [sam.id, riley.id],
        ],
      },
      status: 'completed',
    },
    name: 'Sunday Evening Padel',
    participants: [
      { player: demoCurrentGamePlayer, role: 'organiser' },
      { player: jamie, role: 'player' },
      { player: sam, role: 'player' },
      { player: riley, role: 'player' },
    ],
    schedule: {
      date: '2026-09-27',
      startsAt: '2026-09-27T17:00:00.000Z',
      status: 'complete',
      time: '18:00',
    },
    setup: { durationMinutes: 90, format: 'Competitive game' },
    venue: 'Padel United Shoreditch',
  },
  {
    id: 'demo-completed-loss',
    lifecycle: {
      completedAt: '2026-09-28T20:00:00.000Z',
      result: {
        sets: [
          [6, 3],
          [6, 4],
        ],
        teams: [
          [sam.id, riley.id],
          [demoCurrentGamePlayer.id, jamie.id],
        ],
      },
      status: 'completed',
    },
    name: 'Monday Night Padel',
    participants: [
      { player: sam, role: 'organiser' },
      { player: riley, role: 'player' },
      { player: demoCurrentGamePlayer, role: 'player' },
      { player: jamie, role: 'player' },
    ],
    schedule: {
      date: '2026-09-28',
      startsAt: '2026-09-28T18:30:00.000Z',
      status: 'complete',
      time: '19:30',
    },
    setup: { durationMinutes: 90, format: 'Social game' },
    venue: 'Canary Wharf Padel',
  },
] as const satisfies readonly Game[];
