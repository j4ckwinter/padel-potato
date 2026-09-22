// Story-only data for bannerToast.
export const bannerToastFixtures = [
  {
    "label": "Error / Toast",
    "configuration": {
      "style": "error",
      "type": "toast"
    },
    "copy": [
      "Something went wrong",
      "Please try again in a moment."
    ]
  },
  {
    "label": "Warning / Banner",
    "configuration": {
      "style": "warning",
      "type": "banner"
    },
    "copy": [
      "Check game details",
      "One player still needs to confirm.",
      "View"
    ]
  },
  {
    "label": "Info / Banner",
    "configuration": {
      "style": "info",
      "type": "banner"
    },
    "copy": [
      "Booking update",
      "Court details have changed.",
      "View"
    ]
  },
  {
    "label": "Success / Toast",
    "configuration": {
      "style": "success",
      "type": "toast"
    },
    "copy": [
      "Game created",
      "Your game is ready to share."
    ]
  }
] as const;
