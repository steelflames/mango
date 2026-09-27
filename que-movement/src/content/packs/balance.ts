import type { Pack } from '../types';

// Generated from the Q Movement content. Edit freely — packs are pure data.
export const balancePack: Pack = {
  id: "balance-pack",
  decks: [
  {
    "id": "standing-balance",
    "name": "Standing Balance",
    "tagline": "Root · Shift · Rise",
    "description": "Confidence on two feet, then one. Foot tripod, weight shift and the honest wobble in between.",
    "regionId": "center-balance",
    "accentVar": "--sage",
    "artKey": "balance",
    "packId": "balance-pack"
  },
  {
    "id": "floor-rise",
    "name": "Floor Rise",
    "tagline": "Down · Around · Up",
    "description": "Getting to the floor and back up again with options — the most practical strength there is.",
    "regionId": "center-balance",
    "accentVar": "--gold",
    "artKey": "rise",
    "packId": "balance-pack"
  }
],
  movementCards: [
  {
    "id": "balance-foundation",
    "kind": "movement",
    "deckId": "standing-balance",
    "name": "Tripod Foot",
    "level": "foundation",
    "shortCue": "Three points down: big toe, little toe, heel. Spread and soften.",
    "movementGoal": "Foot awareness as a base of support",
    "points": 10,
    "art": "balance-foundation",
    "unlockedByDefault": true,
    "requirements": [],
    "duration": 75,
    "position": "standing",
    "dose": {
      "kind": "hold",
      "seconds": 30
    }
  },
  {
    "id": "balance-working",
    "kind": "movement",
    "deckId": "standing-balance",
    "name": "Weight Shift",
    "level": "working",
    "shortCue": "Travel the weight side to side without collapsing into a hip.",
    "movementGoal": "Lateral control and gait preparation",
    "points": 15,
    "art": "balance-working",
    "unlockedByDefault": false,
    "requirements": [
      "Complete Tripod Foot at least once",
      "Build a sequence that includes the Standing Balance deck",
      "Complete that sequence"
    ],
    "duration": 90,
    "position": "standing",
    "dose": {
      "kind": "reps",
      "reps": 10
    }
  },
  {
    "id": "balance-challenge",
    "kind": "movement",
    "deckId": "standing-balance",
    "name": "Heel Raise to Balance",
    "level": "challenge",
    "shortCue": "Rise through the whole foot and find stillness at the top.",
    "movementGoal": "Ankle strength and single-point balance",
    "points": 20,
    "art": "balance-challenge",
    "unlockedByDefault": false,
    "requirements": [
      "Unlock Weight Shift",
      "Complete Weight Shift at least once"
    ],
    "duration": 100,
    "position": "standing",
    "dose": {
      "kind": "reps",
      "reps": 8
    }
  },
  {
    "id": "rise-foundation",
    "kind": "movement",
    "deckId": "floor-rise",
    "name": "Side Sit to Hands",
    "level": "foundation",
    "shortCue": "Sit to one side and let the hands take some of the story.",
    "movementGoal": "Confident floor transitions",
    "points": 10,
    "art": "rise-foundation",
    "unlockedByDefault": true,
    "requirements": [],
    "duration": 90,
    "position": "seated",
    "dose": {
      "kind": "reps",
      "reps": 4,
      "perSide": true
    }
  },
  {
    "id": "rise-working",
    "kind": "movement",
    "deckId": "floor-rise",
    "name": "Half-Kneel Rise",
    "level": "working",
    "shortCue": "Stack over the front foot and stand without a rush.",
    "movementGoal": "Loaded single-leg rise",
    "points": 15,
    "art": "rise-working",
    "unlockedByDefault": false,
    "requirements": [
      "Complete Side Sit to Hands at least once",
      "Build a sequence that includes the Floor Rise deck",
      "Complete that sequence"
    ],
    "duration": 105,
    "position": "kneeling",
    "dose": {
      "kind": "reps",
      "reps": 5,
      "perSide": true
    }
  },
  {
    "id": "rise-challenge",
    "kind": "movement",
    "deckId": "floor-rise",
    "name": "Floor to Stand, No Hands",
    "level": "challenge",
    "shortCue": "Find a route up that keeps the hands free the whole way.",
    "movementGoal": "Whole-body strength and problem solving",
    "points": 20,
    "art": "rise-challenge",
    "unlockedByDefault": false,
    "requirements": [
      "Unlock Half-Kneel Rise",
      "Complete Half-Kneel Rise at least once"
    ],
    "duration": 120,
    "position": "standing",
    "dose": {
      "kind": "reps",
      "reps": 3
    }
  }
],
  specialCards: [
  {
    "id": "tr-stand-to-wall",
    "kind": "transition",
    "name": "Standing to Wall Support",
    "shortCue": "Travel to the wall and let it hold a little of you.",
    "movementGoal": "Graded support for balance work",
    "points": 5,
    "art": "transition-turn",
    "duration": 30,
    "from": [
      "standing"
    ],
    "to": [
      "standing"
    ]
  },
  {
    "id": "tr-seated-kneel",
    "kind": "transition",
    "name": "Seated to Kneeling",
    "shortCue": "Turn over one hip and arrive tall on the knees.",
    "movementGoal": "Getting up off the floor, step one",
    "points": 5,
    "art": "transition-rise",
    "duration": 30,
    "from": [
      "seated"
    ],
    "to": [
      "kneeling"
    ]
  }
],
  challenges: [
  {
    "id": "sure-footed",
    "name": "Sure Footed",
    "description": "Complete Tripod Foot and Weight Shift in one sequence.",
    "detail": "From the Balance & Longevity pack.",
    "trigger": "sequence-complete",
    "rule": {
      "requiredCardIds": [
        "balance-foundation",
        "balance-working"
      ]
    },
    "reward": {
      "points": 50,
      "badgeId": "sure-footed"
    },
    "packId": "balance-pack"
  }
],
  themes: [
  {
    "id": "spring-garden",
    "name": "Spring Garden",
    "description": "Pale wash, new-leaf green and blossom pink. Arrives with Balance & Longevity.",
    "packId": "balance-pack",
    "unlockedByDefault": true,
    "vars": {
      "--paper": "#F4F6EC",
      "--paper-deep": "#E6EBDA",
      "--paper-card": "#FCFDF6",
      "--ink": "#2C332A",
      "--ink-soft": "#5F6B59",
      "--ink-faint": "#93A08C",
      "--line": "#BFCDB2",
      "--forest": "#3D6B45",
      "--sage": "#93B58C",
      "--dusty-blue": "#6F94A8",
      "--aubergine": "#8C4F6B",
      "--gold": "#A8873C",
      "--gold-soft": "#DCCB93",
      "--wash-a": "rgba(147,181,140,0.30)",
      "--wash-b": "rgba(111,148,168,0.22)",
      "--wash-c": "rgba(214,150,175,0.24)",
      "--rail": "#EDF1E2",
      "--shadow": "rgba(50,60,40,0.18)",
      "--glow": "rgba(168,135,60,0.5)",
      "--grain-opacity": "0.26",
      "--moon": "❀"
    }
  }
],
  regions: []
};
