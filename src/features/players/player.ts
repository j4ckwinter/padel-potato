import type { PlayerItemIdentity } from '../../design-system/components/content';
import type { GamePlayer } from '../games/game';

export type PlayerProfile = Readonly<{
  bio: string;
  id: string;
  identity: PlayerItemIdentity;
  level: string;
  preferences: Readonly<{
    days: string;
    side: string;
    timeOfDay: string;
  }>;
  stats: Readonly<{
    gamesPlayed: string;
    rating: string;
    winRate: string;
  }>;
}>;

export type PlayerDirectoryEntry = PlayerProfile &
  Readonly<{
    favourite: boolean;
    recentlyPlayedWith: boolean;
  }>;

function initialsFromName(name: string) {
  return name
    .split(/\s+/u)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('');
}

export function gamePlayerFromProfile(profile: PlayerProfile): GamePlayer {
  return {
    id: profile.id,
    initials:
      'initials' in profile.identity && profile.identity.initials !== undefined
        ? profile.identity.initials
        : initialsFromName(profile.identity.name),
    name: profile.identity.name,
    rating: profile.stats.rating,
  };
}
