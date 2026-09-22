// Story-only data for appHeader.
export const appHeaderFixtures = [
  {
    label: 'Settings',
    configuration: {
      page: 'settings',
    },
    copy: ['Settings', 'Manage your account'],
  },
  {
    label: 'Player details',
    configuration: {
      page: 'playerDetails',
    },
    copy: ['Player profile', 'Player details and form'],
  },
  {
    label: 'Game details',
    configuration: {
      page: 'gameDetails',
    },
    copy: ['Game details', 'Open game · 1 spot left'],
  },
  {
    label: 'Notifications',
    configuration: {
      page: 'notifications',
    },
    copy: ['Notifications', 'Updates and activity'],
  },
  {
    label: 'Profile',
    configuration: {
      page: 'profile',
    },
    copy: ['Profile', 'Manage your account'],
  },
  {
    label: 'Players',
    configuration: {
      page: 'players',
    },
    copy: ['Players', 'Find your next partner'],
  },
  {
    label: 'Create',
    configuration: {
      page: 'create',
    },
    copy: ['Create game', 'Set up your next match'],
  },
  {
    label: 'Games',
    configuration: {
      page: 'games',
    },
    copy: ['Games', 'Find your next match'],
  },
  {
    label: 'Home',
    configuration: {
      page: 'home',
    },
    copy: ['Hi, Alex', 'Ready for your next match?'],
  },
] as const;
