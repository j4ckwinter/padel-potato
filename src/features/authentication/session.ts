import { demoCurrentGamePlayer } from '../demo/demoData';

export type Session = Readonly<{
  kind: 'demo';
  startedAt: string;
  userId: string;
  version: 1;
}>;

export function createDemoSession(now: Date = new Date()): Session {
  return {
    kind: 'demo',
    startedAt: now.toISOString(),
    userId: demoCurrentGamePlayer.id,
    version: 1,
  };
}

export function parseSession(value: unknown): Session | null {
  if (typeof value !== 'object' || value === null) return null;
  if (!('kind' in value) || value.kind !== 'demo') return null;
  if (!('version' in value) || value.version !== 1) return null;
  if (!('userId' in value) || value.userId !== demoCurrentGamePlayer.id) {
    return null;
  }
  if (
    !('startedAt' in value) ||
    typeof value.startedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.startedAt))
  ) {
    return null;
  }

  return {
    kind: value.kind,
    startedAt: value.startedAt,
    userId: value.userId,
    version: value.version,
  };
}
