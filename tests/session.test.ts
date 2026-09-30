import { describe, expect, it } from '@jest/globals';

import {
  createDemoSession,
  parseSession,
} from '../src/features/authentication/session';

describe('authentication session', () => {
  it('creates and parses the local demo session', () => {
    const session = createDemoSession(new Date('2026-09-30T12:00:00.000Z'));

    expect(session).toEqual({
      kind: 'demo',
      startedAt: '2026-09-30T12:00:00.000Z',
      userId: 'alex-morgan',
      version: 1,
    });
    expect(parseSession(session)).toEqual(session);
  });

  it.each([
    null,
    {},
    { kind: 'demo', startedAt: 'invalid', userId: 'alex-morgan', version: 1 },
    {
      kind: 'demo',
      startedAt: '2026-09-30T12:00:00.000Z',
      userId: '',
      version: 1,
    },
    {
      kind: 'demo',
      startedAt: '2026-09-30T12:00:00.000Z',
      userId: 'unknown-player',
      version: 1,
    },
    {
      kind: 'unknown',
      startedAt: '2026-09-30T12:00:00.000Z',
      userId: 'alex-morgan',
      version: 1,
    },
  ])('rejects invalid stored session data', (value) => {
    expect(parseSession(value)).toBeNull();
  });
});
