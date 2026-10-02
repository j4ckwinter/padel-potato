import { Redirect } from 'expo-router';

import { useSession } from '../features/authentication/SessionContext';

export default function AuthCallbackScreen() {
  const { state } = useSession();
  if (state.status === 'loading') return null;
  if (state.status === 'passwordRecovery')
    return <Redirect href="/password-recovery" />;
  if (state.status === 'signedOut') return <Redirect href="/sign-in" />;
  return <Redirect href="/" />;
}
