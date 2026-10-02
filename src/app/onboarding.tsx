import { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { Stack } from 'expo-router';

import { useSession } from '../features/authentication/SessionContext';
import { ProfileStepScreen } from '../features/onboarding/ProfileStepScreen';
import { PlayStepScreen } from '../features/onboarding/PlayStepScreen';
import { loadPlayDraft, savePlayDraft } from '../features/onboarding/playDraft';
import {
  loadProfileDraft,
  pickProfilePhoto,
  saveProfileDraft,
  type ProfileDraft,
} from '../features/onboarding/profileDraft';
import { useAppServices } from '../features/services/AppServicesContext';

function OnboardingFlow({
  userId,
  initialName,
}: Readonly<{ userId: string; initialName: string }>) {
  const [step, setStep] = useState<'profile' | 'play'>('profile');
  const [profile, setProfile] = useState(
    () =>
      loadProfileDraft(userId) ?? {
        displayName: initialName,
        homeLocation: '',
        photoUri: null,
      },
  );
  const [play, setPlay] = useState(
    () =>
      loadPlayDraft(userId) ?? {
        level: null,
        side: null,
        vibe: null,
      },
  );
  const saving = useRef(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (saving.current) return true;
        if (step === 'play') {
          setStep('profile');
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [step]);

  const saveProfile = (draft: ProfileDraft) => {
    if (saving.current) return;
    saving.current = true;
    try {
      saveProfileDraft(userId, draft);
      setProfile(draft);
      setStep('play');
    } finally {
      saving.current = false;
    }
  };

  if (step === 'play') {
    return (
      <PlayStepScreen
        initialDraft={play}
        onDraftChange={setPlay}
        onBack={() => {
          if (!saving.current) setStep('profile');
        }}
        onContinue={async (draft) => {
          if (saving.current) return;
          saving.current = true;
          try {
            await savePlayDraft(userId, draft);
            setPlay(draft);
          } finally {
            saving.current = false;
          }
        }}
      />
    );
  }

  return (
    <ProfileStepScreen
      initialDraft={profile}
      onContinue={saveProfile}
      onPickPhoto={pickProfilePhoto}
    />
  );
}

export default function OnboardingScreen() {
  const { state } = useSession();
  const { currentUser } = useAppServices();
  if (state.status !== 'signedIn') return null;
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <OnboardingFlow
        key={state.session.userId}
        userId={state.session.userId}
        initialName={currentUser.identity.name}
      />
    </>
  );
}
