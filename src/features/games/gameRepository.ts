import type { GameDraft } from '../game-creation/gameDraft';
import type { Game, GameLifecycleCommand, ScheduledGame } from './game';

export type JoinGameResult =
  | Readonly<{ game: Game; status: 'joined' }>
  | Readonly<{ game: Game; status: 'alreadyJoined' }>
  | Readonly<{ game: Game; status: 'full' }>
  | Readonly<{ game: Game; status: 'unavailable' }>
  | Readonly<{ status: 'notFound' }>;

export type TransitionGameLifecycleResult =
  | Readonly<{ game: Game; status: 'transitioned' }>
  | Readonly<{ game: Game; status: 'invalidTransition' }>
  | Readonly<{ status: 'notFound' }>;

export type GameRepository = Readonly<{
  create: (draft: GameDraft) => Promise<ScheduledGame>;
  findById: (gameId: string) => Promise<Game | null>;
  join: (gameId: string) => Promise<JoinGameResult>;
  list: () => Promise<readonly Game[]>;
  transitionLifecycle: (
    gameId: string,
    command: GameLifecycleCommand,
  ) => Promise<TransitionGameLifecycleResult>;
}>;
