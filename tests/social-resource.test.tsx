import { describe, it, expect, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  useSocialResource,
  useSocialMutationState,
} from '../src/features/players/useSocialRefresh';
jest.mock('expo-router', () => ({ useFocusEffect: () => {} }));
describe('social request ownership', () => {
  it('hides the old account immediately and ignores its delayed response', async () => {
    let resolveOld!: (value: string[]) => void;
    let resolveNew!: (value: string[]) => void;
    const oldLoad = () =>
      new Promise<string[]>((resolve) => {
        resolveOld = resolve;
      });
    const newLoad = () =>
      new Promise<string[]>((resolve) => {
        resolveNew = resolve;
      });
    const hook = await renderHook(
      ({ load }: { load: () => Promise<string[]> }) =>
        useSocialResource(load, 0),
      {
        initialProps: { load: oldLoad },
      },
    );
    await hook.rerender({ load: newLoad });
    expect(hook.result.current).toEqual({ status: 'loading' });
    await act(async () => {
      resolveOld(['Old account friend']);
    });
    expect(hook.result.current).toEqual({ status: 'loading' });
    await act(async () => {
      resolveNew(['New account friend']);
    });
    await waitFor(() =>
      expect(hook.result.current).toEqual({
        status: 'ready',
        value: ['New account friend'],
      }),
    );
  });
  it('hides loaded data until the requested refresh completes', async () => {
    const load = jest.fn(async () => ['Sam']);
    const hook = await renderHook(
      ({ version }: { version: number }) => useSocialResource(load, version),
      {
        initialProps: { version: 0 },
      },
    );
    await waitFor(() =>
      expect(hook.result.current).toEqual({ status: 'ready', value: ['Sam'] }),
    );
    await hook.rerender({ version: 1 });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(hook.result.current).toEqual({ status: 'ready', value: ['Sam'] });
  });
  it('keeps stale mutation feedback and busy state out of the new account', async () => {
    const oldOwner = {};
    const newOwner = {};
    const hook = await renderHook(
      ({ owner }: { owner: object }) =>
        useSocialMutationState<string | null>(owner, 'game', null),
      { initialProps: { owner: oldOwner } },
    );
    const oldSetter = hook.result.current[1];
    await act(async () => oldSetter('Sending...'));
    expect(hook.result.current[0]).toBe('Sending...');
    await hook.rerender({ owner: newOwner });
    expect(hook.result.current[0]).toBeNull();
    await act(async () => oldSetter('Invitation sent.'));
    expect(hook.result.current[0]).toBeNull();
  });
});
