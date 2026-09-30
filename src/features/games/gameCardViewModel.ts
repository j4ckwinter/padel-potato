import type {
  GameCardParticipant,
  GameCardProps,
} from '../../design-system/components/content';
import {
  availableGameSpots,
  gameHasPlayer,
  gameResultWinner,
  isCompletedGame,
  isScheduledGame,
  type CompletedGame,
  type Game,
  type GamePlayer,
  type ScheduledGame,
} from './game';

type BrowsableGameCardProps = Extract<
  GameCardProps,
  { variant: 'next' | 'open' }
>;
export type GameListCardProps = BrowsableGameCardProps extends infer Props
  ? Props extends Readonly<{ onViewGame: () => void }>
    ? Omit<Props, 'onViewGame'>
    : never
  : never;
type CompletedGameCardProps = Extract<
  GameCardProps,
  { illustration: 'matchLost' | 'matchWon'; variant: 'illustrated' }
>;
export type CompletedGameListCardProps = Omit<
  CompletedGameCardProps,
  'onViewResults'
>;

export type GameCollection = 'discover' | 'mine';

const weekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
});
const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short' });

function gameDay(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number);
  return weekdayFormatter.format(new Date(year, month - 1, day));
}

function cardParticipant(
  player: GamePlayer,
  slot: 1 | 2 | 3 | 4,
): GameCardParticipant {
  return {
    initials: player.initials,
    name: player.name,
    presence: 'online',
    slot,
  };
}

function cardCopy(game: Game) {
  const [year, month, day] = game.schedule.date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return {
    time: `${gameDay(game.schedule.date)} ${day} ${monthFormatter.format(date)} · ${game.schedule.time} · ${game.setup.durationMinutes} min`,
    title: game.name,
    venue: game.venue,
  };
}

function completedCardDateTime(game: CompletedGame) {
  const [year, month, day] = game.schedule.date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${gameDay(game.schedule.date)} ${day} ${monthFormatter.format(date)} · ${game.schedule.time}`;
}

export function completedGameListCard(
  game: CompletedGame,
  currentPlayerId: string,
): CompletedGameListCardProps {
  const result = game.lifecycle.result;
  const currentTeam = result.teams[0].includes(currentPlayerId) ? 0 : 1;
  const score = result.sets
    .map((set) =>
      currentTeam === 0 ? `${set[0]}–${set[1]}` : `${set[1]}–${set[0]}`,
    )
    .join(', ');
  const won = gameResultWinner(result) === currentTeam;

  return {
    detailPrimary: game.venue,
    detailSecondary: `${completedCardDateTime(game)} · ${score}`,
    eyebrow: won ? 'You won' : 'You lost',
    illustration: won ? 'matchWon' : 'matchLost',
    participants: [
      cardParticipant(game.participants[0].player, 1),
      cardParticipant(game.participants[1].player, 2),
      cardParticipant(game.participants[2].player, 3),
      cardParticipant(game.participants[3].player, 4),
    ],
    title: game.name,
    variant: 'illustrated',
  };
}

export function gameListCard(
  game: ScheduledGame,
  currentPlayerId: string,
): GameListCardProps {
  const copy = cardCopy(game);

  switch (game.participants.length) {
    case 1:
      return {
        ...copy,
        full: false,
        participants: [cardParticipant(game.participants[0].player, 1)],
        variant: 'open',
      };
    case 2:
      return {
        ...copy,
        full: false,
        participants: [
          cardParticipant(game.participants[0].player, 1),
          cardParticipant(game.participants[1].player, 2),
        ],
        variant: 'open',
      };
    case 3:
      return {
        ...copy,
        full: false,
        participants: [
          cardParticipant(game.participants[0].player, 1),
          cardParticipant(game.participants[1].player, 2),
          cardParticipant(game.participants[2].player, 3),
        ],
        variant: 'open',
      };
    case 4: {
      const participants = [
        cardParticipant(game.participants[0].player, 1),
        cardParticipant(game.participants[1].player, 2),
        cardParticipant(game.participants[2].player, 3),
        cardParticipant(game.participants[3].player, 4),
      ] as const;
      return gameHasPlayer(game, currentPlayerId)
        ? { ...copy, participants, variant: 'next' }
        : { ...copy, full: true, participants, variant: 'open' };
    }
  }
}

export function gamesInCollection(
  games: readonly Game[],
  collection: GameCollection,
  currentPlayerId: string,
) {
  return [...games]
    .filter(isScheduledGame)
    .filter((game) =>
      collection === 'mine'
        ? gameHasPlayer(game, currentPlayerId)
        : !gameHasPlayer(game, currentPlayerId) && availableGameSpots(game) > 0,
    )
    .sort((left, right) =>
      left.schedule.startsAt.localeCompare(right.schedule.startsAt),
    );
}

export function completedGamesForPlayer(
  games: readonly Game[],
  currentPlayerId: string,
) {
  return [...games]
    .filter(isCompletedGame)
    .filter((game) => gameHasPlayer(game, currentPlayerId))
    .sort((left, right) =>
      right.lifecycle.completedAt.localeCompare(left.lifecycle.completedAt),
    );
}
