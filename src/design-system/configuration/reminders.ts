export const gameReminderMinutesBefore = 60;
export const maximumScheduledGameReminders = 50;

export type ReminderPreference = Readonly<{
  enabled: boolean;
  version: 1;
}>;

export function isReminderPreference(
  value: unknown,
): value is ReminderPreference {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.version === 1 && typeof record.enabled === 'boolean';
}
