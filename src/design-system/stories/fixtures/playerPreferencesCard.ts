// Story-only data for playerPreferencesCard.
export const playerPreferencesCardFixtures = [
  {
    label: 'Content=Profile',
    configuration: {
      content: 'profile',
    },
    copy: ['Playing preferences', 'Either side', 'Mon–Sat', 'Afternoons'],
  },
  {
    label: 'Content=Full',
    configuration: {
      content: 'full',
    },
    copy: [
      'Your preferences',
      'Intermediate',
      'Either side',
      'Mon–Sat',
      'Afternoons',
    ],
  },
] as const;
