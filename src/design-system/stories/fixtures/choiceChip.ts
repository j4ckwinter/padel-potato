// Story-only data for choiceChip.
export const choiceChipFixtures = [
  {
    label: 'Filter / Disabled / Trailing',
    configuration: {
      type: 'filter',
      state: 'disabled',
      icon: 'trailing',
    },
    copy: ['Intermediate'],
  },
  {
    label: 'Filter / Focused / Trailing',
    configuration: {
      type: 'filter',
      state: 'focused',
      icon: 'trailing',
    },
    copy: ['Intermediate'],
  },
  {
    label: 'Filter / Selected / Leading',
    configuration: {
      type: 'filter',
      state: 'selected',
      icon: 'leading',
    },
    copy: ['Intermediate'],
  },
  {
    label: 'Filter / Default / Trailing',
    configuration: {
      type: 'filter',
      state: 'default',
      icon: 'trailing',
    },
    copy: ['Intermediate'],
  },
  {
    label: 'Option / Disabled / None',
    configuration: {
      type: 'option',
      state: 'disabled',
      icon: 'none',
    },
    copy: ['Social'],
  },
  {
    label: 'Option / Focused / None',
    configuration: {
      type: 'option',
      state: 'focused',
      icon: 'none',
    },
    copy: ['Social'],
  },
  {
    label: 'Option / Selected / Leading',
    configuration: {
      type: 'option',
      state: 'selected',
      icon: 'leading',
    },
    copy: ['Social'],
  },
  {
    label: 'Option / Default / None',
    configuration: {
      type: 'option',
      state: 'default',
      icon: 'none',
    },
    copy: ['Social'],
  },
] as const;
