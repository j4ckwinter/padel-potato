// Story-only data for playerItem.
export const playerItemFixtures = [
  {
    "label": "Invite result / Disabled",
    "configuration": {
      "type": "inviteResult",
      "state": "disabled"
    },
    "copy": [
      "AM",
      "Alex Morgan",
      "Intermediate · Rating 4.6"
    ]
  },
  {
    "label": "Invite result / Default",
    "configuration": {
      "type": "inviteResult",
      "state": "default"
    },
    "copy": [
      "AM",
      "Alex Morgan",
      "Intermediate · Rating 4.6"
    ]
  },
  {
    "label": "Game slot / Empty",
    "configuration": {
      "type": "gameSlot",
      "state": "empty"
    },
    "copy": [
      "+",
      "Open player slot",
      "Invite someone to join"
    ]
  },
  {
    "label": "Game slot / Default",
    "configuration": {
      "type": "gameSlot",
      "state": "default"
    },
    "copy": [
      "AM",
      "Alex Morgan",
      "Confirmed · Intermediate"
    ]
  },
  {
    "label": "List / Selected",
    "configuration": {
      "type": "list",
      "state": "selected"
    },
    "copy": [
      "AM",
      "Alex Morgan",
      "Intermediate · Rating 4.6"
    ]
  },
  {
    "label": "List / Default",
    "configuration": {
      "type": "list",
      "state": "default"
    },
    "copy": [
      "AM",
      "Alex Morgan",
      "Intermediate · Rating 4.6"
    ]
  }
] as const;
