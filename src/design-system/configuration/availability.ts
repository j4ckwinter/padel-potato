export const availabilityDayOptions = Object.freeze([
  { value: 'weekdays', label: 'Weekdays', hint: 'Mon–Fri' },
  { value: 'saturday', label: 'Saturday', hint: 'Weekend' },
  { value: 'sunday', label: 'Sunday', hint: 'Weekend' },
] as const);

export const availabilityTimeOptions = Object.freeze([
  { value: 'morning', label: 'Morning', hint: 'Before 12' },
  { value: 'afternoon', label: 'Afternoon', hint: '12–5' },
  { value: 'evening', label: 'Evening', hint: 'After 5' },
] as const);

export const availabilityFrequencyOptions = Object.freeze([
  { value: 'one-or-two', label: '1–2 games' },
  { value: 'three-or-more', label: '3+ games' },
] as const);

export type AvailabilityDraft = Readonly<{
  days: readonly (typeof availabilityDayOptions)[number]['value'][];
  times: readonly (typeof availabilityTimeOptions)[number]['value'][];
  frequency: (typeof availabilityFrequencyOptions)[number]['value'] | null;
}>;

export function isAvailabilityDraft(
  value: unknown,
): value is AvailabilityDraft {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    Object.keys(draft).length === 3 &&
    Array.isArray(draft.days) &&
    new Set(draft.days).size === draft.days.length &&
    draft.days.every((value: unknown) =>
      availabilityDayOptions.some((option) => option.value === value),
    ) &&
    Array.isArray(draft.times) &&
    new Set(draft.times).size === draft.times.length &&
    draft.times.every((value: unknown) =>
      availabilityTimeOptions.some((option) => option.value === value),
    ) &&
    (draft.frequency === null ||
      availabilityFrequencyOptions.some(
        (option) => option.value === draft.frequency,
      ))
  );
}
