import { publishGameChange } from '../games/gameChanges';
import { gameDraftName, type GameDraft } from '../game-creation/gameDraft';
import {
  createGameResult,
  isScheduledGame,
  type Game,
  type GameLifecycleCommand,
  type GameParticipants,
  type GamePlayer,
  type GameResultSets,
  type GameTeams,
  type ScheduledGame,
} from '../games/game';
import type {
  GameRepository,
  JoinGameResult,
  TransitionGameLifecycleResult,
} from '../games/gameRepository';
import type { PadelSupabaseClient } from './client';
import type { Database, Json } from './database.types';

type GameRow = Database['public']['Tables']['games']['Row'];
type ParticipantRow = Database['public']['Tables']['game_participants']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ResultRow = Database['public']['Tables']['game_results']['Row'];
type ResultSetRow = Database['public']['Tables']['game_result_sets']['Row'];
type ResultTeamRow = Database['public']['Tables']['game_result_teams']['Row'];

type PersistedGameRows = Readonly<{
  games: readonly GameRow[];
  participants: readonly ParticipantRow[];
  profiles: readonly ProfileRow[];
  results: readonly ResultRow[];
  resultSets: readonly ResultSetRow[];
  resultTeams: readonly ResultTeamRow[];
}>;

const londonDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/London',
  year: 'numeric',
});

function invalidGame(gameId: string, detail: string): never {
  throw new Error(`Invalid ${detail} for game ${gameId}.`);
}

function dateTimePart(parts: readonly Intl.DateTimeFormatPart[], type: string) {
  const value = parts.find((part) => part.type === type)?.value;
  if (!value) throw new Error(`Could not format game ${type}.`);
  return value;
}

function scheduleFromStartsAt(startsAt: string) {
  const instant = new Date(startsAt);
  if (!Number.isFinite(instant.getTime())) {
    throw new Error(`Invalid game start time: ${startsAt}.`);
  }
  const parts = londonDateTimeFormatter.formatToParts(instant);
  const year = dateTimePart(parts, 'year');
  const month = dateTimePart(parts, 'month');
  const day = dateTimePart(parts, 'day');
  const hour = dateTimePart(parts, 'hour');
  const minute = dateTimePart(parts, 'minute');
  return {
    date: `${year}-${month}-${day}`,
    startsAt,
    status: 'complete' as const,
    time: `${hour}:${minute}`,
  };
}

function gamePlayer(profile: ProfileRow): GamePlayer {
  return {
    id: profile.id,
    initials: profile.initials,
    name: profile.display_name,
    rating: profile.rating.toFixed(1),
  };
}

function participantsForGame({
  game,
  participants,
  profilesById,
}: Readonly<{
  game: GameRow;
  participants: readonly ParticipantRow[];
  profilesById: ReadonlyMap<string, ProfileRow>;
}>): GameParticipants {
  const rows = participants
    .filter((participant) => participant.game_id === game.id)
    .sort((left, right) => left.position - right.position);
  if (rows.length < 1 || rows.length > 4) {
    return invalidGame(game.id, 'participants');
  }

  rows.forEach((row, index) => {
    const expectedRole = index === 0 ? 'organiser' : 'player';
    if (
      row.position !== index + 1 ||
      row.role !== expectedRole ||
      (index === 0 && row.player_id !== game.organiser_id)
    ) {
      return invalidGame(game.id, 'participants');
    }
    if (!profilesById.has(row.player_id)) {
      return invalidGame(game.id, 'participant profile');
    }
  });

  const organiserProfile = profilesById.get(rows[0].player_id);
  if (!organiserProfile) return invalidGame(game.id, 'participant profile');
  const organiser = {
    player: gamePlayer(organiserProfile),
    role: 'organiser' as const,
  };
  const playerAt = (index: number) => {
    const row = rows[index];
    const profile = row ? profilesById.get(row.player_id) : undefined;
    if (!profile) return invalidGame(game.id, 'participant profile');
    return { player: gamePlayer(profile), role: 'player' as const };
  };

  switch (rows.length) {
    case 1:
      return [organiser];
    case 2:
      return [organiser, playerAt(1)];
    case 3:
      return [organiser, playerAt(1), playerAt(2)];
    case 4:
      return [organiser, playerAt(1), playerAt(2), playerAt(3)];
    default:
      return invalidGame(game.id, 'participants');
  }
}

