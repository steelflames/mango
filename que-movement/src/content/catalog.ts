import type { Expansion, Badge } from './types';

export const RULES = { pointCap: 500, fullPractice: 5, maxSteps: 12, maxProgressionsPerCard: 2, points: {
  "foundation": 10,
  "working": 15,
  "challenge": 20,
  "special": 5
} } as const;

export const expansions: Expansion[] = [
  {
    "id": "core",
    "name": "Q Movement Core",
    "description": "Bridging, Scapula and Core. The starting field guide.",
    "deckIds": [
      "bridging",
      "scapula",
      "core"
    ],
    "installedByDefault": true,
    "available": true
  },
  {
    "id": "balance-pack",
    "name": "Balance & Longevity",
    "description": "Standing control, gait and floor confidence.",
    "deckIds": [
      "standing-balance",
      "floor-rise"
    ],
    "themeId": "spring-garden",
    "installedByDefault": false,
    "available": true
  },
  {
    "id": "classical-mat",
    "name": "Classical Mat",
    "description": "The traditional order, cued for real bodies.",
    "deckIds": [],
    "installedByDefault": false,
    "available": false
  },
  {
    "id": "reformer",
    "name": "Reformer",
    "description": "Spring load, footwork and carriage control.",
    "deckIds": [],
    "installedByDefault": false,
    "available": false
  },
  {
    "id": "athletic-flow",
    "name": "Athletic Flow",
    "description": "Dynamic sequencing and higher intensity.",
    "deckIds": [],
    "installedByDefault": false,
    "available": false
  },
  {
    "id": "teach-back",
    "name": "Teach Back",
    "description": "Class templates and cueing practice for teachers.",
    "deckIds": [],
    "installedByDefault": false,
    "available": false
  },
  {
    "id": "cozy-winter",
    "name": "Cozy Winter Stretch",
    "description": "Gentle comfort work and a seasonal skin.",
    "deckIds": [],
    "installedByDefault": false,
    "available": false
  },
  {
    "id": "witchy-seasonal",
    "name": "Witchy Seasonal Pack",
    "description": "Moths, moons and pressed herbs. Cosmetic seasonal skins.",
    "deckIds": [],
    "themeId": "witchy-autumn",
    "installedByDefault": false,
    "available": false
  }
];

export const badges: Badge[] = [
  {
    "id": "first-build",
    "name": "First Build",
    "glyph": "✦",
    "description": "Saved a first sequence."
  },
  {
    "id": "flow-finder",
    "name": "Flow Finder",
    "glyph": "≈",
    "description": "Connected with a transition."
  },
  {
    "id": "progressive-thinker",
    "name": "Progressive Thinker",
    "glyph": "⌃",
    "description": "Changed a movement with a progression."
  },
  {
    "id": "full-practice",
    "name": "Full Practice",
    "glyph": "❋",
    "description": "All three starting decks in one build."
  },
  {
    "id": "remix",
    "name": "Remix",
    "glyph": "↻",
    "description": "Rebuilt a sequence and played it again."
  },
  {
    "id": "bridge-builder",
    "name": "Bridge Builder",
    "glyph": "⌒",
    "description": "Built the bridging path."
  },
  {
    "id": "steady-shoulders",
    "name": "Steady Shoulders",
    "glyph": "⋀",
    "description": "Built the scapular path."
  },
  {
    "id": "centre-finder",
    "name": "Centre Finder",
    "glyph": "◉",
    "description": "Built the centre path."
  },
  {
    "id": "sure-footed",
    "name": "Sure Footed",
    "glyph": "⏚",
    "description": "Found the ground standing up."
  }
];
