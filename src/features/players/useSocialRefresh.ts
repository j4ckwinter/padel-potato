import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useSocialRefresh() {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((value) => value + 1), []);
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);
  return { version, refresh };
}

export function useSocialResource<T>(load: () => Promise<T>, version: number) {
  const [result, setResult] = useState<
    | { load: () => Promise<T>; value: T; version: number }
    | { load: () => Promise<T>; error: true; version: number }
    | null
  >(null);
  useEffect(() => {
    let active = true;
    void load()
      .then((value) => {
        if (active) setResult({ load, value, version });
      })
      .catch(() => {
        if (active) setResult({ load, error: true, version });
      });
    return () => {
      active = false;
    };
  }, [load, version]);
  if (result?.load !== load || result.version !== version)
    return { status: 'loading' as const };
  return 'error' in result
    ? { status: 'error' as const }
    : { status: 'ready' as const, value: result.value };
}

export function useSocialMutationState<T>(
  owner: unknown,
  key: string,
  initial: T,
): readonly [T, (value: T) => void] {
  const [state, setState] = useState({ owner, key, value: initial });
  const value =
    state.owner === owner && state.key === key ? state.value : initial;
  return [value, (value) => setState({ owner, key, value })];
}
