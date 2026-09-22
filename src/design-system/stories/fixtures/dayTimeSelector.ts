// Story-only data for dayTimeSelector.
export const dayTimeSelectorFixtures = [
  {
    label: 'Time / Disabled',
    configuration: {
      type: 'time',
      state: 'disabled',
    },
    copy: ['20:30', 'Full'],
  },
  {
    label: 'Time / Selected',
    configuration: {
      type: 'time',
      state: 'selected',
    },
    copy: ['19:00', 'Selected'],
  },
  {
    label: 'Time / Default',
    configuration: {
      type: 'time',
      state: 'default',
    },
    copy: ['18:30', '3 spots'],
  },
  {
    label: 'Day / Disabled',
    configuration: {
      type: 'day',
      state: 'disabled',
    },
    copy: ['Wed', '18 Sep'],
  },
  {
    label: 'Day / Selected',
    configuration: {
      type: 'day',
      state: 'selected',
    },
    copy: ['Tue', '17 Sep'],
  },
  {
    label: 'Day / Default',
    configuration: {
      type: 'day',
      state: 'default',
    },
    copy: ['Mon', '16 Sep'],
  },
] as const;
