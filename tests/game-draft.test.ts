import { describe, expect, it } from '@jest/globals';

import {
  decrementCurrentPlayers,
  gameDraftName,
  incrementCurrentPlayers,
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  updateGameDuration,
  updateGameFormat,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';

describe('game draft schedule', () => {
  it('generates the game name from the selected day and time', () => {
    const complete = selectGameTime(
      selectGameDay(initialGameDraft, '2026-10-03'),
      '18:30',
    );

    expect(gameDraftName(complete)).toBe('Saturday Evening Padel');
  });

  it('only becomes complete after a valid day and time are selected', () => {
    const withDay = selectGameDay(initialGameDraft, '2026-10-02');
    const complete = selectGameTime(withDay, '18:30');

    expect(withDay).toEqual({
      schedule: { date: '2026-10-02', status: 'daySelected' },
      setup: {
        durationMinutes: 60,
        format: 'Social game',
        currentPlayerCount: 1,
      },
      venueQuery: '',
    });
    expect(complete).toEqual({
      schedule: {
        date: '2026-10-02',
        startsAt: new Date(2026, 9, 2, 18, 30).toISOString(),
        status: 'complete',
        time: '18:30',
      },
      setup: {
        durationMinutes: 60,
        format: 'Social game',
        currentPlayerCount: 1,
      },
      venueQuery: '',
    });
  });

  it('clears the chosen time when the day changes', () => {
    const complete = selectGameTime(
      selectGameDay(initialGameDraft, '2026-10-02'),
      '19:00',
    );

    expect(selectGameDay(complete, '2026-10-03')).toEqual({
      schedule: { date: '2026-10-03', status: 'daySelected' },
      setup: {
        durationMinutes: 60,
        format: 'Social game',
        currentPlayerCount: 1,
      },
      venueQuery: '',
    });
  });

  it('keeps the required venue query with the draft', () => {
    expect(
      updateGameVenue(initialGameDraft, 'Potato Padel Club').venueQuery,
    ).toBe('Potato Padel Club');
  });

  it('updates the configurable game setup choices', () => {
    const withDuration = updateGameDuration(initialGameDraft, 90);
    const competitive = updateGameFormat(withDuration, 'Competitive game');

    expect(competitive.setup).toEqual({
      durationMinutes: 90,
      format: 'Competitive game',
      currentPlayerCount: 1,
    });
  });

  it('keeps the player count between one and four', () => {
    const twoPlayers = incrementCurrentPlayers(initialGameDraft);
    const fourPlayers = incrementCurrentPlayers(
      incrementCurrentPlayers(twoPlayers),
    );

    expect(twoPlayers.setup.currentPlayerCount).toBe(2);
    expect(decrementCurrentPlayers(twoPlayers).setup.currentPlayerCount).toBe(
      1,
    );
    expect(fourPlayers.setup.currentPlayerCount).toBe(4);
    expect(incrementCurrentPlayers(fourPlayers).setup.currentPlayerCount).toBe(
      4,
    );
    expect(
      decrementCurrentPlayers(initialGameDraft).setup.currentPlayerCount,
    ).toBe(1);
  });

  it('rejects impossible schedule transitions at the domain boundary', () => {
    expect(() => selectGameTime(initialGameDraft, '18:30')).toThrow(
      'Select a game day before selecting a time.',
    );
    expect(() => selectGameDay(initialGameDraft, '2026-02-30')).toThrow(
      'Invalid game date: 2026-02-30',
    );
    expect(() =>
      selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '25:00'),
    ).toThrow('Invalid game time: 25:00');
  });
});
