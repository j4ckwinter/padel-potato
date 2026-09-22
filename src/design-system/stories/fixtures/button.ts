// Story-only data for button.
export const buttonFixtures = [
  {
    label: 'Primary / 48 / Disabled',
    configuration: {
      style: 'primary',
      size: 48,
      state: 'disabled',
    },
    copy: ['Button label'],
  },
  {
    label: 'Primary / 48 / Default',
    configuration: {
      style: 'primary',
      size: 48,
      state: 'default',
    },
    copy: ['Button label'],
  },
  {
    label: 'Ghost / 48 / Default',
    configuration: {
      style: 'ghost',
      size: 48,
      state: 'default',
    },
    copy: ['Button label'],
  },
  {
    label: 'Primary / 48 / Loading',
    configuration: {
      style: 'primary',
      size: 48,
      state: 'loading',
    },
    copy: ['•••'],
  },
  {
    label: 'Primary / 48 / Focused',
    configuration: {
      style: 'primary',
      size: 48,
      state: 'focused',
    },
    copy: ['Button label'],
  },
  {
    label: 'Destructive / 48 / Default',
    configuration: {
      style: 'destructive',
      size: 48,
      state: 'default',
    },
    copy: ['Button label'],
  },
  {
    label: 'Primary / 48 / Pressed',
    configuration: {
      style: 'primary',
      size: 48,
      state: 'pressed',
    },
    copy: ['Button label'],
  },
  {
    label: 'Primary / 40 / Default',
    configuration: {
      style: 'primary',
      size: 40,
      state: 'default',
    },
    copy: ['Button label'],
  },
  {
    label: 'Secondary / 48 / Default',
    configuration: {
      style: 'secondary',
      size: 48,
      state: 'default',
    },
    copy: ['Button label'],
  },
] as const;
