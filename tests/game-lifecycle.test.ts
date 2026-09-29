import { describe, expect, it } from '@jest/globals';

import {
  demoCurrentGamePlayer,
  demoGames,
} from '../src/features/demo/demoData';
import {
  applyGameLifecycleCommand,
  isScheduledGame,
} from '../src/features/games/game';
import { gamesInCollection } from '../src/features/games/gameCardViewModel';

describe('game lifecycle', () => {
  it('moves a scheduled game through result confirmation to completion', () => {
    const scheduledGame = demoGames[0];

    const awaitingResult = applyGameLifecycleCommand(scheduledGame, {
      at: '2026-09-30T19:30:00.000Z',
      type: 'finish',
    });
    expect(awaitingResult?.lifecycle).toEqual({
      endedAt: '2026-09-30T19:30:00.000Z',
      status: 'awaitingResult',
    });
    if (!awaitingResult) throw new Error('Expected a valid finish transition.');

    const completed = applyGameLifecycleCommand(awaitingResult, {
      at: '2026-09-30T20:00:00.000Z',
      type: 'complete',
    });
    expect(completed?.lifecycle).toEqual({
      completedAt: '2026-09-30T20:00:00.000Z',
      status: 'completed',
    });
  });

  it('allows cancellation only while a game is scheduled', () => {
    const cancelled = applyGameLifecycleCommand(demoGames[0], {
      at: '2026-09-29T10:00:00.000Z',
      type: 'cancel',
    });
    expect(cancelled?.lifecycle).toEqual({
      cancelledAt: '2026-09-29T10:00:00.000Z',
      status: 'cancelled',
    });
    if (!cancelled) throw new Error('Expected a valid cancellation.');

    expect(
      applyGameLifecycleCommand(cancelled, {
        at: '2026-09-29T11:00:00.000Z',
        type: 'finish',
      }),
    ).toBeNull();
    expect(
      applyGameLifecycleCommand(demoGames[0], {
        at: '2026-09-29T11:00:00.000Z',
        type: 'complete',
      }),
    ).toBeNull();
  });

  it('keeps inactive games out of active card collections', () => {
    const cancelled = applyGameLifecycleCommand(demoGames[0], {
      at: '2026-09-29T10:00:00.000Z',
      type: 'cancel',
    });
    if (!cancelled) throw new Error('Expected a valid cancellation.');

    expect(isScheduledGame(demoGames[0])).toBe(true);
    expect(isScheduledGame(cancelled)).toBe(false);
    expect(
      gamesInCollection([cancelled], 'discover', demoCurrentGamePlayer.id),
    ).toEqual([]);
  });
});
