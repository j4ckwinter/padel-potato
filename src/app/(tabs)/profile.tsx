import { availabilityFrequencyOptions } from '../../design-system/configuration/availability';
import { playVibeOptions } from '../../design-system/configuration/playPreferences';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  PlayerPreferencesCard,
  SettingsRow,
} from '../../design-system/components/content';
import { Avatar } from '../../design-system/components/identity';
import {
  AppHeader,
  SectionHeader,
} from '../../design-system/components/navigation';
import { Inline, Stack, Surface, Text } from '../../design-system/primitives';
import { colors, sizing, spacing } from '../../design-system/tokens';
import type { PlayerProfile } from '../../features/players/player';
import type { PlayerRepository } from '../../features/players/playerRepository';
import {
  useSocialRefresh,
  useSocialResource,
} from '../../features/players/useSocialRefresh';
import { PlayerStats } from '../../features/players/PlayerStats';
import { useAppServices } from '../../features/services/AppServicesContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser: accountProfile, onboarding, players } = useAppServices();
  const owner = useRef<{ players: PlayerRepository; userId: string } | null>(
    null,
  );
  const profileRequest = useRef(0);
  const [cached, setCached] = useState<{
    players: PlayerRepository;
    profile: PlayerProfile;
  } | null>(null);
  useLayoutEffect(() => {
    owner.current = { players, userId: accountProfile.id };
    return () => {
      owner.current = null;
    };
  }, [players, accountProfile.id]);
  const { version } = useSocialRefresh();
  const loadProfile = useCallback(async () => {
    const request = ++profileRequest.current;
    const profile = await players.findProfileById(accountProfile.id);
    if (
      request === profileRequest.current &&
      profile &&
      profile.id === accountProfile.id &&
      owner.current?.players === players &&
      owner.current.userId === accountProfile.id
    )
      setCached({ players, profile });
    return profile;
  }, [players, accountProfile.id]);
  const resource = useSocialResource(loadProfile, version);
  const currentUser =
    resource.status === 'ready' && resource.value?.id === accountProfile.id
      ? resource.value
      : cached?.players === players && cached.profile.id === accountProfile.id
        ? cached.profile
        : accountProfile;
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
        testID="profile-scroll"
      >
        <AppHeader page="profile" />
        <Surface padding="space20" radius="radius20">
          <Inline align="center" gap="space16">
            {'source' in currentUser.identity &&
            currentUser.identity.source !== undefined ? (
              <Avatar
                accessibilityLabel={`${currentUser.identity.name} profile photo`}
                presence={currentUser.identity.presence}
                size={48}
                source={currentUser.identity.source}
              />
            ) : (
              <Avatar
                accessibilityLabel={`${currentUser.identity.name} profile photo`}
                initials={currentUser.identity.initials}
                presence={currentUser.identity.presence}
                size={48}
              />
            )}
            <Stack gap="space4">
              <Text accessibilityRole="header" variant="title">
                {currentUser.identity.name}
              </Text>
              <Text color="textSecondary" variant="body">
                {currentUser.level} · Rating {currentUser.stats.rating}
              </Text>
              {onboarding.draft ? (
                <Text color="textSecondary" variant="body">
                  {onboarding.draft.profile.homeLocation}
                </Text>
              ) : null}
            </Stack>
          </Inline>
        </Surface>
        <PlayerStats {...currentUser.stats} />
        <PlayerPreferencesCard
          content="full"
          days={currentUser.preferences.days}
          level={currentUser.level}
          side={currentUser.preferences.side}
          timeOfDay={currentUser.preferences.timeOfDay}
        />
        {onboarding.draft ? (
          <Surface padding="space20" radius="radius20">
            <Stack gap="space8">
              <Text variant="body">
                Game vibe:{' '}
                {
                  playVibeOptions.find(
                    (option) => option.value === onboarding.draft?.play.vibe,
                  )?.label
                }
              </Text>
              <Text variant="body">
                Each week:{' '}
                {
                  availabilityFrequencyOptions.find(
                    (option) =>
                      option.value === onboarding.draft?.availability.frequency,
                  )?.label
                }
              </Text>
            </Stack>
          </Surface>
        ) : null}
        <Stack gap="space12">
          <SectionHeader title="Account" />
          <SettingsRow
            disabled={false}
            icon="profile"
            label="Set up your profile"
            onPress={() => router.push('/onboarding')}
            variant="navigation"
          />
          <SettingsRow
            disabled={false}
            icon="profile"
            label="Account settings"
            onPress={() => router.push('/settings')}
            variant="navigation"
          />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.space16,
    paddingHorizontal: spacing.space16,
    paddingTop: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
