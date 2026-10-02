import type { PlayerDirectoryEntry, PlayerProfile } from './player';

export type PlayerRepository = Readonly<{
  findById: (playerId: string) => Promise<PlayerDirectoryEntry | null>;
  findProfileById: (playerId: string) => Promise<PlayerProfile | null>;
  setFavourite: (playerId: string, favourite: boolean) => Promise<void>;
  list: () => Promise<readonly PlayerDirectoryEntry[]>;
}>;
