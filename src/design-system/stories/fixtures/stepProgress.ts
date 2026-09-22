// Story-only data for stepProgress.
export const stepProgressFixtures = [
  {
    "label": "Complete / Complete",
    "configuration": {
      "content": "complete",
      "state": "complete"
    },
    "copy": [
      "Setup complete"
    ]
  },
  {
    "label": "3 / Active",
    "configuration": {
      "content": 3,
      "state": "active"
    },
    "copy": [
      "Step 3 of 3"
    ]
  },
  {
    "label": "2 / Active",
    "configuration": {
      "content": 2,
      "state": "active"
    },
    "copy": [
      "Step 2 of 3"
    ]
  },
  {
    "label": "1 / Active",
    "configuration": {
      "content": 1,
      "state": "active"
    },
    "copy": [
      "Step 1 of 3"
    ]
  }
] as const;
