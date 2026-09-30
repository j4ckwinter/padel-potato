import { Image } from 'react-native';

import { decorativeImageProps } from './decorativeArtwork';

export function NoGamesEmptyStateArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-no-games.webp')}
      style={{ height: 96, width: 96 }}
      testID="artwork-empty-state-no-games"
    />
  );
}

export function NoNotificationsEmptyStateArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-wave.webp')}
      style={{ height: 96, width: 96 }}
      testID="artwork-empty-state-no-notifications"
    />
  );
}

export function NoPlayersEmptyStateArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-search.webp')}
      style={{ height: 96, width: 96 }}
      testID="artwork-empty-state-no-players"
    />
  );
}

export function NextGameIllustratedCardArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-wave.webp')}
      style={{ height: 80, width: 80 }}
      testID="artwork-illustrated-card-next-game"
    />
  );
}

export function MatchWonIllustratedCardArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-match-result.webp')}
      style={{ height: 80, width: 80 }}
      testID="artwork-illustrated-card-match-won"
    />
  );
}

export function MatchLostIllustratedCardArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-no-games.webp')}
      style={{ height: 80, width: 80 }}
      testID="artwork-illustrated-card-match-lost"
    />
  );
}

export function InvitePlayersIllustratedCardArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-profile.webp')}
      style={{ height: 80, width: 80 }}
      testID="artwork-illustrated-card-invite-players"
    />
  );
}

export function GameCreatedIllustratedCardArtwork() {
  return (
    <Image
      {...decorativeImageProps}
      resizeMode="contain"
      source={require('../media/mascot-game-created.webp')}
      style={{ height: 80, width: 80 }}
      testID="artwork-illustrated-card-game-created"
    />
  );
}
