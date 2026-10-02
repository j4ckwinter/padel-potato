import { jest } from '@jest/globals';

import type {
  AuthGateway,
  AuthMutationResult,
} from '../../src/features/authentication/authGateway';
import type { Session } from '../../src/features/authentication/session';

export const testSession: Session = {
  kind: 'supabase',
  userId: '00000000-0000-4000-8000-000000000001',
};

export function createAuthGateway(
  restoredSession: Session | null,
  signInResult: AuthMutationResult = { status: 'success' },
) {
  let listener: ((session: Session | null) => void) | undefined;
  const gateway = {
    signUp: jest.fn(async () => ({ status: 'confirmationRequired' as const })),
    requestPasswordReset: jest.fn(async () => ({ status: 'success' as const })),
    updatePassword: jest.fn(async (): Promise<AuthMutationResult> => ({
      status: 'success',
    })),
    handleEmailCallback: jest.fn(async () => ({ status: 'success' as const })),
    restoreSession: jest.fn(() => Promise.resolve(restoredSession)),
    signIn: jest.fn(async () => {
      if (signInResult.status === 'success') listener?.(testSession);
      return signInResult;
    }),
    signOut: jest.fn(async () => {
      listener?.(null);
      return { status: 'success' } as const;
    }),
    subscribe: (nextListener) => {
      listener = nextListener;
      return jest.fn();
    },
  } satisfies AuthGateway;
  return gateway;
}
