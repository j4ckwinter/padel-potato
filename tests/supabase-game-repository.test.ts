import { describe, expect, it } from '@jest/globals';

import { gamesFromRows } from '../src/features/supabase/gameRepository';
import type { Database } from '../src/features/supabase/database.types';

type GameRow = Database['public']['Tables']['games']['Row'];
type ParticipantRow = Database['public']['Tables']['game_participants']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ResultRow = Database['public']['Tables']['game_results']['Row'];
type ResultSetRow = Database['public']['Tables']['game_result_sets']['Row'];
type ResultTeamRow = Database['public']['Tables']['game_result_teams']['Row'];

const gameId = '10000000-0000-4000-8000-000000000001';
const playerIds = [
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000003',
  '20000000-0000-4000-8000-000000000004',
] as const;

function profile(id: string, name: string, initials: string): ProfileRow {
  return {
    avatar_url: null,
    bio: '',
    created_at: '2026-09-30T12:00:00.000Z',
    display_name: name,
    games_played: 0,
    games_won: 0,
    id,
    initials,
    level: 'Intermediate',
    preferred_days: 'Any day',
    preferred_side: 'Either',
    preferred_time_of_day: 'Any time',
    presence: 'offline',
    rating: 4.2,
    updated_at: '2026-09-30T12:00:00.000Z',
  };
}

const profiles = [
  profile(playerIds[0], 'Alex Morgan', 'AM'),
  profile(playerIds[1], 'Jamie Taylor', 'JT'),
  profile(playerIds[2], 'Sam Kim', 'SK'),
  profile(playerIds[3], 'Riley Brown', 'RB'),
];

function game(overrides: Partial<GameRow> = {}): GameRow {
  return {
    cancelled_at: null,
    completed_at: null,
    created_at: '2026-09-30T12:00:00.000Z',
    duration_minutes: 90,
    ended_at: null,
    format: 'Competitive game',
    id: gameId,
    name: 'Wednesday Evening Padel',
    organiser_id: playerIds[0],
    starts_at: '2026-10-07T18:30:00.000Z',
    status: 'scheduled',
    updated_at: '2026-09-30T12:00:00.000Z',
    venue_name: 'Potato Padel Club',
    ...overrides,
  };
}

function participants(count: 1 | 4): ParticipantRow[] {
  return playerIds.slice(0, count).map((playerId, index) => ({
    game_id: gameId,
    joined_at: '2026-09-30T12:00:00.000Z',
    player_id: playerId,
    position: index + 1,
    role: index === 0 ? 'organiser' : 'player',
  }));
}

describe('Supabase game repository mapping', () => {
  it('maps a persisted game with its organiser', () => {
    expect(
      gamesFromRows({
        games: [game()],
        participants: participants(1),
        profiles,
        resultSets: [],
        resultTeams: [],
        results: [],
      }),
    ).toEqual([
      {
        id: gameId,
        lifecycle: { status: 'scheduled' },
        name: 'Wednesday Evening Padel',
        participants: [
          {
            player: {
              id: playerIds[0],
              initials: 'AM',
              name: 'Alex Morgan',
              rating: '4.2',
            },
            role: 'organiser',
          },
        ],
        schedule: {
          date: '2026-10-07',
          startsAt: '2026-10-07T18:30:00.000Z',
          status: 'complete',
          time: '19:30',
        },
        setup: { durationMinutes: 90, format: 'Competitive game' },
        venue: 'Potato Padel Club',
      },
    ]);
  });

  it('maps a completed game with teams and sets', () => {
    const results: ResultRow[] = [
      {
        created_at: '2026-10-07T20:00:00.000Z',
        game_id: gameId,
        submitted_by: playerIds[0],
      },
    ];
    const resultTeams: ResultTeamRow[] = [
      [1, 1, playerIds[0]],
      [1, 2, playerIds[1]],
      [2, 1, playerIds[2]],
      [2, 2, playerIds[3]],
    ].map(([teamNumber, playerPosition, playerId]) => ({
      game_id: gameId,
      player_id: String(playerId),
      player_position: Number(playerPosition),
      team_number: Number(teamNumber),
    }));
    const resultSets: ResultSetRow[] = [
      [1, 6, 4],
      [2, 7, 5],
    ].map(([setNumber, teamOneScore, teamTwoScore]) => ({
      game_id: gameId,
      set_number: setNumber,
      team_one_score: teamOneScore,
      team_two_score: teamTwoScore,
    }));

    expect(
      gamesFromRows({
        games: [
          game({
            completed_at: '2026-10-07T20:00:00.000Z',
            ended_at: '2026-10-07T20:00:00.000Z',
            status: 'completed',
          }),
        ],
        participants: participants(4),
        profiles,
        resultSets,
        resultTeams,
        results,
      })[0],
    ).toMatchObject({
      lifecycle: {
        completedAt: '2026-10-07T20:00:00.000Z',
        result: {
          sets: [
            [6, 4],
            [7, 5],
          ],
          teams: [
            [playerIds[0], playerIds[1]],
            [playerIds[2], playerIds[3]],
          ],
        },
        status: 'completed',
      },
    });
  });

  it('rejects a game whose persisted participants violate their positions', () => {
    const malformedParticipants = participants(4);
    malformedParticipants[1] = {
      ...malformedParticipants[1],
      position: 3,
    };

    expect(() =>
      gamesFromRows({
        games: [game()],
        participants: malformedParticipants,
        profiles,
        resultSets: [],
        resultTeams: [],
        results: [],
      }),
    ).toThrow('Invalid participants for game');
  });
});