function resultForGame({
  game,
  persistedRows,
}: Readonly<{
  game: ScheduledGame;
  persistedRows: PersistedGameRows;
}>) {
  if (
    !persistedRows.results.some((result) => result.game_id === game.id) ||
    game.participants.length !== 4
  ) {
    return invalidGame(game.id, 'result');
  }

  const teamRows = persistedRows.resultTeams
    .filter((row) => row.game_id === game.id)
    .sort(
      (left, right) =>
        left.team_number - right.team_number ||
        left.player_position - right.player_position,
    );
  if (
    teamRows.length !== 4 ||
    teamRows.some(
      (row, index) =>
        row.team_number !== Math.floor(index / 2) + 1 ||
        row.player_position !== (index % 2) + 1,
    )
  ) {
    return invalidGame(game.id, 'result teams');
  }

  const playersById = new Map(
    game.participants.map(({ player }) => [player.id, player]),
  );
  const teamOneFirst = playersById.get(teamRows[0].player_id);
  const teamOneSecond = playersById.get(teamRows[1].player_id);
  const teamTwoFirst = playersById.get(teamRows[2].player_id);
  const teamTwoSecond = playersById.get(teamRows[3].player_id);
  if (!teamOneFirst || !teamOneSecond || !teamTwoFirst || !teamTwoSecond) {
    return invalidGame(game.id, 'result teams');
  }
  const teams: GameTeams = [
    [teamOneFirst, teamOneSecond],
    [teamTwoFirst, teamTwoSecond],
  ];

  const setRows = persistedRows.resultSets
    .filter((row) => row.game_id === game.id)
    .sort((left, right) => left.set_number - right.set_number);
  if (
    (setRows.length !== 2 && setRows.length !== 3) ||
    setRows.some((row, index) => row.set_number !== index + 1)
  ) {
    return invalidGame(game.id, 'result sets');
  }
  const sets: GameResultSets =
    setRows.length === 2
      ? [
          [setRows[0].team_one_score, setRows[0].team_two_score],
          [setRows[1].team_one_score, setRows[1].team_two_score],
        ]
      : [
          [setRows[0].team_one_score, setRows[0].team_two_score],
          [setRows[1].team_one_score, setRows[1].team_two_score],
          [setRows[2].team_one_score, setRows[2].team_two_score],
        ];
  const result = createGameResult({ game, sets, teams });
  return result ?? invalidGame(game.id, 'result');
}

export function gamesFromRows(rows: PersistedGameRows): readonly Game[] {
  const profilesById = new Map(
    rows.profiles.map((profile) => [profile.id, profile]),
  );
  return rows.games.map((row) => {
    const durationMinutes =
      row.duration_minutes === 60 || row.duration_minutes === 90
        ? row.duration_minutes
        : invalidGame(row.id, 'duration');
    const base: ScheduledGame = {
      id: row.id,
      lifecycle: { status: 'scheduled' },
      name: row.name,
      participants: participantsForGame({
        game: row,
        participants: rows.participants,
        profilesById,
      }),
      schedule: scheduleFromStartsAt(row.starts_at),
      setup: { durationMinutes, format: row.format },
      venue: row.venue_name,
    };

    switch (row.status) {
      case 'scheduled':
        return base;
      case 'awaiting_result':
        return row.ended_at
          ? {
              ...base,
              lifecycle: {
                endedAt: row.ended_at,
                status: 'awaitingResult' as const,
              },
            }
          : invalidGame(row.id, 'lifecycle');
      case 'cancelled':
        return row.cancelled_at
          ? {
              ...base,
              lifecycle: {
                cancelledAt: row.cancelled_at,
                status: 'cancelled' as const,
              },
            }
          : invalidGame(row.id, 'lifecycle');
      case 'completed':
        if (!row.completed_at || !row.ended_at) {
          return invalidGame(row.id, 'lifecycle');
        }
        return {
          ...base,
          lifecycle: {
            completedAt: row.completed_at,
            result: resultForGame({ game: base, persistedRows: rows }),
            status: 'completed' as const,
          },
        };
    }
  });
}

async function readGames(
  client: PadelSupabaseClient,
  gameId?: string,
): Promise<readonly Game[]> {
  const gameQuery = client.from('games').select('*');
  const gameResponse = gameId
    ? await gameQuery.eq('id', gameId)
    : await gameQuery.order('starts_at');
  if (gameResponse.error) throw gameResponse.error;
  if (gameResponse.data.length === 0) return [];

  const gameIds = gameResponse.data.map((game) => game.id);
  const [
    participantResponse,
    resultResponse,
    resultSetResponse,
    resultTeamResponse,
  ] = await Promise.all([
    client.from('game_participants').select('*').in('game_id', gameIds),
    client.from('game_results').select('*').in('game_id', gameIds),
    client.from('game_result_sets').select('*').in('game_id', gameIds),
    client.from('game_result_teams').select('*').in('game_id', gameIds),
  ]);
  if (participantResponse.error) throw participantResponse.error;
  if (resultResponse.error) throw resultResponse.error;
  if (resultSetResponse.error) throw resultSetResponse.error;
  if (resultTeamResponse.error) throw resultTeamResponse.error;

  const playerIds = [
    ...new Set(participantResponse.data.map((row) => row.player_id)),
  ];
  const profileResponse = await client
    .from('profiles')
    .select('*')
    .in('id', playerIds);
  if (profileResponse.error) throw profileResponse.error;

  return gamesFromRows({
    games: gameResponse.data,
    participants: participantResponse.data,
    profiles: profileResponse.data,
    resultSets: resultSetResponse.data,
    resultTeams: resultTeamResponse.data,
    results: resultResponse.data,
  });
}

