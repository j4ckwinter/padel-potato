import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { parseSession, type Session } from './session';

const sessionStorageKey = 'padel-potato.session';

export type SessionStorage = Readonly<{
  clear: () => Promise<void>;
  read: () => Promise<Session | null>;
  write: (session: Session) => Promise<void>;
}>;

function webStorage() {
  if (typeof localStorage === 'undefined') {
    throw new Error('Local storage is unavailable.');
  }
  return localStorage;
}

async function readStoredValue() {
  return Platform.OS === 'web'
    ? webStorage().getItem(sessionStorageKey)
    : SecureStore.getItemAsync(sessionStorageKey);
}

async function writeStoredValue(value: string) {
  if (Platform.OS === 'web') {
    webStorage().setItem(sessionStorageKey, value);
    return;
  }
  await SecureStore.setItemAsync(sessionStorageKey, value);
}

async function clearStoredValue() {
  if (Platform.OS === 'web') {
    webStorage().removeItem(sessionStorageKey);
    return;
  }
  await SecureStore.deleteItemAsync(sessionStorageKey);
}

export const deviceSessionStorage: SessionStorage = {
  clear: clearStoredValue,
  read: async () => {
    const storedValue = await readStoredValue();
    if (storedValue === null) return null;

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(storedValue);
    } catch {
      await clearStoredValue();
      return null;
    }

    const session = parseSession(parsedValue);
    if (session === null) await clearStoredValue();
    return session;
  },
  write: async (session) => writeStoredValue(JSON.stringify(session)),
};
