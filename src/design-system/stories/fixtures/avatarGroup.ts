// Story-only data for avatarGroup.
export const avatarGroupFixtures = [
  {
    "label": "2 slots / Empty",
    "configuration": {
      "content": "2Slots",
      "state": "empty"
    },
    "copy": [
      "+",
      "+"
    ]
  },
  {
    "label": "4 players / Overflow",
    "configuration": {
      "content": "4Players",
      "state": "overflow"
    },
    "copy": [
      "AM",
      "JT",
      "SK",
      "RB",
      "+2"
    ]
  },
  {
    "label": "4 players / Default",
    "configuration": {
      "content": "4Players",
      "state": "default"
    },
    "copy": [
      "AM",
      "JT",
      "SK",
      "RB"
    ]
  },
  {
    "label": "3 players / Default",
    "configuration": {
      "content": "3Players",
      "state": "default"
    },
    "copy": [
      "AM",
      "JT",
      "SK"
    ]
  },
  {
    "label": "2 players / Default",
    "configuration": {
      "content": "2Players",
      "state": "default"
    },
    "copy": [
      "AM",
      "JT"
    ]
  }
] as const;
