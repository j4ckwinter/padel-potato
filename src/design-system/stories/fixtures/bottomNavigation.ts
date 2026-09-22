// Story-only data for bottomNavigation.
export const bottomNavigationFixtures = [
  {
    label: 'Create',
    configuration: {
      active: 'create',
    },
    copy: ['Home', 'Games', 'Create', 'Players', 'Profile'],
  },
  {
    label: 'Profile',
    configuration: {
      active: 'profile',
    },
    copy: ['Home', 'Games', 'Create', 'Players', 'Profile'],
  },
  {
    label: 'Players',
    configuration: {
      active: 'players',
    },
    copy: ['Home', 'Games', 'Create', 'Players', 'Profile'],
  },
  {
    label: 'Games',
    configuration: {
      active: 'games',
    },
    copy: ['Home', 'Games', 'Create', 'Players', 'Profile'],
  },
  {
    label: 'Home',
    configuration: {
      active: 'home',
    },
    copy: ['Home', 'Games', 'Create', 'Players', 'Profile'],
  },
] as const;
