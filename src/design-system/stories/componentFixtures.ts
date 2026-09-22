// Explicit Storybook fixtures for the public component configurations.
// This module is story-only and is not imported by runtime components.

export const phase3Families = [
  {
    "key": "button",
    "records": [
      {
        "id": "button-1",
        "originalTuple": {
          "Style": "Primary",
          "Size": "48",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "style": "primary",
          "size": 48,
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      },
      {
        "id": "button-2",
        "originalTuple": {
          "Style": "Primary",
          "Size": "48",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "primary",
          "size": 48,
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      },
      {
        "id": "button-3",
        "originalTuple": {
          "Style": "Ghost",
          "Size": "48",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "ghost",
          "size": 48,
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      },
      {
        "id": "button-4",
        "originalTuple": {
          "Style": "Primary",
          "Size": "48",
          "State": "Loading"
        },
        "normalizedTuple": {
          "style": "primary",
          "size": 48,
          "state": "loading"
        },
        "metrics": {
          "typography": [
            {
              "text": "•••"
            }
          ]
        }
      },
      {
        "id": "button-5",
        "originalTuple": {
          "Style": "Primary",
          "Size": "48",
          "State": "Focused"
        },
        "normalizedTuple": {
          "style": "primary",
          "size": 48,
          "state": "focused"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      },
      {
        "id": "button-6",
        "originalTuple": {
          "Style": "Destructive",
          "Size": "48",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "destructive",
          "size": 48,
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      },
      {
        "id": "button-7",
        "originalTuple": {
          "Style": "Primary",
          "Size": "48",
          "State": "Pressed"
        },
        "normalizedTuple": {
          "style": "primary",
          "size": 48,
          "state": "pressed"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      },
      {
        "id": "button-8",
        "originalTuple": {
          "Style": "Primary",
          "Size": "40",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "primary",
          "size": 40,
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      },
      {
        "id": "button-9",
        "originalTuple": {
          "Style": "Secondary",
          "Size": "48",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "secondary",
          "size": 48,
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Button label"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "iconButton",
    "records": [
      {
        "id": "iconButton-1",
        "originalTuple": {
          "Size": "40",
          "State": "Disabled",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "size": 40,
          "state": "disabled",
          "icon": "notification"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "iconButton-2",
        "originalTuple": {
          "Size": "40",
          "State": "Focused",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "size": 40,
          "state": "focused",
          "icon": "notification"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "iconButton-3",
        "originalTuple": {
          "Size": "40",
          "State": "Pressed",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "size": 40,
          "state": "pressed",
          "icon": "notification"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "iconButton-4",
        "originalTuple": {
          "Size": "44",
          "State": "Default",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "size": 44,
          "state": "default",
          "icon": "notification"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "iconButton-5",
        "originalTuple": {
          "Size": "40",
          "State": "Default",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "size": 40,
          "state": "default",
          "icon": "notification"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "iconButton-6",
        "originalTuple": {
          "Size": "44",
          "State": "Default",
          "Icon": "Value 2"
        },
        "normalizedTuple": {
          "size": 44,
          "state": "default",
          "icon": "notification"
        },
        "metrics": {
          "typography": []
        }
      }
    ]
  },
  {
    "key": "favourite",
    "records": [
      {
        "id": "favourite-1",
        "originalTuple": {
          "Property 1": "Selected"
        },
        "normalizedTuple": {
          "checked": true
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "favourite-2",
        "originalTuple": {
          "Property 1": "Default"
        },
        "normalizedTuple": {
          "checked": false
        },
        "metrics": {
          "typography": []
        }
      }
    ]
  },
  {
    "key": "field",
    "records": [
      {
        "id": "field-1",
        "originalTuple": {
          "Type": "Text",
          "State": "Read only"
        },
        "normalizedTuple": {
          "type": "text",
          "state": "readOnly"
        },
        "metrics": {
          "typography": [
            {
              "text": "Generated game name"
            },
            {
              "text": "Wednesday Evening Padel"
            }
          ]
        }
      },
      {
        "id": "field-2",
        "originalTuple": {
          "Type": "Search",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "search",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Label"
            },
            {
              "text": "Search games"
            },
            {
              "text": "Check this value"
            }
          ]
        }
      },
      {
        "id": "field-3",
        "originalTuple": {
          "Type": "Password",
          "State": "Error"
        },
        "normalizedTuple": {
          "type": "password",
          "state": "error"
        },
        "metrics": {
          "typography": [
            {
              "text": "Password *"
            },
            {
              "text": "Enter your password"
            },
            {
              "text": "Use at least 8 characters"
            }
          ]
        }
      },
      {
        "id": "field-4",
        "originalTuple": {
          "Type": "Password",
          "State": "Filled"
        },
        "normalizedTuple": {
          "type": "password",
          "state": "filled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Password *"
            },
            {
              "text": "••••••••"
            }
          ]
        }
      },
      {
        "id": "field-5",
        "originalTuple": {
          "Type": "Password",
          "State": "Focused"
        },
        "normalizedTuple": {
          "type": "password",
          "state": "focused"
        },
        "metrics": {
          "typography": [
            {
              "text": "Password *"
            },
            {
              "text": "Enter your password"
            }
          ]
        }
      },
      {
        "id": "field-6",
        "originalTuple": {
          "Type": "Password",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "password",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Password *"
            },
            {
              "text": "Enter your password"
            }
          ]
        }
      },
      {
        "id": "field-7",
        "originalTuple": {
          "Type": "Stepper",
          "State": "Success"
        },
        "normalizedTuple": {
          "type": "stepper",
          "state": "success"
        },
        "metrics": {
          "typography": [
            {
              "text": "Label"
            },
            {
              "text": "4 players"
            },
            {
              "text": "−"
            },
            {
              "text": "+"
            },
            {
              "text": "Looks good"
            }
          ]
        }
      },
      {
        "id": "field-8",
        "originalTuple": {
          "Type": "Search",
          "State": "Error"
        },
        "normalizedTuple": {
          "type": "search",
          "state": "error"
        },
        "metrics": {
          "typography": [
            {
              "text": "Label"
            },
            {
              "text": "Search players"
            },
            {
              "text": "Check this value"
            }
          ]
        }
      },
      {
        "id": "field-9",
        "originalTuple": {
          "Type": "Time",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "type": "time",
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Label"
            },
            {
              "text": "18:30"
            }
          ]
        }
      },
      {
        "id": "field-10",
        "originalTuple": {
          "Type": "Date",
          "State": "Filled"
        },
        "normalizedTuple": {
          "type": "date",
          "state": "filled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Label"
            },
            {
              "text": "12 Sep 2026"
            }
          ]
        }
      },
      {
        "id": "field-11",
        "originalTuple": {
          "Type": "Select",
          "State": "Focused"
        },
        "normalizedTuple": {
          "type": "select",
          "state": "focused"
        },
        "metrics": {
          "typography": [
            {
              "text": "Label"
            },
            {
              "text": "Choose level"
            }
          ]
        }
      },
      {
        "id": "field-12",
        "originalTuple": {
          "Type": "Text",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "text",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Label *"
            },
            {
              "text": "Enter game name"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "choiceChip",
    "records": [
      {
        "id": "choiceChip-1",
        "originalTuple": {
          "Type": "Filter",
          "State": "Disabled",
          "Icon": "Trailing"
        },
        "normalizedTuple": {
          "type": "filter",
          "state": "disabled",
          "icon": "trailing"
        },
        "metrics": {
          "typography": [
            {
              "text": "Intermediate"
            }
          ]
        }
      },
      {
        "id": "choiceChip-2",
        "originalTuple": {
          "Type": "Filter",
          "State": "Focused",
          "Icon": "Trailing"
        },
        "normalizedTuple": {
          "type": "filter",
          "state": "focused",
          "icon": "trailing"
        },
        "metrics": {
          "typography": [
            {
              "text": "Intermediate"
            }
          ]
        }
      },
      {
        "id": "choiceChip-3",
        "originalTuple": {
          "Type": "Filter",
          "State": "Selected",
          "Icon": "Leading"
        },
        "normalizedTuple": {
          "type": "filter",
          "state": "selected",
          "icon": "leading"
        },
        "metrics": {
          "typography": [
            {
              "text": "Intermediate"
            }
          ]
        }
      },
      {
        "id": "choiceChip-4",
        "originalTuple": {
          "Type": "Filter",
          "State": "Default",
          "Icon": "Trailing"
        },
        "normalizedTuple": {
          "type": "filter",
          "state": "default",
          "icon": "trailing"
        },
        "metrics": {
          "typography": [
            {
              "text": "Intermediate"
            }
          ]
        }
      },
      {
        "id": "choiceChip-5",
        "originalTuple": {
          "Type": "Option",
          "State": "Disabled",
          "Icon": "None"
        },
        "normalizedTuple": {
          "type": "option",
          "state": "disabled",
          "icon": "none"
        },
        "metrics": {
          "typography": [
            {
              "text": "Social"
            }
          ]
        }
      },
      {
        "id": "choiceChip-6",
        "originalTuple": {
          "Type": "Option",
          "State": "Focused",
          "Icon": "None"
        },
        "normalizedTuple": {
          "type": "option",
          "state": "focused",
          "icon": "none"
        },
        "metrics": {
          "typography": [
            {
              "text": "Social"
            }
          ]
        }
      },
      {
        "id": "choiceChip-7",
        "originalTuple": {
          "Type": "Option",
          "State": "Selected",
          "Icon": "Leading"
        },
        "normalizedTuple": {
          "type": "option",
          "state": "selected",
          "icon": "leading"
        },
        "metrics": {
          "typography": [
            {
              "text": "Social"
            }
          ]
        }
      },
      {
        "id": "choiceChip-8",
        "originalTuple": {
          "Type": "Option",
          "State": "Default",
          "Icon": "None"
        },
        "normalizedTuple": {
          "type": "option",
          "state": "default",
          "icon": "none"
        },
        "metrics": {
          "typography": [
            {
              "text": "Social"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "checkbox",
    "records": [
      {
        "id": "checkbox-1",
        "originalTuple": {
          "State": "Disabled"
        },
        "normalizedTuple": {
          "state": "disabled"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "checkbox-2",
        "originalTuple": {
          "State": "Focused"
        },
        "normalizedTuple": {
          "state": "focused"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "checkbox-3",
        "originalTuple": {
          "State": "Checked"
        },
        "normalizedTuple": {
          "state": "checked"
        },
        "metrics": {
          "typography": []
        }
      },
      {
        "id": "checkbox-4",
        "originalTuple": {
          "State": "Unchecked"
        },
        "normalizedTuple": {
          "state": "unchecked"
        },
        "metrics": {
          "typography": []
        }
      }
    ]
  },
  {
    "key": "dayTimeSelector",
    "records": [
      {
        "id": "dayTimeSelector-1",
        "originalTuple": {
          "Type": "Time",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "type": "time",
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "20:30"
            },
            {
              "text": "Full"
            }
          ]
        }
      },
      {
        "id": "dayTimeSelector-2",
        "originalTuple": {
          "Type": "Time",
          "State": "Selected"
        },
        "normalizedTuple": {
          "type": "time",
          "state": "selected"
        },
        "metrics": {
          "typography": [
            {
              "text": "19:00"
            },
            {
              "text": "Selected"
            }
          ]
        }
      },
      {
        "id": "dayTimeSelector-3",
        "originalTuple": {
          "Type": "Time",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "time",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "18:30"
            },
            {
              "text": "3 spots"
            }
          ]
        }
      },
      {
        "id": "dayTimeSelector-4",
        "originalTuple": {
          "Type": "Day",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "type": "day",
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Wed"
            },
            {
              "text": "18 Sep"
            }
          ]
        }
      },
      {
        "id": "dayTimeSelector-5",
        "originalTuple": {
          "Type": "Day",
          "State": "Selected"
        },
        "normalizedTuple": {
          "type": "day",
          "state": "selected"
        },
        "metrics": {
          "typography": [
            {
              "text": "Tue"
            },
            {
              "text": "17 Sep"
            }
          ]
        }
      },
      {
        "id": "dayTimeSelector-6",
        "originalTuple": {
          "Type": "Day",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "day",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Mon"
            },
            {
              "text": "16 Sep"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "socialSignInButton",
    "records": [
      {
        "id": "socialSignInButton-1",
        "originalTuple": {
          "Provider": "Apple",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "provider": "apple",
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Apple"
            }
          ]
        }
      },
      {
        "id": "socialSignInButton-2",
        "originalTuple": {
          "Provider": "Apple",
          "State": "Focused"
        },
        "normalizedTuple": {
          "provider": "apple",
          "state": "focused"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Apple"
            }
          ]
        }
      },
      {
        "id": "socialSignInButton-3",
        "originalTuple": {
          "Provider": "Apple",
          "State": "Pressed"
        },
        "normalizedTuple": {
          "provider": "apple",
          "state": "pressed"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Apple"
            }
          ]
        }
      },
      {
        "id": "socialSignInButton-4",
        "originalTuple": {
          "Provider": "Apple",
          "State": "Default"
        },
        "normalizedTuple": {
          "provider": "apple",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Apple"
            }
          ]
        }
      },
      {
        "id": "socialSignInButton-5",
        "originalTuple": {
          "Provider": "Google",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "provider": "google",
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Google"
            }
          ]
        }
      },
      {
        "id": "socialSignInButton-6",
        "originalTuple": {
          "Provider": "Google",
          "State": "Focused"
        },
        "normalizedTuple": {
          "provider": "google",
          "state": "focused"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Google"
            }
          ]
        }
      },
      {
        "id": "socialSignInButton-7",
        "originalTuple": {
          "Provider": "Google",
          "State": "Pressed"
        },
        "normalizedTuple": {
          "provider": "google",
          "state": "pressed"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Google"
            }
          ]
        }
      },
      {
        "id": "socialSignInButton-8",
        "originalTuple": {
          "Provider": "Google",
          "State": "Default"
        },
        "normalizedTuple": {
          "provider": "google",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Continue with Google"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "authDivider",
    "records": [
      {
        "id": "authDivider-1",
        "originalTuple": {},
        "normalizedTuple": {},
        "metrics": {
          "typography": [
            {
              "text": "or"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "bottomNavigation",
    "records": [
      {
        "id": "bottomNavigation-1",
        "originalTuple": {
          "Active": "Create"
        },
        "normalizedTuple": {
          "active": "create"
        },
        "metrics": {
          "typography": [
            {
              "text": "Home"
            },
            {
              "text": "Games"
            },
            {
              "text": "Create"
            },
            {
              "text": "Players"
            },
            {
              "text": "Profile"
            }
          ]
        }
      },
      {
        "id": "bottomNavigation-2",
        "originalTuple": {
          "Active": "Profile"
        },
        "normalizedTuple": {
          "active": "profile"
        },
        "metrics": {
          "typography": [
            {
              "text": "Home"
            },
            {
              "text": "Games"
            },
            {
              "text": "Create"
            },
            {
              "text": "Players"
            },
            {
              "text": "Profile"
            }
          ]
        }
      },
      {
        "id": "bottomNavigation-3",
        "originalTuple": {
          "Active": "Players"
        },
        "normalizedTuple": {
          "active": "players"
        },
        "metrics": {
          "typography": [
            {
              "text": "Home"
            },
            {
              "text": "Games"
            },
            {
              "text": "Create"
            },
            {
              "text": "Players"
            },
            {
              "text": "Profile"
            }
          ]
        }
      },
      {
        "id": "bottomNavigation-4",
        "originalTuple": {
          "Active": "Games"
        },
        "normalizedTuple": {
          "active": "games"
        },
        "metrics": {
          "typography": [
            {
              "text": "Home"
            },
            {
              "text": "Games"
            },
            {
              "text": "Create"
            },
            {
              "text": "Players"
            },
            {
              "text": "Profile"
            }
          ]
        }
      },
      {
        "id": "bottomNavigation-5",
        "originalTuple": {
          "Active": "Home"
        },
        "normalizedTuple": {
          "active": "home"
        },
        "metrics": {
          "typography": [
            {
              "text": "Home"
            },
            {
              "text": "Games"
            },
            {
              "text": "Create"
            },
            {
              "text": "Players"
            },
            {
              "text": "Profile"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "segmentedControl",
    "records": [
      {
        "id": "segmentedControl-1",
        "originalTuple": {
          "Options": "3",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "options": 3,
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Upcoming"
            },
            {
              "text": "Open"
            },
            {
              "text": "Past"
            }
          ]
        }
      },
      {
        "id": "segmentedControl-2",
        "originalTuple": {
          "Options": "4",
          "State": "Focused"
        },
        "normalizedTuple": {
          "options": 4,
          "state": "focused"
        },
        "metrics": {
          "typography": [
            {
              "text": "Upcoming"
            },
            {
              "text": "Open"
            },
            {
              "text": "Past"
            },
            {
              "text": "All"
            }
          ]
        }
      },
      {
        "id": "segmentedControl-3",
        "originalTuple": {
          "Options": "3",
          "State": "Selected"
        },
        "normalizedTuple": {
          "options": 3,
          "state": "selected"
        },
        "metrics": {
          "typography": [
            {
              "text": "Upcoming"
            },
            {
              "text": "Open"
            },
            {
              "text": "Past"
            }
          ]
        }
      },
      {
        "id": "segmentedControl-4",
        "originalTuple": {
          "Options": "2",
          "State": "Default"
        },
        "normalizedTuple": {
          "options": 2,
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Upcoming"
            },
            {
              "text": "Open"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "appHeader",
    "records": [
      {
        "id": "appHeader-1",
        "originalTuple": {
          "Page": "Settings"
        },
        "normalizedTuple": {
          "page": "settings"
        },
        "metrics": {
          "typography": [
            {
              "text": "Settings"
            },
            {
              "text": "Manage your account"
            }
          ]
        }
      },
      {
        "id": "appHeader-2",
        "originalTuple": {
          "Page": "Player details"
        },
        "normalizedTuple": {
          "page": "playerDetails"
        },
        "metrics": {
          "typography": [
            {
              "text": "Player profile"
            },
            {
              "text": "Player details and form"
            }
          ]
        }
      },
      {
        "id": "appHeader-3",
        "originalTuple": {
          "Page": "Game details"
        },
        "normalizedTuple": {
          "page": "gameDetails"
        },
        "metrics": {
          "typography": [
            {
              "text": "Game details"
            },
            {
              "text": "Open game · 1 spot left"
            }
          ]
        }
      },
      {
        "id": "appHeader-4",
        "originalTuple": {
          "Page": "Notifications"
        },
        "normalizedTuple": {
          "page": "notifications"
        },
        "metrics": {
          "typography": [
            {
              "text": "Notifications"
            },
            {
              "text": "Updates and activity"
            }
          ]
        }
      },
      {
        "id": "appHeader-5",
        "originalTuple": {
          "Page": "Profile"
        },
        "normalizedTuple": {
          "page": "profile"
        },
        "metrics": {
          "typography": [
            {
              "text": "Profile"
            },
            {
              "text": "Manage your account"
            }
          ]
        }
      },
      {
        "id": "appHeader-6",
        "originalTuple": {
          "Page": "Players"
        },
        "normalizedTuple": {
          "page": "players"
        },
        "metrics": {
          "typography": [
            {
              "text": "Players"
            },
            {
              "text": "Find your next partner"
            }
          ]
        }
      },
      {
        "id": "appHeader-7",
        "originalTuple": {
          "Page": "Create"
        },
        "normalizedTuple": {
          "page": "create"
        },
        "metrics": {
          "typography": [
            {
              "text": "Create game"
            },
            {
              "text": "Set up your next match"
            }
          ]
        }
      },
      {
        "id": "appHeader-8",
        "originalTuple": {
          "Page": "Games"
        },
        "normalizedTuple": {
          "page": "games"
        },
        "metrics": {
          "typography": [
            {
              "text": "Games"
            },
            {
              "text": "Find your next match"
            }
          ]
        }
      },
      {
        "id": "appHeader-9",
        "originalTuple": {
          "Page": "Home"
        },
        "normalizedTuple": {
          "page": "home"
        },
        "metrics": {
          "typography": [
            {
              "text": "Hi, Alex"
            },
            {
              "text": "Ready for your next match?"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "sectionHeader",
    "records": [
      {
        "id": "sectionHeader-1",
        "originalTuple": {},
        "normalizedTuple": {},
        "metrics": {
          "typography": [
            {
              "text": "Open games near you"
            },
            {
              "text": "See all ›"
            }
          ]
        }
      }
    ]
  }
] as const;

export const phase4Families = [
  {
    "key": "avatar",
    "records": [
      {
        "id": "avatar-1",
        "originalTuple": {
          "Size": "56",
          "State": "Online"
        },
        "normalizedTuple": {
          "size": 56,
          "presence": "online"
        },
        "metrics": {
          "typography": [
            {
              "text": "AP"
            }
          ]
        }
      },
      {
        "id": "avatar-2",
        "originalTuple": {
          "Size": "48",
          "State": "Offline"
        },
        "normalizedTuple": {
          "size": 48,
          "presence": "offline"
        },
        "metrics": {
          "typography": [
            {
              "text": "AP"
            }
          ]
        }
      },
      {
        "id": "avatar-3",
        "originalTuple": {
          "Size": "48",
          "State": "Away"
        },
        "normalizedTuple": {
          "size": 48,
          "presence": "away"
        },
        "metrics": {
          "typography": [
            {
              "text": "AP"
            }
          ]
        }
      },
      {
        "id": "avatar-4",
        "originalTuple": {
          "Size": "40",
          "State": "Online"
        },
        "normalizedTuple": {
          "size": 40,
          "presence": "online"
        },
        "metrics": {
          "typography": [
            {
              "text": "AP"
            }
          ]
        }
      },
      {
        "id": "avatar-5",
        "originalTuple": {
          "Size": "32",
          "State": "Online"
        },
        "normalizedTuple": {
          "size": 32,
          "presence": "online"
        },
        "metrics": {
          "typography": [
            {
              "text": "AP"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "avatarGroup",
    "records": [
      {
        "id": "avatarGroup-1",
        "originalTuple": {
          "Content": "2 slots",
          "State": "Empty"
        },
        "normalizedTuple": {
          "content": "2Slots",
          "state": "empty"
        },
        "metrics": {
          "typography": [
            {
              "text": "+"
            },
            {
              "text": "+"
            }
          ]
        }
      },
      {
        "id": "avatarGroup-2",
        "originalTuple": {
          "Content": "4 players",
          "State": "Overflow"
        },
        "normalizedTuple": {
          "content": "4Players",
          "state": "overflow"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            },
            {
              "text": "RB"
            },
            {
              "text": "+2"
            }
          ]
        }
      },
      {
        "id": "avatarGroup-3",
        "originalTuple": {
          "Content": "4 players",
          "State": "Default"
        },
        "normalizedTuple": {
          "content": "4Players",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            },
            {
              "text": "RB"
            }
          ]
        }
      },
      {
        "id": "avatarGroup-4",
        "originalTuple": {
          "Content": "3 players",
          "State": "Default"
        },
        "normalizedTuple": {
          "content": "3Players",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            }
          ]
        }
      },
      {
        "id": "avatarGroup-5",
        "originalTuple": {
          "Content": "2 players",
          "State": "Default"
        },
        "normalizedTuple": {
          "content": "2Players",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "JT"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "avatarPicker",
    "records": [
      {
        "id": "avatarPicker-1",
        "originalTuple": {
          "Content": "Empty",
          "State": "Error"
        },
        "normalizedTuple": {
          "content": "empty",
          "state": "error"
        },
        "metrics": {
          "typography": [
            {
              "text": "Add a profile photo"
            },
            {
              "text": "Choose a JPG or PNG under 5 MB"
            }
          ]
        }
      },
      {
        "id": "avatarPicker-2",
        "originalTuple": {
          "Content": "Photo",
          "State": "Selected"
        },
        "normalizedTuple": {
          "content": "photo",
          "state": "selected"
        },
        "metrics": {
          "typography": [
            {
              "text": "Change profile photo"
            }
          ]
        }
      },
      {
        "id": "avatarPicker-3",
        "originalTuple": {
          "Content": "Initials",
          "State": "Default"
        },
        "normalizedTuple": {
          "content": "initials",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "JW"
            },
            {
              "text": "Change profile photo"
            }
          ]
        }
      },
      {
        "id": "avatarPicker-4",
        "originalTuple": {
          "Content": "Empty",
          "State": "Default"
        },
        "normalizedTuple": {
          "content": "empty",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Add a profile photo"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "statusChip",
    "records": [
      {
        "id": "statusChip-1",
        "originalTuple": {
          "Style": "Neutral",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "style": "neutral",
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "Neutral"
            }
          ]
        }
      },
      {
        "id": "statusChip-2",
        "originalTuple": {
          "Style": "Success",
          "State": "Selected"
        },
        "normalizedTuple": {
          "style": "success",
          "state": "selected"
        },
        "metrics": {
          "typography": [
            {
              "text": "Success"
            }
          ]
        }
      },
      {
        "id": "statusChip-3",
        "originalTuple": {
          "Style": "Error",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "error",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Error"
            }
          ]
        }
      },
      {
        "id": "statusChip-4",
        "originalTuple": {
          "Style": "Info",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "info",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Info"
            }
          ]
        }
      },
      {
        "id": "statusChip-5",
        "originalTuple": {
          "Style": "Warning",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "warning",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Warning"
            }
          ]
        }
      },
      {
        "id": "statusChip-6",
        "originalTuple": {
          "Style": "Success",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "success",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Success"
            }
          ]
        }
      },
      {
        "id": "statusChip-7",
        "originalTuple": {
          "Style": "Neutral",
          "State": "Default"
        },
        "normalizedTuple": {
          "style": "neutral",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Neutral"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "stepProgress",
    "records": [
      {
        "id": "stepProgress-1",
        "originalTuple": {
          "Content": "Complete",
          "State": "Complete"
        },
        "normalizedTuple": {
          "content": "complete",
          "state": "complete"
        },
        "metrics": {
          "typography": [
            {
              "text": "Setup complete"
            }
          ]
        }
      },
      {
        "id": "stepProgress-2",
        "originalTuple": {
          "Content": "3",
          "State": "Active"
        },
        "normalizedTuple": {
          "content": 3,
          "state": "active"
        },
        "metrics": {
          "typography": [
            {
              "text": "Step 3 of 3"
            }
          ]
        }
      },
      {
        "id": "stepProgress-3",
        "originalTuple": {
          "Content": "2",
          "State": "Active"
        },
        "normalizedTuple": {
          "content": 2,
          "state": "active"
        },
        "metrics": {
          "typography": [
            {
              "text": "Step 2 of 3"
            }
          ]
        }
      },
      {
        "id": "stepProgress-4",
        "originalTuple": {
          "Content": "1",
          "State": "Active"
        },
        "normalizedTuple": {
          "content": 1,
          "state": "active"
        },
        "metrics": {
          "typography": [
            {
              "text": "Step 1 of 3"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "playerItem",
    "records": [
      {
        "id": "playerItem-1",
        "originalTuple": {
          "Type": "Invite result",
          "State": "Disabled"
        },
        "normalizedTuple": {
          "type": "inviteResult",
          "state": "disabled"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "Alex Morgan"
            },
            {
              "text": "Intermediate · Rating 4.6"
            }
          ]
        }
      },
      {
        "id": "playerItem-2",
        "originalTuple": {
          "Type": "Invite result",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "inviteResult",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "Alex Morgan"
            },
            {
              "text": "Intermediate · Rating 4.6"
            }
          ]
        }
      },
      {
        "id": "playerItem-3",
        "originalTuple": {
          "Type": "Game slot",
          "State": "Empty"
        },
        "normalizedTuple": {
          "type": "gameSlot",
          "state": "empty"
        },
        "metrics": {
          "typography": [
            {
              "text": "+"
            },
            {
              "text": "Open player slot"
            },
            {
              "text": "Invite someone to join"
            }
          ]
        }
      },
      {
        "id": "playerItem-4",
        "originalTuple": {
          "Type": "Game slot",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "gameSlot",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "Alex Morgan"
            },
            {
              "text": "Confirmed · Intermediate"
            }
          ]
        }
      },
      {
        "id": "playerItem-5",
        "originalTuple": {
          "Type": "List",
          "State": "Selected"
        },
        "normalizedTuple": {
          "type": "list",
          "state": "selected"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "Alex Morgan"
            },
            {
              "text": "Intermediate · Rating 4.6"
            }
          ]
        }
      },
      {
        "id": "playerItem-6",
        "originalTuple": {
          "Type": "List",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "list",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "AM"
            },
            {
              "text": "Alex Morgan"
            },
            {
              "text": "Intermediate · Rating 4.6"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "gameCard",
    "records": [
      {
        "id": "gameCard-1",
        "originalTuple": {
          "Type": "Open",
          "State": "Full"
        },
        "normalizedTuple": {
          "type": "open",
          "state": "full"
        },
        "metrics": {
          "typography": [
            {
              "text": "Open game"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "Padel United · Court 3"
            },
            {
              "text": "18:30 · 90 min"
            },
            {
              "text": "View"
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            },
            {
              "text": "RB"
            }
          ]
        }
      },
      {
        "id": "gameCard-2",
        "originalTuple": {
          "Type": "Completed",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "completed",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Completed"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "Padel United · Court 3"
            },
            {
              "text": "18:30 · 90 min"
            },
            {
              "text": "Results"
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            },
            {
              "text": "RB"
            }
          ]
        }
      },
      {
        "id": "gameCard-3",
        "originalTuple": {
          "Type": "Compact",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "compact",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Open game"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "Padel United · Court 3"
            }
          ]
        }
      },
      {
        "id": "gameCard-4",
        "originalTuple": {
          "Type": "Open",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "open",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Open game"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "Padel United · Court 3"
            },
            {
              "text": "18:30 · 90 min"
            },
            {
              "text": "View"
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            }
          ]
        }
      },
      {
        "id": "gameCard-5",
        "originalTuple": {
          "Type": "Next",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "next",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Your next game"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "Padel United · Court 3"
            },
            {
              "text": "18:30 · 90 min"
            },
            {
              "text": "View"
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            },
            {
              "text": "RB"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "notificationRow",
    "records": [
      {
        "id": "notificationRow-1",
        "originalTuple": {
          "Type": "Social",
          "State": "Read"
        },
        "normalizedTuple": {
          "type": "social",
          "state": "read"
        },
        "metrics": {
          "typography": [
            {
              "text": "Social update"
            },
            {
              "text": "Your activity has a new update"
            },
            {
              "text": "2m"
            }
          ]
        }
      },
      {
        "id": "notificationRow-2",
        "originalTuple": {
          "Type": "Game",
          "State": "Read"
        },
        "normalizedTuple": {
          "type": "game",
          "state": "read"
        },
        "metrics": {
          "typography": [
            {
              "text": "Game update"
            },
            {
              "text": "Your activity has a new update"
            },
            {
              "text": "2m"
            }
          ]
        }
      },
      {
        "id": "notificationRow-3",
        "originalTuple": {
          "Type": "Warning",
          "State": "Unread"
        },
        "normalizedTuple": {
          "type": "warning",
          "state": "unread"
        },
        "metrics": {
          "typography": [
            {
              "text": "Game needs attention"
            },
            {
              "text": "Your activity has a new update"
            },
            {
              "text": "2m"
            }
          ]
        }
      },
      {
        "id": "notificationRow-4",
        "originalTuple": {
          "Type": "Social",
          "State": "Unread"
        },
        "normalizedTuple": {
          "type": "social",
          "state": "unread"
        },
        "metrics": {
          "typography": [
            {
              "text": "Social update"
            },
            {
              "text": "Your activity has a new update"
            },
            {
              "text": "2m"
            }
          ]
        }
      },
      {
        "id": "notificationRow-5",
        "originalTuple": {
          "Type": "Booking",
          "State": "Unread"
        },
        "normalizedTuple": {
          "type": "booking",
          "state": "unread"
        },
        "metrics": {
          "typography": [
            {
              "text": "Booking update"
            },
            {
              "text": "Your activity has a new update"
            },
            {
              "text": "2m"
            }
          ]
        }
      },
      {
        "id": "notificationRow-6",
        "originalTuple": {
          "Type": "Game",
          "State": "Unread"
        },
        "normalizedTuple": {
          "type": "game",
          "state": "unread"
        },
        "metrics": {
          "typography": [
            {
              "text": "Game update"
            },
            {
              "text": "Your activity has a new update"
            },
            {
              "text": "2m"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "settingsRow",
    "records": [
      {
        "id": "settingsRow-1",
        "originalTuple": {
          "Type": "Navigation",
          "State": "Default",
          "Icon": "Court"
        },
        "normalizedTuple": {
          "type": "navigation",
          "state": "default",
          "icon": "court"
        },
        "metrics": {
          "typography": [
            {
              "text": "Account"
            }
          ]
        }
      },
      {
        "id": "settingsRow-2",
        "originalTuple": {
          "Type": "Destructive",
          "State": "Default",
          "Icon": "Close"
        },
        "normalizedTuple": {
          "type": "destructive",
          "state": "default",
          "icon": "close"
        },
        "metrics": {
          "typography": [
            {
              "text": "Sign out"
            }
          ]
        }
      },
      {
        "id": "settingsRow-3",
        "originalTuple": {
          "Type": "Toggle",
          "State": "Disabled",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "type": "toggle",
          "state": "disabled",
          "icon": "notification"
        },
        "metrics": {
          "typography": [
            {
              "text": "Notifications"
            }
          ]
        }
      },
      {
        "id": "settingsRow-4",
        "originalTuple": {
          "Type": "Toggle",
          "State": "On",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "type": "toggle",
          "state": "on",
          "icon": "notification"
        },
        "metrics": {
          "typography": [
            {
              "text": "Notifications"
            }
          ]
        }
      },
      {
        "id": "settingsRow-5",
        "originalTuple": {
          "Type": "Toggle",
          "State": "Off",
          "Icon": "Notification"
        },
        "normalizedTuple": {
          "type": "toggle",
          "state": "off",
          "icon": "notification"
        },
        "metrics": {
          "typography": [
            {
              "text": "Notifications"
            }
          ]
        }
      },
      {
        "id": "settingsRow-6",
        "originalTuple": {
          "Type": "Value",
          "State": "Default",
          "Icon": "Location"
        },
        "normalizedTuple": {
          "type": "value",
          "state": "default",
          "icon": "location"
        },
        "metrics": {
          "typography": [
            {
              "text": "Location"
            },
            {
              "text": "London"
            }
          ]
        }
      },
      {
        "id": "settingsRow-7",
        "originalTuple": {
          "Type": "Navigation",
          "State": "Disabled",
          "Icon": "Profile"
        },
        "normalizedTuple": {
          "type": "navigation",
          "state": "disabled",
          "icon": "profile"
        },
        "metrics": {
          "typography": [
            {
              "text": "Account"
            }
          ]
        }
      },
      {
        "id": "settingsRow-8",
        "originalTuple": {
          "Type": "Navigation",
          "State": "Pressed",
          "Icon": "Profile"
        },
        "normalizedTuple": {
          "type": "navigation",
          "state": "pressed",
          "icon": "profile"
        },
        "metrics": {
          "typography": [
            {
              "text": "Account"
            }
          ]
        }
      },
      {
        "id": "settingsRow-9",
        "originalTuple": {
          "Type": "Navigation",
          "State": "Default",
          "Icon": "Profile"
        },
        "normalizedTuple": {
          "type": "navigation",
          "state": "default",
          "icon": "profile"
        },
        "metrics": {
          "typography": [
            {
              "text": "Account"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "statTile",
    "records": [
      {
        "id": "statTile-1",
        "originalTuple": {
          "Type": "Featured",
          "Content": "Streak",
          "State": "Positive"
        },
        "normalizedTuple": {
          "type": "featured",
          "content": "streak",
          "state": "positive"
        },
        "metrics": {
          "typography": [
            {
              "text": "Streak"
            },
            {
              "text": "5 weeks"
            },
            {
              "text": "Personal best"
            }
          ]
        }
      },
      {
        "id": "statTile-2",
        "originalTuple": {
          "Type": "Featured",
          "Content": "Rating",
          "State": "Positive"
        },
        "normalizedTuple": {
          "type": "featured",
          "content": "rating",
          "state": "positive"
        },
        "metrics": {
          "typography": [
            {
              "text": "Rating"
            },
            {
              "text": "4.6"
            },
            {
              "text": "Top 18% of players"
            }
          ]
        }
      },
      {
        "id": "statTile-3",
        "originalTuple": {
          "Type": "Compact",
          "Content": "Streak",
          "State": "Positive"
        },
        "normalizedTuple": {
          "type": "compact",
          "content": "streak",
          "state": "positive"
        },
        "metrics": {
          "typography": [
            {
              "text": "Streak"
            },
            {
              "text": "5"
            },
            {
              "text": "Weeks active"
            }
          ]
        }
      },
      {
        "id": "statTile-4",
        "originalTuple": {
          "Type": "Compact",
          "Content": "Rating",
          "State": "Neutral"
        },
        "normalizedTuple": {
          "type": "compact",
          "content": "rating",
          "state": "neutral"
        },
        "metrics": {
          "typography": [
            {
              "text": "Rating"
            },
            {
              "text": "4.6"
            },
            {
              "text": "Intermediate"
            }
          ]
        }
      },
      {
        "id": "statTile-5",
        "originalTuple": {
          "Type": "Compact",
          "Content": "Win rate",
          "State": "Positive"
        },
        "normalizedTuple": {
          "type": "compact",
          "content": "winRate",
          "state": "positive"
        },
        "metrics": {
          "typography": [
            {
              "text": "Win rate"
            },
            {
              "text": "68%"
            },
            {
              "text": "+8% this month"
            }
          ]
        }
      },
      {
        "id": "statTile-6",
        "originalTuple": {
          "Type": "Compact",
          "Content": "Games played",
          "State": "Neutral"
        },
        "normalizedTuple": {
          "type": "compact",
          "content": "gamesPlayed",
          "state": "neutral"
        },
        "metrics": {
          "typography": [
            {
              "text": "Games played"
            },
            {
              "text": "24"
            },
            {
              "text": "All time"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "scoreResultBlock",
    "records": [
      {
        "id": "scoreResultBlock-1",
        "originalTuple": {
          "Type": "Full",
          "State": "Live"
        },
        "normalizedTuple": {
          "type": "full",
          "state": "live"
        },
        "metrics": {
          "typography": [
            {
              "text": "LIVE"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "S1"
            },
            {
              "text": "S2"
            },
            {
              "text": "AM"
            },
            {
              "text": "Alex & Jamie"
            },
            {
              "text": "6"
            },
            {
              "text": "6"
            },
            {
              "text": "RB"
            },
            {
              "text": "Riley & Sam"
            },
            {
              "text": "4"
            },
            {
              "text": "3"
            },
            {
              "text": "Set 2 in progress"
            }
          ]
        }
      },
      {
        "id": "scoreResultBlock-2",
        "originalTuple": {
          "Type": "Full",
          "State": "Lost"
        },
        "normalizedTuple": {
          "type": "full",
          "state": "lost"
        },
        "metrics": {
          "typography": [
            {
              "text": "FINAL"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "S1"
            },
            {
              "text": "S2"
            },
            {
              "text": "AM"
            },
            {
              "text": "Alex & Jamie"
            },
            {
              "text": "4"
            },
            {
              "text": "3"
            },
            {
              "text": "RB"
            },
            {
              "text": "Riley & Sam"
            },
            {
              "text": "6"
            },
            {
              "text": "6"
            }
          ]
        }
      },
      {
        "id": "scoreResultBlock-3",
        "originalTuple": {
          "Type": "Full",
          "State": "Won"
        },
        "normalizedTuple": {
          "type": "full",
          "state": "won"
        },
        "metrics": {
          "typography": [
            {
              "text": "YOU WON"
            },
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "S1"
            },
            {
              "text": "S2"
            },
            {
              "text": "AM"
            },
            {
              "text": "Alex & Jamie"
            },
            {
              "text": "6"
            },
            {
              "text": "6"
            },
            {
              "text": "RB"
            },
            {
              "text": "Riley & Sam"
            },
            {
              "text": "4"
            },
            {
              "text": "3"
            }
          ]
        }
      },
      {
        "id": "scoreResultBlock-4",
        "originalTuple": {
          "Type": "Compact",
          "State": "Live"
        },
        "normalizedTuple": {
          "type": "compact",
          "state": "live"
        },
        "metrics": {
          "typography": [
            {
              "text": "LIVE"
            },
            {
              "text": "Alex & Jamie"
            },
            {
              "text": "6"
            },
            {
              "text": "6"
            },
            {
              "text": "Riley & Sam"
            },
            {
              "text": "4"
            },
            {
              "text": "3"
            },
            {
              "text": "Set 2 in progress"
            }
          ]
        }
      },
      {
        "id": "scoreResultBlock-5",
        "originalTuple": {
          "Type": "Compact",
          "State": "Lost"
        },
        "normalizedTuple": {
          "type": "compact",
          "state": "lost"
        },
        "metrics": {
          "typography": [
            {
              "text": "FINAL"
            },
            {
              "text": "Alex & Jamie"
            },
            {
              "text": "4"
            },
            {
              "text": "3"
            },
            {
              "text": "Riley & Sam"
            },
            {
              "text": "6"
            },
            {
              "text": "6"
            }
          ]
        }
      },
      {
        "id": "scoreResultBlock-6",
        "originalTuple": {
          "Type": "Compact",
          "State": "Won"
        },
        "normalizedTuple": {
          "type": "compact",
          "state": "won"
        },
        "metrics": {
          "typography": [
            {
              "text": "YOU WON"
            },
            {
              "text": "Alex & Jamie"
            },
            {
              "text": "6"
            },
            {
              "text": "6"
            },
            {
              "text": "Riley & Sam"
            },
            {
              "text": "4"
            },
            {
              "text": "3"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "playerPreferencesCard",
    "records": [
      {
        "id": "playerPreferencesCard-1",
        "originalTuple": {
          "Property 1": "Content=Profile"
        },
        "normalizedTuple": {
          "content": "profile"
        },
        "metrics": {
          "typography": [
            {
              "text": "Playing preferences"
            },
            {
              "text": "Either side"
            },
            {
              "text": "Mon–Sat"
            },
            {
              "text": "Afternoons"
            }
          ]
        }
      },
      {
        "id": "playerPreferencesCard-2",
        "originalTuple": {
          "Property 1": "Content=Full"
        },
        "normalizedTuple": {
          "content": "full"
        },
        "metrics": {
          "typography": [
            {
              "text": "Your preferences"
            },
            {
              "text": "Intermediate"
            },
            {
              "text": "Either side"
            },
            {
              "text": "Mon–Sat"
            },
            {
              "text": "Afternoons"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "bannerToast",
    "records": [
      {
        "id": "bannerToast-1",
        "originalTuple": {
          "Style": "Error",
          "Type": "Toast"
        },
        "normalizedTuple": {
          "style": "error",
          "type": "toast"
        },
        "metrics": {
          "typography": [
            {
              "text": "Something went wrong"
            },
            {
              "text": "Please try again in a moment."
            }
          ]
        }
      },
      {
        "id": "bannerToast-2",
        "originalTuple": {
          "Style": "Warning",
          "Type": "Banner"
        },
        "normalizedTuple": {
          "style": "warning",
          "type": "banner"
        },
        "metrics": {
          "typography": [
            {
              "text": "Check game details"
            },
            {
              "text": "One player still needs to confirm."
            },
            {
              "text": "View"
            }
          ]
        }
      },
      {
        "id": "bannerToast-3",
        "originalTuple": {
          "Style": "Info",
          "Type": "Banner"
        },
        "normalizedTuple": {
          "style": "info",
          "type": "banner"
        },
        "metrics": {
          "typography": [
            {
              "text": "Booking update"
            },
            {
              "text": "Court details have changed."
            },
            {
              "text": "View"
            }
          ]
        }
      },
      {
        "id": "bannerToast-4",
        "originalTuple": {
          "Style": "Success",
          "Type": "Toast"
        },
        "normalizedTuple": {
          "style": "success",
          "type": "toast"
        },
        "metrics": {
          "typography": [
            {
              "text": "Game created"
            },
            {
              "text": "Your game is ready to share."
            }
          ]
        }
      }
    ]
  },
  {
    "key": "emptyState",
    "records": [
      {
        "id": "emptyState-1",
        "originalTuple": {
          "Content": "No players",
          "State": "With action"
        },
        "normalizedTuple": {
          "content": "noPlayers",
          "state": "withAction"
        },
        "metrics": {
          "typography": [
            {
              "text": "No players"
            },
            {
              "text": "There’s nothing here yet."
            },
            {
              "text": "Get started"
            }
          ]
        }
      },
      {
        "id": "emptyState-2",
        "originalTuple": {
          "Content": "No notifications",
          "State": "No action"
        },
        "normalizedTuple": {
          "content": "noNotifications",
          "state": "noAction"
        },
        "metrics": {
          "typography": [
            {
              "text": "No notifications"
            },
            {
              "text": "There’s nothing here yet."
            }
          ]
        }
      },
      {
        "id": "emptyState-3",
        "originalTuple": {
          "Content": "No games",
          "State": "With action"
        },
        "normalizedTuple": {
          "content": "noGames",
          "state": "withAction"
        },
        "metrics": {
          "typography": [
            {
              "text": "No games"
            },
            {
              "text": "There’s nothing here yet."
            },
            {
              "text": "Get started"
            }
          ]
        }
      }
    ]
  },
  {
    "key": "illustratedCard",
    "records": [
      {
        "id": "illustratedCard-1",
        "originalTuple": {
          "Type": "Game created",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "gameCreated",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Game created!"
            },
            {
              "text": "Share"
            },
            {
              "text": "Success"
            },
            {
              "text": "Your court is booked and"
            },
            {
              "text": "ready to share."
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            }
          ]
        }
      },
      {
        "id": "illustratedCard-2",
        "originalTuple": {
          "Type": "Invite players",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "invitePlayers",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Bring your crew"
            },
            {
              "text": "Invite"
            },
            {
              "text": "Players"
            },
            {
              "text": "Share this game and fill"
            },
            {
              "text": "the remaining player slots."
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            }
          ]
        }
      },
      {
        "id": "illustratedCard-3",
        "originalTuple": {
          "Type": "Match result",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "matchResult",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Great match!"
            },
            {
              "text": "Results"
            },
            {
              "text": "Completed"
            },
            {
              "text": "You won 6–4, 6–3"
            },
            {
              "text": "View scores and highlights"
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            },
            {
              "text": "RB"
            }
          ]
        }
      },
      {
        "id": "illustratedCard-4",
        "originalTuple": {
          "Type": "Next game",
          "State": "Default"
        },
        "normalizedTuple": {
          "type": "nextGame",
          "state": "default"
        },
        "metrics": {
          "typography": [
            {
              "text": "Tuesday Social Padel"
            },
            {
              "text": "View"
            },
            {
              "text": "Your next game"
            },
            {
              "text": "Padel United · Court 3"
            },
            {
              "text": "18:30 · 90 min"
            },
            {
              "text": "AM"
            },
            {
              "text": "JT"
            },
            {
              "text": "SK"
            },
            {
              "text": "RB"
            }
          ]
        }
      }
    ]
  }
] as const;

export const buttonRecords = phase3Families[0].records;
export const buttonStyles = Object.freeze(['primary', 'secondary', 'destructive', 'ghost'] as const);
export const buttonSizes = Object.freeze([40, 48] as const);
export const avatarRecords = phase4Families[0].records;
