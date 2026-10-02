import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  loadPlayDraft,
  savePlayDraft,
} from '../src/features/onboarding/playDraft';
import type { PlayStepDraft } from '../src/features/onboarding/PlayStepScreen';
const values = new Map<string, string>();
const draft: PlayStepDraft = {
  level: 'improver',
  side: 'either',
  vibe: 'social',
};
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
describe('play preference storage', () => {
  it('round trips complete and partial per-user preferences without touching profile v1', async () => {
    values.set('padel-potato.profile-draft.v1.jack', 'existing profile');
    await savePlayDraft('jack', draft);
    expect(loadPlayDraft('jack')).toEqual({
      level: 'improver',
      side: 'either',
      vibe: 'social',
    });
    expect(loadPlayDraft('other')).toBeNull();
    expect(values.get('padel-potato.profile-draft.v1.jack')).toBe(
      'existing profile',
    );
    await savePlayDraft('jack', { level: null, side: 'left', vibe: null });
    expect(loadPlayDraft('jack')).toEqual({
      level: null,
      side: 'left',
      vibe: null,
    });
  });
  it.each([
    { ...draft, level: 'expert' },
    { ...draft, side: 'middle' },
    { ...draft, vibe: 'casual' },
    { ...draft, extra: true },
    { side: 'left', vibe: null },
  ])('rejects invalid preference shape %p', async (invalid) => {
    await expect(
      savePlayDraft('jack', invalid as unknown as PlayStepDraft),
    ).rejects.toThrow('invalid');
    values.set(
      'padel-potato.play-draft.v1.jack',
      JSON.stringify({ version: 1, draft: invalid }),
    );
    expect(loadPlayDraft('jack')).toBeNull();
  });
  it('ignores malformed versions and unavailable storage', () => {
    values.set('padel-potato.play-draft.v1.jack', '{');
    expect(loadPlayDraft('jack')).toBeNull();
    values.set(
      'padel-potato.play-draft.v1.jack',
      JSON.stringify({ version: 2, draft }),
    );
    expect(loadPlayDraft('jack')).toBeNull();
    localStorage.getItem = () => {
      throw new Error('unavailable');
    };
    expect(loadPlayDraft('jack')).toBeNull();
  });
  it('rejects an empty user and propagates write failure for retry', async () => {
    await expect(savePlayDraft('', draft)).rejects.toThrow('user');
    localStorage.setItem = () => {
      throw new Error('disk full');
    };
    await expect(savePlayDraft('jack', draft)).rejects.toThrow('disk full');
  });
});
