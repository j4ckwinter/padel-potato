import { describe, expect, it } from '@jest/globals';

import {
  initialGameDraft,
  incrementCurrentPlayers,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
import {
  demoCurrentGamePlayer,
  demoParticipantsForCount,
} from '../src/features/demo/demoData';
import {
  createGame,
  findGameById,
  joinGame,
  listGames,
  transitionGameLifecycle,
} from '../src/features/games/gameRepository';

describe('game repository', () => {
  it('creates and retrieves a game from a complete draft', async () => {
    const draft = updateGameVenue(
      selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
      'Potato Padel Club',
    );

    const created = await createGame({
      draft,
      participants: demoParticipantsForCount(draft.setup.currentPlayerCount),
    });

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
    await expect(findGameById(created.id)).resolves.toEqual(created);
  });

  it('rejects an incomplete draft', async () => {
    await expect(
      createGame({
        draft: initialGameDraft,
        participants: demoParticipantsForCount(1),
      }),
    ).rejects.toThrow('A game requires a venue, day, and start time.');
  });

  it('rejects participant records that disagree with the setup', async () => {
    const twoPlayerDraft = incrementCurrentPlayers(
      updateGameVenue(
        selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
        'Potato Padel Club',
      ),
    );

    await expect(
      createGame({
        draft: twoPlayerDraft,
        participants: demoParticipantsForCount(1),
      }),
    ).rejects.toThrow('The selected players must match the game setup.');
  });

  it('resolves demo games opened from the Games tab', async () => {
    await expect(findGameById('demo-canary-social')).resolves.toMatchObject({
      id: 'demo-canary-social',
      name: 'Sunday Social Padel',
      venue: 'Canary Wharf Padel',
    });
  });

  it('joins an open game once and exposes the updated record', async () => {
    const result = await joinGame(
      'demo-shoreditch-evening',
      demoCurrentGamePlayer,
    );

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
    await expect(
      joinGame('demo-shoreditch-evening', demoCurrentGamePlayer),
    ).resolves.toMatchObject({ status: 'alreadyJoined' });
    await expect(
      findGameById('demo-shoreditch-evening'),
    ).resolves.toMatchObject({
      participants: [{ role: 'organiser' }, { role: 'player' }],
    });
    await expect(listGames()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'demo-shoreditch-evening' }),
      ]),
    );
  });

  it('reports full and missing games without changing them', async () => {
    const anotherPlayer = {
      id: 'another-player',
      initials: 'AP',
      name: 'Another Player',
      rating: '4.0',
    };

    await expect(
      joinGame('demo-my-next-game', anotherPlayer),
    ).resolves.toMatchObject({ status: 'full' });
    await expect(joinGame('missing-game', anotherPlayer)).resolves.toEqual({
      status: 'notFound',
    });
  });

  it('persists lifecycle transitions and closes inactive games to players', async () => {
    const draft = updateGameVenue(
      selectGameTime(selectGameDay(initialGameDraft, '2026-10-08'), '18:30'),
      'Lifecycle Padel Club',
    );
    const created = await createGame({
      draft,
      participants: demoParticipantsForCount(1),
    });

    await expect(
      transitionGameLifecycle(created.id, {
        at: '2026-10-08T19:30:00.000Z',
        type: 'finish',
      }),
    ).resolves.toMatchObject({
      game: { lifecycle: { status: 'awaitingResult' } },
      status: 'transitioned',
    });
    await expect(
      joinGame(created.id, {
        id: 'late-player',
        initials: 'LP',
        name: 'Late Player',
        rating: '4.2',
      }),
    ).resolves.toMatchObject({ status: 'unavailable' });
    await expect(
      transitionGameLifecycle(created.id, {
        at: '2026-10-08T20:00:00.000Z',
        type: 'complete',
      }),
    ).resolves.toMatchObject({
      game: { lifecycle: { status: 'completed' } },
      status: 'transitioned',
    });
    await expect(
      transitionGameLifecycle(created.id, {
        at: '2026-10-08T20:30:00.000Z',
        type: 'cancel',
      }),
    ).resolves.toMatchObject({ status: 'invalidTransition' });
    await expect(
      transitionGameLifecycle('missing-game', {
        at: '2026-10-08T20:30:00.000Z',
        type: 'cancel',
      }),
    ).resolves.toEqual({ status: 'notFound' });
  });
});
