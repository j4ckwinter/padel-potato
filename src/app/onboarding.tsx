import type { OnboardingDraft } from '../design-system/configuration/onboarding';
import { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { Stack, useRouter } from 'expo-router';

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
import {
  useAppServices,
  useAppServicesLoadState,
} from '../features/services/AppServicesContext';

import { AvailabilityStepScreen } from '../features/onboarding/AvailabilityStepScreen';
import {
  loadAvailabilityDraft,
  saveAvailabilityDraft,
} from '../features/onboarding/availabilityDraft';

function OnboardingFlow({
  userId,
  initialName,
  savedDraft,
  onComplete,
}: Readonly<{
  userId: string;
  initialName: string;
  savedDraft: OnboardingDraft | null;
  onComplete: (draft: OnboardingDraft) => Promise<void>;
}>) {
  const [step, setStep] = useState<'profile' | 'play' | 'availability'>(
    'profile',
  );
  const [profile, setProfile] = useState(
    () =>
      savedDraft?.profile ??
      loadProfileDraft(userId) ?? {
        displayName: initialName,
        homeLocation: '',
        photoUri: null,
      },
  );
  const [play, setPlay] = useState(
    () =>
      savedDraft?.play ??
      loadPlayDraft(userId) ?? {
        level: null,
        side: null,
        vibe: null,
      },
  );
  const router = useRouter();
  const [availability, setAvailability] = useState(
    () =>
      savedDraft?.availability ??
      loadAvailabilityDraft(userId) ?? { days: [], times: [], frequency: null },
  );
  const saving = useRef(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (saving.current) return true;
        if (step === 'availability') {
          setStep('play');
          return true;
        }
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

  if (step === 'availability') {
    return (
      <AvailabilityStepScreen
        initialDraft={availability}
        onDraftChange={setAvailability}
        onBack={() => {
          if (!saving.current) setStep('play');
        }}
        onFinish={async (draft) => {
          if (saving.current) return;
          saving.current = true;
          try {
            await saveAvailabilityDraft(userId, draft);
            if (play.level === null || play.side === null || play.vibe === null)
              throw new Error('Complete your play preferences.');
            await onComplete({
              profile,
              play: { level: play.level, side: play.side, vibe: play.vibe },
              availability: draft,
            });
            setAvailability(draft);
            router.replace('/(tabs)/profile');
          } finally {
            saving.current = false;
          }
        }}
      />
    );
  }

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
            setStep('availability');
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
  const { currentUser, onboarding } = useAppServices();
  const { completeOnboarding } = useAppServicesLoadState();
  if (state.status !== 'signedIn') return null;
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <OnboardingFlow
        key={state.session.userId}
        userId={state.session.userId}
        initialName={currentUser.identity.name}
        savedDraft={onboarding.draft}
        onComplete={completeOnboarding}
      />
    </>
  );
}
