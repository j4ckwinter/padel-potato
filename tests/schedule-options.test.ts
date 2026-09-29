import { describe, expect, it } from '@jest/globals';

import {
  upcomingScheduleTimes,
  upcomingScheduleDays,
} from '../src/features/game-creation/scheduleOptions';

describe('schedule options', () => {
  it('offers seven local calendar days while today still has a start time', () => {
    const days = upcomingScheduleDays(new Date(2026, 8, 25, 18, 12));

    expect(days).toHaveLength(7);
    expect(days[0]).toEqual({
      date: '2026-09-25',
      dateLabel: '25 Sept',
      dayLabel: 'Today',
    });
    expect(days[6]).toEqual({
      date: '2026-10-01',
      dateLabel: '1 Oct',
      dayLabel: 'Thu',
    });
  });

  it('starts with tomorrow after the final start time has passed', () => {
    const now = new Date(2026, 8, 25, 21, 31);
    const days = upcomingScheduleDays(now);

    expect(days).toHaveLength(7);
    expect(days[0]).toEqual({
      date: '2026-09-26',
      dateLabel: '26 Sept',
      dayLabel: 'Sat',
    });
    expect(upcomingScheduleTimes(days[0]?.date ?? null, now)[0]).toBe('06:00');
    expect(days[6]).toEqual({
      date: '2026-10-02',
      dateLabel: '2 Oct',
      dayLabel: 'Fri',
    });
  });

  it('limits slots to 06:00 through 21:30', () => {
    const now = new Date(2026, 8, 25, 18, 12);
    const today = upcomingScheduleTimes('2026-09-25', now);
    const tomorrow = upcomingScheduleTimes('2026-09-26', now);
    const earlyToday = upcomingScheduleTimes(
      '2026-09-25',
      new Date(2026, 8, 25, 5, 12),
    );

    expect(today[0]).toBe('18:30');
    expect(today.at(-1)).toBe('21:30');
    expect(earlyToday[0]).toBe('06:00');
    expect(tomorrow[0]).toBe('06:00');
    expect(tomorrow[1]).toBe('06:30');
    expect(tomorrow.at(-1)).toBe('21:30');
  });
});
