import { describe, expect, it } from '@jest/globals';

import {
  demoCurrentGamePlayer,
  demoGames,
} from '../src/features/demo/demoData';
import {
  applyGameLifecycleCommand,
  createGameResult,
  gameTeams,
  isScheduledGame,
} from '../src/features/games/game';
import {
  completedGameListCard,
  completedGamesForPlayer,
  gamesInCollection,
} from '../src/features/games/gameCardViewModel';

describe('game lifecycle', () => {
  it('moves a scheduled game through result confirmation to completion', () => {
    const scheduledGame = demoGames[3];

    const awaitingResult = applyGameLifecycleCommand(scheduledGame, {
      at: '2026-09-30T19:30:00.000Z',
      type: 'finish',
    });
    expect(awaitingResult?.lifecycle).toEqual({
      endedAt: '2026-09-30T19:30:00.000Z',
      status: 'awaitingResult',
    });
    if (!awaitingResult) throw new Error('Expected a valid finish transition.');
    const teams = gameTeams(awaitingResult);
    if (teams === null) throw new Error('Expected four-player teams.');

    const result = createGameResult({
      game: awaitingResult,
      sets: [
        [6, 4],
        [7, 5],
      ],
      teams,
    });
    if (!result) throw new Error('Expected a valid game result.');

    const completed = applyGameLifecycleCommand(awaitingResult, {
      at: '2026-09-30T20:00:00.000Z',
      result,
      type: 'recordResult',
    });
    expect(completed?.lifecycle).toEqual({
      completedAt: '2026-09-30T20:00:00.000Z',
      result: {
        sets: [
          [6, 4],
          [7, 5],
        ],
        teams: [
          ['alex-morgan', 'jamie-taylor'],
          ['sam-kim', 'riley-brown'],
        ],
      },
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
        result: {
          sets: [
            [6, 4],
            [6, 4],
          ],
          teams: [
            ['alex-morgan', 'jamie-taylor'],
            ['sam-kim', 'riley-brown'],
          ],
        },
        type: 'recordResult',
      }),
    ).toBeNull();
  });

  it('accepts only valid straight-set results for four-player games', () => {
    const teams = gameTeams(demoGames[3]);
    if (teams === null) throw new Error('Expected four-player teams.');
    expect(
      createGameResult({
        game: demoGames[3],
        sets: [
          [6, 4],
          [7, 6],
        ],
        teams,
      }),
    ).toEqual({
      sets: [
        [6, 4],
        [7, 6],
      ],
      teams: [
        ['alex-morgan', 'jamie-taylor'],
        ['sam-kim', 'riley-brown'],
      ],
    });
    expect(
      createGameResult({
        game: demoGames[3],
        sets: [
          [6, 5],
          [6, 4],
        ],
        teams,
      }),
    ).toBeNull();
    expect(
      createGameResult({
        game: demoGames[3],
        sets: [
          [6, 4],
          [4, 6],
        ],
        teams,
      }),
    ).toBeNull();
    expect(
      createGameResult({
        game: demoGames[3],
        sets: [
          [6, -1],
          [6, 4],
        ],
        teams,
      }),
    ).toBeNull();
    expect(
      createGameResult({
        game: demoGames[0],
        sets: [
          [6, 4],
          [6, 4],
        ],
        teams,
      }),
    ).toBeNull();
    expect(
      createGameResult({
        game: demoGames[3],
        sets: [
          [6, 4],
          [6, 4],
        ],
        teams: [
          [teams[0][0], teams[0][0]],
          [teams[1][0], teams[1][1]],
        ],
      }),
    ).toBeNull();
  });

  it('rejects an invalid result at the lifecycle boundary', () => {
    const awaitingResult = applyGameLifecycleCommand(demoGames[3], {
      at: '2026-10-01T20:30:00.000Z',
      type: 'finish',
    });
    if (awaitingResult === null) {
      throw new Error('Expected a valid finish transition.');
    }

    expect(
      applyGameLifecycleCommand(awaitingResult, {
        at: '2026-10-01T21:00:00.000Z',
        result: {
          sets: [
            [5, 4],
            [6, 4],
          ],
          teams: [
            ['alex-morgan', 'jamie-taylor'],
            ['sam-kim', 'riley-brown'],
          ],
        },
        type: 'recordResult',
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

  it('lists completed games for participating players newest first', () => {
    const completedGames = completedGamesForPlayer(
      demoGames,
      demoCurrentGamePlayer.id,
    );

    expect(completedGames.map((game) => game.id)).toEqual([
      'demo-completed-loss',
      'demo-completed-game',
    ]);
    expect(
      completedGameListCard(completedGames[0], demoCurrentGamePlayer.id),
    ).toMatchObject({
      detailSecondary: 'Mon 28 Sept · 19:30 · 3–6, 4–6',
      eyebrow: 'You lost',
      illustration: 'matchLost',
      participants: expect.arrayContaining([
        expect.objectContaining({ name: 'Alex Morgan' }),
      ]),
      title: 'Monday Night Padel',
      variant: 'illustrated',
    });
    expect(
      completedGameListCard(completedGames[1], demoCurrentGamePlayer.id),
    ).toMatchObject({
      detailSecondary: 'Sun 27 Sept · 18:00 · 6–4, 6–3',
      eyebrow: 'You won',
      illustration: 'matchWon',
      title: 'Sunday Evening Padel',
      variant: 'illustrated',
    });
  });
});
