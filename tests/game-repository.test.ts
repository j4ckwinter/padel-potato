import { describe, expect, it } from '@jest/globals';

import {
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
import { createGame, findGameById } from '../src/features/games/gameRepository';

describe('game repository', () => {
  it('creates and retrieves a game from a complete draft', async () => {
    const draft = updateGameVenue(
      selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
      'Potato Padel Club',
    );

    const created = await createGame(draft);

    expect(created).toMatchObject({
      name: 'Friday Evening Padel',
      schedule: {
        date: '2026-10-02',
        time: '18:30',
      },
      setup: {
        durationMinutes: 60,
        format: 'Social game',
        currentPlayerCount: 1,
      },
      venue: 'Potato Padel Club',
    });
    await expect(findGameById(created.id)).resolves.toEqual(created);
  });

  it('rejects an incomplete draft', async () => {
    await expect(createGame(initialGameDraft)).rejects.toThrow(
      'A game requires a venue, day, and start time.',
    );
  });

  it('resolves demo games opened from the Games tab', async () => {
    await expect(findGameById('demo-canary-social')).resolves.toMatchObject({
      id: 'demo-canary-social',
      name: 'Sunday Social Padel',
      venue: 'Canary Wharf Padel',
    });
  });
});