async function requiredGame(client: PadelSupabaseClient, gameId: string) {
  const [game] = await readGames(client, gameId);
  if (!game) {
    throw new Error(`Game ${gameId} disappeared after a successful mutation.`);
  }
  return game;
}

function resultData(
  command: Extract<GameLifecycleCommand, { type: 'recordResult' }>,
) {
  return {
    sets: command.result.sets.map(([teamOne, teamTwo]) => [teamOne, teamTwo]),
    teams: command.result.teams.map(([first, second]) => [first, second]),
  } satisfies Json;
}

export function createSupabaseGameRepository(
  client: PadelSupabaseClient,
): GameRepository {
  return {
    create: async (draft: GameDraft) => {
      const venueName = draft.venueQuery.trim();
      if (draft.schedule.status !== 'complete' || venueName.length === 0) {
        throw new Error('A game requires a venue, day, and start time.');
      }
      const { data: gameId, error } = await client.rpc('create_game', {
        duration_minutes: draft.setup.durationMinutes,
        format: draft.setup.format,
        game_name: gameDraftName(draft),
        starts_at: draft.schedule.startsAt,
        venue_name: venueName,
      });
      if (error) throw error;
      const game = await requiredGame(client, gameId);
      if (!isScheduledGame(game)) {
        throw new Error(`New game ${gameId} was not scheduled.`);
      }
      publishGameChange();
      return game;
    },
    findById: async (gameId) => (await readGames(client, gameId))[0] ?? null,
    join: async (gameId): Promise<JoinGameResult> => {
      const { data: status, error } = await client.rpc('join_game', {
        game_id: gameId,
      });
      if (error) throw error;
      if (status === 'not_found') return { status: 'notFound' };

      const game = await requiredGame(client, gameId);
      switch (status) {
        case 'joined':
          publishGameChange();
          return { game, status: 'joined' };
        case 'already_joined':
          return { game, status: 'alreadyJoined' };
        case 'full':
          return { game, status: 'full' };
        case 'unavailable':
          return { game, status: 'unavailable' };
        default:
          throw new Error(`Unexpected join_game result: ${status}.`);
      }
    },
    leave: async (gameId) => {
      const { data: status, error } = await client.rpc('leave_game', {
        game_id: gameId,
      });
      if (error) throw error;
      if (status === 'not_found') return { status: 'notFound' };
      const game = await requiredGame(client, gameId);
      switch (status) {
        case 'left':
          publishGameChange();
          return { game, status: 'left' };
        case 'already_left':
          return { game, status: 'alreadyLeft' };
        case 'organiser':
          return { game, status: 'organiser' };
        case 'unavailable':
          return { game, status: 'unavailable' };
        default:
          throw new Error(`Unexpected leave_game result: ${status}.`);
      }
    },
    reschedule: async (gameId, schedule) => {
      const { data: status, error } = await client.rpc('reschedule_game', {
        game_id: gameId,
        starts_at: schedule.startsAt,
      });
      if (error) throw error;
      if (status === 'not_found') return { status: 'notFound' };
      const game = await requiredGame(client, gameId);
      switch (status) {
        case 'rescheduled':
          publishGameChange();
          return { game, status: 'rescheduled' };
        case 'players_joined':
          return { game, status: 'playersJoined' };
        case 'forbidden':
          return { game, status: 'forbidden' };
        case 'unavailable':
          return { game, status: 'unavailable' };
        default:
          throw new Error(`Unexpected reschedule_game result: ${status}.`);
      }
    },
    list: () => readGames(client),
    transitionLifecycle: async (
      gameId,
      command,
    ): Promise<TransitionGameLifecycleResult> => {
      const { data: status, error } = await client.rpc(
        'transition_game_lifecycle',
        command.type === 'recordResult'
          ? {
              game_id: gameId,
              lifecycle_command: 'record_result',
              occurred_at: command.at,
              result_data: resultData(command),
            }
          : {
              game_id: gameId,
              lifecycle_command: command.type,
              occurred_at: command.at,
            },
      );
      if (error) throw error;
      if (status === 'not_found') return { status: 'notFound' };

      const game = await requiredGame(client, gameId);
      if (status === 'transitioned') {
        publishGameChange();
        return { game, status: 'transitioned' };
      }
      if (status === 'invalid_transition' || status === 'forbidden') {
        return { game, status: 'invalidTransition' };
      }
      throw new Error(
        `Unexpected transition_game_lifecycle result: ${status}.`,
      );
    },
  };
}
