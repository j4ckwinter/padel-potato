export type GameScheduleDraft =
  | Readonly<{ status: 'empty' }>
  | Readonly<{ date: string; status: 'daySelected' }>
  | Readonly<{
      date: string;
      startsAt: string;
      status: 'complete';
      time: string;
    }>;

export type GameDraft = Readonly<{
  schedule: GameScheduleDraft;
  setup: Readonly<{
    durationMinutes: 60 | 90;
    format: 'Competitive game' | 'Social game';
  }>;
  venueQuery: string;
}>;

export const initialGameDraft: GameDraft = Object.freeze({
  schedule: Object.freeze({ status: 'empty' }),
  setup: Object.freeze({
    durationMinutes: 60,
    format: 'Social game',
  }),
  venueQuery: '',
});

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/u;
const timePattern = /^(\d{2}):(\d{2})$/u;

function parseDate(value: string) {
  const match = datePattern.exec(value);
  if (!match) throw new Error(`Invalid game date: ${value}`);

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid game date: ${value}`);
  }

  return { day, month, year };
}

function parseTime(value: string) {
  const match = timePattern.exec(value);
  if (!match) throw new Error(`Invalid game time: ${value}`);

  const [, hourText, minuteText] = match;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (hour > 23 || minute > 59) {
    throw new Error(`Invalid game time: ${value}`);
  }

  return { hour, minute };
}

function startsAt(dateValue: string, timeValue: string) {
  const { day, month, year } = parseDate(dateValue);
  const { hour, minute } = parseTime(timeValue);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

function dayPeriod(hour: number) {
  if (hour < 5) return 'Night';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 22) return 'Evening';
  return 'Night';
}

export function gameDraftName(draft: GameDraft) {
  if (draft.schedule.status !== 'complete') return 'Padel game';

  const { day, month, year } = parseDate(draft.schedule.date);
  const { hour } = parseTime(draft.schedule.time);
  const weekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
  }).format(new Date(year, month - 1, day));

  return `${weekday} ${dayPeriod(hour)} Padel`;
}

export function selectGameDay(draft: GameDraft, date: string): GameDraft {
  parseDate(date);
  const schedule = draft.schedule;

  if (schedule.status === 'complete' && schedule.date === date) {
    return draft;
  }

  return { ...draft, schedule: { date, status: 'daySelected' } };
}

export function selectGameTime(draft: GameDraft, time: string): GameDraft {
  parseTime(time);
  const schedule = draft.schedule;
  if (schedule.status === 'empty') {
    throw new Error('Select a game day before selecting a time.');
  }

  return {
    ...draft,
    schedule: {
      date: schedule.date,
      startsAt: startsAt(schedule.date, time),
      status: 'complete',
      time,
    },
  };
}

export function updateGameVenue(
  draft: GameDraft,
  venueQuery: string,
): GameDraft {
  return { ...draft, venueQuery };
}

export function updateGameDuration(
  draft: GameDraft,
  durationMinutes: GameDraft['setup']['durationMinutes'],
): GameDraft {
  return { ...draft, setup: { ...draft.setup, durationMinutes } };
}

export function updateGameFormat(
  draft: GameDraft,
  format: GameDraft['setup']['format'],
): GameDraft {
  return { ...draft, setup: { ...draft.setup, format } };
}
