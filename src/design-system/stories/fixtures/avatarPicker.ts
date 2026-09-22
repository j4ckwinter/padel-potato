// Story-only data for avatarPicker.
export const avatarPickerFixtures = [
  {
    label: 'Empty / Error',
    configuration: {
      content: 'empty',
      state: 'error',
    },
    copy: ['Add a profile photo', 'Choose a JPG or PNG under 5 MB'],
  },
  {
    label: 'Photo / Selected',
    configuration: {
      content: 'photo',
      state: 'selected',
    },
    copy: ['Change profile photo'],
  },
  {
    label: 'Initials / Default',
    configuration: {
      content: 'initials',
      state: 'default',
    },
    copy: ['JW', 'Change profile photo'],
  },
  {
    label: 'Empty / Default',
    configuration: {
      content: 'empty',
      state: 'default',
    },
    copy: ['Add a profile photo'],
  },
] as const;
