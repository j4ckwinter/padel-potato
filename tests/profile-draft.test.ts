import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockPick = jest.fn<() => Promise<unknown>>();
const mockCopy = jest.fn<() => Promise<void>>();
const mockCreate = jest.fn();
let mockSize = 1024;
let mockExists = true;

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockPick(...(args as [])),
}));
jest.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///documents' } },
  Directory: class {
    uri = 'file:///documents/profile-photos';
    create = mockCreate;
  },
  File: class {
    uri: string;
    constructor(parent: string | { uri: string }, filename?: string) {
      this.uri =
        typeof parent === 'string' ? parent : `${parent.uri}/${filename}`;
    }
    get size() {
      return mockSize;
    }
    get exists() {
      return mockExists;
    }
    copy = mockCopy;
  },
}));

import {
  loadProfileDraft,
  pickProfilePhoto,
  saveProfileDraft,
} from '../src/features/onboarding/profileDraft';

const values = new Map<string, string>();
const draft = { displayName: 'Jack', homeLocation: 'London', photoUri: null };

beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  mockPick.mockReset();
  mockCopy.mockReset().mockResolvedValue(undefined);
  mockCreate.mockClear();
  mockSize = 1024;
  mockExists = true;
});

describe('profile draft persistence', () => {
  it('trims valid names and locations before storage', () => {
    expect(
      saveProfileDraft('jack', {
        ...draft,
        displayName: ' Jack ',
        homeLocation: ' London ',
      }),
    ).toBeUndefined();
    expect(loadProfileDraft('jack')).toEqual({
      displayName: 'Jack',
      homeLocation: 'London',
      photoUri: null,
    });
    expect(
      JSON.parse(values.get('padel-potato.profile-draft.v1.jack')!).draft,
    ).toEqual({ displayName: 'Jack', homeLocation: 'London', photoUri: null });
  });

  it.each([
    { displayName: ' ', homeLocation: 'London', photoUri: null },
    { displayName: 'Jack', homeLocation: ' ', photoUri: null },
    { displayName: 'x'.repeat(81), homeLocation: 'London', photoUri: null },
    { displayName: 'Jack', homeLocation: 'x'.repeat(121), photoUri: null },
  ])('rejects invalid profile fields on save and load %p', async (invalid) => {
    expect(() => saveProfileDraft('jack', invalid)).toThrow('invalid');
    expect(values.size).toBe(0);
    values.set(
      'padel-potato.profile-draft.v1.jack',
      JSON.stringify({ version: 1, draft: invalid }),
    );
    expect(loadProfileDraft('jack')).toBeNull();
  });

  it('returns no draft when storage cannot be read', () => {
    globalThis.localStorage.getItem = () => {
      throw new Error('storage unavailable');
    };
    expect(loadProfileDraft('jack')).toBeNull();
  });

  it('round trips a draft and isolates users', async () => {
    expect(loadProfileDraft('jack')).toBeNull();
    await saveProfileDraft('jack', draft);
    expect(loadProfileDraft('jack')).toEqual({
      displayName: 'Jack',
      homeLocation: 'London',
      photoUri: null,
    });
    expect(loadProfileDraft('other')).toBeNull();
  });

  it.each([
    'bad json',
    '{"version":2,"draft":{}}',
    '{"version":1,"draft":{"displayName":5}}',
  ])('ignores invalid stored data %s', (stored) => {
    values.set('padel-potato.profile-draft.v1.jack', stored);
    expect(loadProfileDraft('jack')).toBeNull();
  });

  it('rejects invalid drafts and empty user ids', async () => {
    expect(() => saveProfileDraft(' ', draft)).toThrow('A user is required');
    expect(() =>
      saveProfileDraft('jack', {
        ...draft,
        photoUri: 'https://example.com/a.png',
      }),
    ).toThrow('invalid');
    expect(values.size).toBe(0);
  });
});

describe('profile photo selection', () => {
  it('returns null on cancellation without writing a file', async () => {
    mockPick.mockResolvedValue({ canceled: true, assets: null });
    expect(await pickProfilePhoto()).toBeNull();
    expect(mockCopy).not.toHaveBeenCalled();
  });

  it('copies an approved photo into durable app documents', async () => {
    mockPick.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///cache/photo.png',
          mimeType: 'image/png',
          fileSize: 1024,
        },
      ],
    });
    expect(await pickProfilePhoto()).toMatch(
      /^file:\/\/\/documents\/profile-photos\/.+\.png$/u,
    );
    expect(mockCopy).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      idempotent: true,
      intermediates: true,
    });
  });

  it.each([
    [{ uri: 'blob:photo', mimeType: 'image/png' }, 'iOS or Android'],
    [{ uri: 'file:///cache/photo.gif', mimeType: 'image/gif' }, 'JPEG or PNG'],
    [
      {
        uri: 'file:///cache/photo.jpg',
        mimeType: 'image/jpeg',
        fileSize: 6000000,
      },
      '5 MB',
    ],
  ])('rejects unsupported photo %p', async (asset, message) => {
    mockPick.mockResolvedValue({ canceled: false, assets: [asset] });
    await expect(pickProfilePhoto()).rejects.toThrow(message);
    expect(mockCopy).not.toHaveBeenCalled();
  });

  it('checks actual file size when picker metadata is absent', async () => {
    mockSize = 6000000;
    mockPick.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/photo.jpg' }],
    });
    await expect(pickProfilePhoto()).rejects.toThrow('5 MB');
  });

  it('reports a failed durable copy', async () => {
    mockPick.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/photo.jpg' }],
    });
    mockCopy.mockRejectedValue(new Error('disk full'));
    await expect(pickProfilePhoto()).rejects.toThrow('could not be saved');
  });
});
