// Story-only data for gameCard.
export const gameCardFixtures = [
  {
    label: 'Open / Full',
    configuration: {
      type: 'open',
      state: 'full',
    },
    copy: [
      'Open game',
      'Tuesday Social Padel',
      'Padel United · Court 3',
      '18:30 · 90 min',
      'View',
      'AM',
      'JT',
      'SK',
      'RB',
    ],
  },
  {
    label: 'Completed / Default',
    configuration: {
      type: 'completed',
      state: 'default',
    },
    copy: [
      'Completed',
      'Tuesday Social Padel',
      'Padel United · Court 3',
      '18:30 · 90 min',
      'Results',
      'AM',
      'JT',
      'SK',
      'RB',
    ],
  },
  {
    label: 'Compact / Default',
    configuration: {
      type: 'compact',
      state: 'default',
    },
    copy: ['Open game', 'Tuesday Social Padel', 'Padel United · Court 3'],
  },
  {
    label: 'Open / Default',
    configuration: {
      type: 'open',
      state: 'default',
    },
    copy: [
      'Open game',
      'Tuesday Social Padel',
      'Padel United · Court 3',
      '18:30 · 90 min',
      'View',
      'AM',
      'JT',
      'SK',
    ],
  },
  {
    label: 'Next / Default',
    configuration: {
      type: 'next',
      state: 'default',
    },
    copy: [
      'Your next game',
      'Tuesday Social Padel',
      'Padel United · Court 3',
      '18:30 · 90 min',
      'View',
      'AM',
      'JT',
      'SK',
      'RB',
    ],
  },
] as const;
