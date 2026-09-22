// Story-only data for statTile.
export const statTileFixtures = [
  {
    "label": "Featured / Streak / Positive",
    "configuration": {
      "type": "featured",
      "content": "streak",
      "state": "positive"
    },
    "copy": [
      "Streak",
      "5 weeks",
      "Personal best"
    ]
  },
  {
    "label": "Featured / Rating / Positive",
    "configuration": {
      "type": "featured",
      "content": "rating",
      "state": "positive"
    },
    "copy": [
      "Rating",
      "4.6",
      "Top 18% of players"
    ]
  },
  {
    "label": "Compact / Streak / Positive",
    "configuration": {
      "type": "compact",
      "content": "streak",
      "state": "positive"
    },
    "copy": [
      "Streak",
      "5",
      "Weeks active"
    ]
  },
  {
    "label": "Compact / Rating / Neutral",
    "configuration": {
      "type": "compact",
      "content": "rating",
      "state": "neutral"
    },
    "copy": [
      "Rating",
      "4.6",
      "Intermediate"
    ]
  },
  {
    "label": "Compact / Win rate / Positive",
    "configuration": {
      "type": "compact",
      "content": "winRate",
      "state": "positive"
    },
    "copy": [
      "Win rate",
      "68%",
      "+8% this month"
    ]
  },
  {
    "label": "Compact / Games played / Neutral",
    "configuration": {
      "type": "compact",
      "content": "gamesPlayed",
      "state": "neutral"
    },
    "copy": [
      "Games played",
      "24",
      "All time"
    ]
  }
] as const;
