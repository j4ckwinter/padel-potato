import { describe, expect, it } from '@jest/globals';

import {
  initialGameDraft,
  incrementCurrentPlayers,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
import { demoCurrentGamePlayer } from '../src/features/demo/demoData';
import { createDemoGameRepository } from '../src/features/demo/demoGameRepository';
import { createGameResult, gameTeams } from '../src/features/games/game';

const games = createDemoGameRepository(demoCurrentGamePlayer);

describe('game repository', () => {
  it('creates and retrieves a game from a complete draft', async () => {
    const draft = updateGameVenue(
      selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
      'Potato Padel Club',
    );

    const created = await games.create(draft);

    expect(created).toMatchObject({
      lifecycle: { status: 'scheduled' },
      name: 'Friday Evening Padel',
      schedule: {
        date: '2026-10-02',
        time: '18:30',
      },
      setup: {
        durationMinutes: 60,
        format: 'Social game',
      },
      venue: 'Potato Padel Club',
    });
    expect(created.participants).toHaveLength(1);
    await expect(games.findById(created.id)).resolves.toEqual(created);
  });

  it('rejects an incomplete draft', async () => {
    await expect(games.create(initialGameDraft)).rejects.toThrow(
      'A game requires a venue, day, and start time.',
    );
  });

  it('creates the selected number of current players', async () => {
    const twoPlayerDraft = incrementCurrentPlayers(
      updateGameVenue(
        selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
        'Potato Padel Club',
      ),
    );

    await expect(games.create(twoPlayerDraft)).resolves.toMatchObject({
      participants: [
        {
          player: { id: demoCurrentGamePlayer.id },
          role: 'organiser',
        },
        { role: 'player' },
      ],
    });
  });

  it('creates games for the player bound to the repository', async () => {
    const anotherPlayer = {
      id: 'another-player',
      initials: 'AP',
      name: 'Another Player',
      rating: '4.0',
    } as const;
    const anotherPlayersGames = createDemoGameRepository(anotherPlayer);
    const draft = updateGameVenue(
      selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
      'Potato Padel Club',
    );

    await expect(anotherPlayersGames.create(draft)).resolves.toMatchObject({
      participants: [{ player: anotherPlayer, role: 'organiser' }],
    });
  });

  it('resolves demo games opened from the Games tab', async () => {
    await expect(games.findById('demo-canary-social')).resolves.toMatchObject({
      id: 'demo-canary-social',
      name: 'Sunday Social Padel',
      venue: 'Canary Wharf Padel',
    });
  });

  it('joins an open game once and exposes the updated record', async () => {
    const result = await games.join('demo-shoreditch-evening');

    expect(result).toMatchObject({
      game: {
        id: 'demo-shoreditch-evening',
        participants: [
          { role: 'organiser' },
          { player: { id: demoCurrentGamePlayer.id }, role: 'player' },
        ],
      },
      status: 'joined',
    });
    await expect(games.join('demo-shoreditch-evening')).resolves.toMatchObject({
      status: 'alreadyJoined',
    });
    await expect(
      games.findById('demo-shoreditch-evening'),
    ).resolves.toMatchObject({
      participants: [{ role: 'organiser' }, { role: 'player' }],
    });
    await expect(games.list()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'demo-shoreditch-evening' }),
      ]),
    );
  });

  it('reports full and missing games without changing them', async () => {
    const otherPlayerGames = createDemoGameRepository({
      id: 'another-player',
      initials: 'AP',
      name: 'Another Player',
      rating: '4.0',
    });

    await expect(
      otherPlayerGames.join('demo-my-next-game'),
    ).resolves.toMatchObject({
      status: 'full',
    });
    await expect(otherPlayerGames.join('missing-game')).resolves.toEqual({
      status: 'notFound',
    });
  });

  it('persists lifecycle transitions and closes inactive games to players', async () => {
    const transition = await games.transitionLifecycle('demo-my-next-game', {
      at: '2026-10-08T19:30:00.000Z',
      type: 'finish',
    });
    expect(transition).toMatchObject({
      game: { lifecycle: { status: 'awaitingResult' } },
      status: 'transitioned',
    });
    if (transition.status !== 'transitioned') {
      throw new Error('Expected the game to await its result.');
    }
    await expect(games.join(transition.game.id)).resolves.toMatchObject({
      status: 'unavailable',
    });
    const teams = gameTeams(transition.game);
    if (teams === null) throw new Error('Expected four-player teams.');
    const result = createGameResult({
      game: transition.game,
      sets: [
        [6, 4],
        [6, 3],
      ],
      teams,
    });
    if (result === null) throw new Error('Expected a valid result.');
    await expect(
      games.transitionLifecycle(transition.game.id, {
        at: '2026-10-08T20:00:00.000Z',
        result,
        type: 'recordResult',
      }),
    ).resolves.toMatchObject({
      game: { lifecycle: { result, status: 'completed' } },
      status: 'transitioned',
    });
    await expect(
      games.transitionLifecycle(transition.game.id, {
        at: '2026-10-08T20:30:00.000Z',
        type: 'cancel',
      }),
    ).resolves.toMatchObject({ status: 'invalidTransition' });
    await expect(
      games.transitionLifecycle('missing-game', {
        at: '2026-10-08T20:30:00.000Z',
        type: 'cancel',
      }),
    ).resolves.toEqual({ status: 'notFound' });
  });
});
