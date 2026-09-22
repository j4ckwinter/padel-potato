// Story-only data for socialSignInButton.
export const socialSignInButtonFixtures = [
  {
    label: 'Apple / Disabled',
    configuration: {
      provider: 'apple',
      state: 'disabled',
    },
    copy: ['Continue with Apple'],
  },
  {
    label: 'Apple / Focused',
    configuration: {
      provider: 'apple',
      state: 'focused',
    },
    copy: ['Continue with Apple'],
  },
  {
    label: 'Apple / Pressed',
    configuration: {
      provider: 'apple',
      state: 'pressed',
    },
    copy: ['Continue with Apple'],
  },
  {
    label: 'Apple / Default',
    configuration: {
      provider: 'apple',
      state: 'default',
    },
    copy: ['Continue with Apple'],
  },
  {
    label: 'Google / Disabled',
    configuration: {
      provider: 'google',
      state: 'disabled',
    },
    copy: ['Continue with Google'],
  },
  {
    label: 'Google / Focused',
    configuration: {
      provider: 'google',
      state: 'focused',
    },
    copy: ['Continue with Google'],
  },
  {
    label: 'Google / Pressed',
    configuration: {
      provider: 'google',
      state: 'pressed',
    },
    copy: ['Continue with Google'],
  },
  {
    label: 'Google / Default',
    configuration: {
      provider: 'google',
      state: 'default',
    },
    copy: ['Continue with Google'],
  },
] as const;
