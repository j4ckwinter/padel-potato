// Story-only data for field.
export const fieldFixtures = [
  {
    label: 'Text / Read only',
    configuration: {
      type: 'text',
      state: 'readOnly',
    },
    copy: ['Generated game name', 'Wednesday Evening Padel'],
  },
  {
    label: 'Search / Default',
    configuration: {
      type: 'search',
      state: 'default',
    },
    copy: ['Label', 'Search games', 'Check this value'],
  },
  {
    label: 'Password / Error',
    configuration: {
      type: 'password',
      state: 'error',
    },
    copy: ['Password *', 'Enter your password', 'Use at least 8 characters'],
  },
  {
    label: 'Password / Filled',
    configuration: {
      type: 'password',
      state: 'filled',
    },
    copy: ['Password *', '••••••••'],
  },
  {
    label: 'Password / Focused',
    configuration: {
      type: 'password',
      state: 'focused',
    },
    copy: ['Password *', 'Enter your password'],
  },
  {
    label: 'Password / Default',
    configuration: {
      type: 'password',
      state: 'default',
    },
    copy: ['Password *', 'Enter your password'],
  },
  {
    label: 'Stepper / Success',
    configuration: {
      type: 'stepper',
      state: 'success',
    },
    copy: ['Label', '4 players', '−', '+', 'Looks good'],
  },
  {
    label: 'Search / Error',
    configuration: {
      type: 'search',
      state: 'error',
    },
    copy: ['Label', 'Search players', 'Check this value'],
  },
  {
    label: 'Time / Disabled',
    configuration: {
      type: 'time',
      state: 'disabled',
    },
    copy: ['Label', '18:30'],
  },
  {
    label: 'Date / Filled',
    configuration: {
      type: 'date',
      state: 'filled',
    },
    copy: ['Label', '12 Sep 2026'],
  },
  {
    label: 'Select / Focused',
    configuration: {
      type: 'select',
      state: 'focused',
    },
    copy: ['Label', 'Choose level'],
  },
  {
    label: 'Text / Default',
    configuration: {
      type: 'text',
      state: 'default',
    },
    copy: ['Label *', 'Enter game name'],
  },
] as const;
