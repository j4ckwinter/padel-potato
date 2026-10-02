import type { GameScheduleDraft, GameDraft } from '../game-creation/gameDraft';
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

export type LeaveGameResult =
  | Readonly<{
      game: Game;
      status: 'left' | 'alreadyLeft' | 'unavailable' | 'organiser';
    }>
  | Readonly<{ status: 'notFound' }>;

export type RescheduleGameResult =
  | Readonly<{
      game: Game;
      status: 'rescheduled' | 'unavailable' | 'forbidden' | 'playersJoined';
    }>
  | Readonly<{ status: 'notFound' }>;

export type GameRepository = Readonly<{
  create: (draft: GameDraft) => Promise<ScheduledGame>;
  findById: (gameId: string) => Promise<Game | null>;
  join: (gameId: string) => Promise<JoinGameResult>;
  leave: (gameId: string) => Promise<LeaveGameResult>;
  reschedule: (
    gameId: string,
    schedule: Extract<GameScheduleDraft, { status: 'complete' }>,
  ) => Promise<RescheduleGameResult>;
  list: () => Promise<readonly Game[]>;
  transitionLifecycle: (
    gameId: string,
    command: GameLifecycleCommand,
  ) => Promise<TransitionGameLifecycleResult>;
}>;
