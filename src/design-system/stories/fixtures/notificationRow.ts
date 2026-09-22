// Story-only data for notificationRow.
export const notificationRowFixtures = [
  {
    label: 'Social / Read',
    configuration: {
      type: 'social',
      state: 'read',
    },
    copy: ['Social update', 'Your activity has a new update', '2m'],
  },
  {
    label: 'Game / Read',
    configuration: {
      type: 'game',
      state: 'read',
    },
    copy: ['Game update', 'Your activity has a new update', '2m'],
  },
  {
    label: 'Warning / Unread',
    configuration: {
      type: 'warning',
      state: 'unread',
    },
    copy: ['Game needs attention', 'Your activity has a new update', '2m'],
  },
  {
    label: 'Social / Unread',
    configuration: {
      type: 'social',
      state: 'unread',
    },
    copy: ['Social update', 'Your activity has a new update', '2m'],
  },
  {
    label: 'Booking / Unread',
    configuration: {
      type: 'booking',
      state: 'unread',
    },
    copy: ['Booking update', 'Your activity has a new update', '2m'],
  },
  {
    label: 'Game / Unread',
    configuration: {
      type: 'game',
      state: 'unread',
    },
    copy: ['Game update', 'Your activity has a new update', '2m'],
  },
] as const;
