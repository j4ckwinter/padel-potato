import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { createDemoSession } from '../src/features/authentication/session';
import { deviceSessionStorage } from '../src/features/authentication/sessionStorage';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

const mockDeleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);
const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockSetItemAsync = jest.mocked(SecureStore.setItemAsync);

describe('device session storage', () => {
  beforeEach(() => {
    expect(Platform.OS).not.toBe('web');
    mockDeleteItemAsync.mockClear();
    mockGetItemAsync.mockReset();
    mockSetItemAsync.mockClear();
  });

  it('restores a valid session from secure storage', async () => {
    const session = createDemoSession(new Date('2026-09-30T12:00:00.000Z'));
    mockGetItemAsync.mockResolvedValue(JSON.stringify(session));

    await expect(deviceSessionStorage.read()).resolves.toEqual(session);
    expect(mockGetItemAsync).toHaveBeenCalledWith('padel-potato.session');
    expect(mockDeleteItemAsync).not.toHaveBeenCalled();
  });

  it('removes invalid stored data', async () => {
    mockGetItemAsync.mockResolvedValue('{invalid json');

    await expect(deviceSessionStorage.read()).resolves.toBeNull();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('padel-potato.session');
  });

  it('writes and clears the session', async () => {
    const session = createDemoSession(new Date('2026-09-30T12:00:00.000Z'));

    await deviceSessionStorage.write(session);
    await deviceSessionStorage.clear();

    expect(mockSetItemAsync).toHaveBeenCalledWith(
      'padel-potato.session',
      JSON.stringify(session),
    );
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('padel-potato.session');
  });
});
