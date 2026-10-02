import { Redirect } from 'expo-router';

import { useSession } from '../features/authentication/SessionContext';
import { useAppServicesLoadState } from '../features/services/AppServicesContext';

export default function AuthCallbackScreen() {
  const { state } = useSession();
  const services = useAppServicesLoadState();
  if (state.status === 'loading') return null;
  if (state.status === 'passwordRecovery')
    return <Redirect href="/password-recovery" />;
  if (state.status === 'signedOut') return <Redirect href="/sign-in" />;
  if (services.state.status !== 'ready') return null;
  if (!services.state.services.onboarding.completed)
    return <Redirect href="/onboarding" />;
  return <Redirect href="/" />;
}
