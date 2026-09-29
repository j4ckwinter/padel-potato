export type ScheduleDay = Readonly<{
  date: string;
  dayLabel: string;
  dateLabel: string;
}>;

const scheduleTimeIntervalMinutes = 30;
const firstSlotMinutes = 6 * 60;
const finalSlotMinutes = 21 * 60 + 30;

const dayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
});

function dateKey(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function timeLabel(totalMinutes: number) {
  const minutesInDay = 24 * 60;
  const normalizedMinutes = totalMinutes % minutesInDay;
  const hour = String(Math.floor(normalizedMinutes / 60)).padStart(2, '0');
  const minute = String(normalizedMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function upcomingScheduleTimes(
  selectedDate: string | null = null,
  now = new Date(),
): readonly string[] {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const firstSlot =
    selectedDate === null || selectedDate === dateKey(now)
      ? Math.max(
          firstSlotMinutes,
          Math.ceil(currentMinutes / scheduleTimeIntervalMinutes) *
            scheduleTimeIntervalMinutes,
        )
      : firstSlotMinutes;
  const slotCount = Math.max(
    0,
    Math.floor(
      (finalSlotMinutes - firstSlot) / scheduleTimeIntervalMinutes + 1,
    ),
  );

  return Array.from({ length: slotCount }, (_, offset) =>
    timeLabel(firstSlot + offset * scheduleTimeIntervalMinutes),
  );
}

export function upcomingScheduleDays(
  today = new Date(),
): readonly ScheduleDay[] {
  const firstDayOffset =
    upcomingScheduleTimes(dateKey(today), today).length === 0 ? 1 : 0;

  return Array.from({ length: 7 }, (_, offset) => {
    const dayOffset = firstDayOffset + offset;
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + dayOffset,
    );
    return {
      date: dateKey(date),
      dateLabel: dateFormatter.format(date),
      dayLabel: dayOffset === 0 ? 'Today' : dayFormatter.format(date),
    };
  });
}
