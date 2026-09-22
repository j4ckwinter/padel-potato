// Story-only data for segmentedControl.
export const segmentedControlFixtures = [
  {
    "label": "3 / Disabled",
    "configuration": {
      "options": 3,
      "state": "disabled"
    },
    "copy": [
      "Upcoming",
      "Open",
      "Past"
    ]
  },
  {
    "label": "4 / Focused",
    "configuration": {
      "options": 4,
      "state": "focused"
    },
    "copy": [
      "Upcoming",
      "Open",
      "Past",
      "All"
    ]
  },
  {
    "label": "3 / Selected",
    "configuration": {
      "options": 3,
      "state": "selected"
    },
    "copy": [
      "Upcoming",
      "Open",
      "Past"
    ]
  },
  {
    "label": "2 / Default",
    "configuration": {
      "options": 2,
      "state": "default"
    },
    "copy": [
      "Upcoming",
      "Open"
    ]
  }
] as const;
