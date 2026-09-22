// Story-only data for emptyState.
export const emptyStateFixtures = [
  {
    label: 'No players / With action',
    configuration: {
      content: 'noPlayers',
      state: 'withAction',
    },
    copy: ['No players', 'There’s nothing here yet.', 'Get started'],
  },
  {
    label: 'No notifications / No action',
    configuration: {
      content: 'noNotifications',
      state: 'noAction',
    },
    copy: ['No notifications', 'There’s nothing here yet.'],
  },
  {
    label: 'No games / With action',
    configuration: {
      content: 'noGames',
      state: 'withAction',
    },
    copy: ['No games', 'There’s nothing here yet.', 'Get started'],
  },
] as const;
