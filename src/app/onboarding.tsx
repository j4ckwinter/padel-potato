import { useRouter } from 'expo-router';

import { useSession } from '../features/authentication/SessionContext';
import { ProfileStepScreen } from '../features/onboarding/ProfileStepScreen';
import {
  loadProfileDraft,
  pickProfilePhoto,
  saveProfileDraft,
} from '../features/onboarding/profileDraft';
import { useAppServices } from '../features/services/AppServicesContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const { state } = useSession();
  const { currentUser } = useAppServices();

  if (state.status !== 'signedIn') return null;

  const userId = state.session.userId;
  return (
    <ProfileStepScreen
      key={userId}
      initialDraft={
        loadProfileDraft(userId) ?? {
          displayName: currentUser.identity.name,
          homeLocation: '',
          photoUri: null,
        }
      }
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/profile');
      }}
      onContinue={(draft) => saveProfileDraft(userId, draft)}
      onPickPhoto={pickProfilePhoto}
    />
  );
}
