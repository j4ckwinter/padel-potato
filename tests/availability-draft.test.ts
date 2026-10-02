import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  loadAvailabilityDraft,
  saveAvailabilityDraft,
} from '../src/features/onboarding/availabilityDraft';
import { onboardingDraft } from './helpers/onboarding';
const values = new Map<string, string>();
const key = 'padel-potato.availability-draft.v1.jack';
beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
});
describe('availability draft storage', () => {
  it('restores valid and unfinished drafts with user isolation', async () => {
    await saveAvailabilityDraft('jack', onboardingDraft.availability);
    expect(loadAvailabilityDraft('jack')).toEqual(onboardingDraft.availability);
    expect(loadAvailabilityDraft('other')).toBeNull();
    await saveAvailabilityDraft('jack', {
      days: [],
      times: [],
      frequency: null,
    });
    expect(loadAvailabilityDraft('jack')).toEqual({
      days: [],
      times: [],
      frequency: null,
    });
  });
  it.each([
    {
      days: ['weekdays', 'weekdays'],
      times: ['evening'],
      frequency: 'one-or-two',
    },
    {
      days: ['weekdays'],
      times: ['evening', 'evening'],
      frequency: 'one-or-two',
    },
    { days: ['monday'], times: ['evening'], frequency: 'one-or-two' },
    { days: ['weekdays'], times: ['midnight'], frequency: 'one-or-two' },
    { days: ['weekdays'], times: ['evening'], frequency: 'daily' },
    { days: [], frequency: null },
    { ...onboardingDraft.availability, extra: true },
  ])('rejects invalid stored and submitted shape %p', async (invalid) => {
    await expect(
      saveAvailabilityDraft('jack', invalid as never),
    ).rejects.toThrow('invalid');
    values.set(key, JSON.stringify({ version: 1, draft: invalid }));
    expect(loadAvailabilityDraft('jack')).toBeNull();
  });
  it('ignores malformed JSON, unsupported versions and read failures', () => {
    values.set(key, '{');
    expect(loadAvailabilityDraft('jack')).toBeNull();
    values.set(
      key,
      JSON.stringify({ version: 2, draft: onboardingDraft.availability }),
    );
    expect(loadAvailabilityDraft('jack')).toBeNull();
    localStorage.getItem = () => {
      throw new Error('unavailable');
    };
    expect(loadAvailabilityDraft('jack')).toBeNull();
  });
  it('rejects missing users and propagates storage write errors', async () => {
    await expect(
      saveAvailabilityDraft('', onboardingDraft.availability),
    ).rejects.toThrow('user');
    localStorage.setItem = () => {
      throw new Error('disk full');
    };
    await expect(
      saveAvailabilityDraft('jack', onboardingDraft.availability),
    ).rejects.toThrow('disk full');
  });
});
