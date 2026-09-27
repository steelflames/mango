import type { Pack } from '../types';

// Generated from the Q Movement content. Edit freely — packs are pure data.
export const corePack: Pack = {
  id: "core",
  decks: [
  {
    "id": "bridging",
    "name": "Bridging",
    "tagline": "Lift · Connect · Flow",
    "description": "The back of the body waking up. Hip extension, trunk organisation, and learning to lift without gripping.",
    "regionId": "strength-support",
    "accentVar": "--forest",
    "artKey": "bridge",
    "packId": "core"
  },
  {
    "id": "scapula",
    "name": "Scapula",
    "tagline": "Stabilise · Strengthen · Move Freely",
    "description": "Shoulder blades that glide and settle. Support for everything done on the hands, and for carrying a head all day.",
    "regionId": "strength-support",
    "accentVar": "--dusty-blue",
    "artKey": "scapula",
    "packId": "core"
  },
  {
    "id": "core",
    "name": "Core",
    "tagline": "Build · Integrate · Ground",
    "description": "Ribs and pelvis learning to talk to each other. Breath first, then load, then articulation.",
    "regionId": "core-concepts",
    "accentVar": "--aubergine",
    "artKey": "core",
    "packId": "core"
  }
],
  movementCards: [
  {
    "id": "bridge-foundation",
    "kind": "movement",
    "deckId": "bridging",
    "name": "Bridge",
    "level": "foundation",
    "shortCue": "Reach the knees away and lift from the backs of the legs.",
    "movementGoal": "Hip extension and trunk organisation",
    "points": 10,
    "art": "bridge-foundation",
    "unlockedByDefault": true,
    "requirements": [],
    "duration": 90,
    "position": "supine",
    "dose": {
      "kind": "reps",
      "reps": 8
    }
  },
  {
    "id": "bridge-working",
    "kind": "movement",
    "deckId": "bridging",
    "name": "Bridge March",
    "level": "working",
    "shortCue": "Keep the pelvis level as one foot quietly floats.",
    "movementGoal": "Pelvic stability under changing load",
    "points": 15,
    "art": "bridge-working",
    "unlockedByDefault": false,
    "requirements": [
      "Complete Bridge at least once",
      "Build a sequence that includes the Bridging deck",
      "Complete that sequence"
    ],
    "duration": 105,
    "position": "supine",
    "dose": {
      "kind": "reps",
      "reps": 6,
      "perSide": true
    }
  },
  {
    "id": "bridge-challenge",
    "kind": "movement",
    "deckId": "bridging",
    "name": "Single-Leg Bridge",
    "level": "challenge",
    "shortCue": "Lift from the standing leg without letting the opposite hip drop.",
    "movementGoal": "Single-leg hip extension with control",
    "points": 20,
    "art": "bridge-challenge",
    "unlockedByDefault": false,
    "requirements": [
      "Unlock Bridge March",
      "Complete Bridge March at least once",
      "Complete the Bridge Builder challenge"
    ],
    "duration": 120,
    "position": "supine",
    "dose": {
      "kind": "reps",
      "reps": 5,
      "perSide": true
    }
  },
  {
    "id": "scapula-foundation",
    "kind": "movement",
    "deckId": "scapula",
    "name": "Scapular Glide",
    "level": "foundation",
    "shortCue": "Let the shoulder blades slide wide, then gather them home.",
    "movementGoal": "Scapular mobility and awareness",
    "points": 10,
    "art": "scapula-foundation",
    "unlockedByDefault": true,
    "requirements": [],
    "duration": 90,
    "position": "seated",
    "dose": {
      "kind": "reps",
      "reps": 10
    }
  },
  {
    "id": "scapula-working",
    "kind": "movement",
    "deckId": "scapula",
    "name": "Quadruped Scapular Press",
    "level": "working",
    "shortCue": "Press the floor away, then melt a little between the arms.",
    "movementGoal": "Serratus control in weight bearing",
    "points": 15,
    "art": "scapula-working",
    "unlockedByDefault": false,
    "requirements": [
      "Complete Scapular Glide at least once",
      "Build a sequence that includes the Scapula deck",
      "Complete that sequence"
    ],
    "duration": 105,
    "position": "quadruped",
    "dose": {
      "kind": "reps",
      "reps": 8
    }
  },
  {
    "id": "scapula-challenge",
    "kind": "movement",
    "deckId": "scapula",
    "name": "Plank Scapular Control",
    "level": "challenge",
    "shortCue": "Hold the plank while the shoulder blades stay wide and quiet.",
    "movementGoal": "Scapular stability under full load",
    "points": 20,
    "art": "scapula-challenge",
    "unlockedByDefault": false,
    "requirements": [
      "Unlock Quadruped Scapular Press",
      "Complete Quadruped Scapular Press at least once",
      "Complete the Steady Shoulders challenge"
    ],
    "duration": 120,
    "position": "prone",
    "dose": {
      "kind": "hold",
      "seconds": 30
    }
  },
  {
    "id": "core-foundation",
    "kind": "movement",
    "deckId": "core",
    "name": "Dead Bug",
    "level": "foundation",
    "shortCue": "Keep the ribs heavy as the opposite arm and leg travel away.",
    "movementGoal": "Rib and pelvis connection",
    "points": 10,
    "art": "core-foundation",
    "unlockedByDefault": true,
    "requirements": [],
    "duration": 90,
    "position": "supine",
    "dose": {
      "kind": "reps",
      "reps": 6,
      "perSide": true
    }
  },
  {
    "id": "core-working",
    "kind": "movement",
    "deckId": "core",
    "name": "Hundred Preparation",
    "level": "working",
    "shortCue": "Curl to the tips of the shoulder blades and breathe wide.",
    "movementGoal": "Sustained flexion with breath",
    "points": 15,
    "art": "core-working",
    "unlockedByDefault": false,
    "requirements": [
      "Complete Dead Bug at least once",
      "Build a sequence that includes the Core deck",
      "Complete that sequence"
    ],
    "duration": 105,
    "position": "supine",
    "dose": {
      "kind": "hold",
      "seconds": 40
    }
  },
  {
    "id": "core-challenge",
    "kind": "movement",
    "deckId": "core",
    "name": "Teaser Preparation",
    "level": "challenge",
    "shortCue": "Roll through the spine one bone at a time and find the balance point.",
    "movementGoal": "Articulated flexion and balance",
    "points": 20,
    "art": "core-challenge",
    "unlockedByDefault": false,
    "requirements": [
      "Unlock Hundred Preparation",
      "Complete Hundred Preparation at least once",
      "Complete the Centre Finder challenge"
    ],
    "duration": 120,
    "position": "supine",
    "dose": {
      "kind": "reps",
      "reps": 5
    }
  }
],
  specialCards: [
  {
    "id": "tr-roll-down",
    "kind": "transition",
    "name": "Roll Down to Floor",
    "shortCue": "Travel down one vertebra at a time, hands leading.",
    "movementGoal": "Spinal articulation between positions",
    "points": 5,
    "art": "transition-roll",
    "duration": 30,
    "from": [
      "standing"
    ],
    "to": [
      "supine",
      "seated"
    ]
  },
  {
    "id": "tr-bridge-side",
    "kind": "transition",
    "name": "Bridge to Side-Lying",
    "shortCue": "Lower with control, then roll to one side as one piece.",
    "movementGoal": "Changing base of support smoothly",
    "points": 5,
    "art": "transition-roll",
    "duration": 30,
    "from": [
      "supine"
    ],
    "to": [
      "side-lying"
    ]
  },
  {
    "id": "tr-roll-to-quadruped",
    "kind": "transition",
    "name": "Roll to Quadruped",
    "shortCue": "Roll to one side, press up, and arrive on all fours.",
    "movementGoal": "Floor-level position change",
    "points": 5,
    "art": "transition-turn",
    "duration": 30,
    "from": [
      "supine",
      "side-lying"
    ],
    "to": [
      "quadruped"
    ]
  },
  {
    "id": "tr-quad-prone",
    "kind": "transition",
    "name": "Quadruped to Prone",
    "shortCue": "Walk the hands forward and lower with the ribs staying long.",
    "movementGoal": "Loading the front of the body",
    "points": 5,
    "art": "transition-roll",
    "duration": 30,
    "from": [
      "quadruped"
    ],
    "to": [
      "prone"
    ]
  },
  {
    "id": "tr-quad-kneel",
    "kind": "transition",
    "name": "Quadruped to Side Kneeling",
    "shortCue": "Let the hips travel back and around, hands quiet.",
    "movementGoal": "Rotational transition on the floor",
    "points": 5,
    "art": "transition-turn",
    "duration": 30,
    "from": [
      "quadruped"
    ],
    "to": [
      "kneeling",
      "seated"
    ]
  },
  {
    "id": "tr-half-kneel-stand",
    "kind": "transition",
    "name": "Half-Kneel to Standing",
    "shortCue": "Weight over the front foot, then rise on an exhale.",
    "movementGoal": "Getting up with intention",
    "points": 5,
    "art": "transition-rise",
    "duration": 30,
    "from": [
      "kneeling"
    ],
    "to": [
      "standing"
    ]
  },
  {
    "id": "tr-seated-supine",
    "kind": "transition",
    "name": "Seated Roll Down",
    "shortCue": "Roll back through the spine until the shoulders reach the mat.",
    "movementGoal": "Sequential descent to the floor",
    "points": 5,
    "art": "transition-roll",
    "duration": 30,
    "from": [
      "seated"
    ],
    "to": [
      "supine"
    ]
  },
  {
    "id": "pr-narrow-support",
    "kind": "progression",
    "name": "Narrow Support",
    "shortCue": "Bring the base of support closer together.",
    "movementGoal": "More demand on balance and control",
    "points": 5,
    "art": "progression-narrow",
    "duration": 20,
    "effect": "Smaller base of support"
  },
  {
    "id": "pr-longer-lever",
    "kind": "progression",
    "name": "Longer Lever",
    "shortCue": "Reach the limb further away from its joint.",
    "movementGoal": "Increased load without added weight",
    "points": 5,
    "art": "progression-lever",
    "duration": 20,
    "effect": "More leverage at the joint"
  },
  {
    "id": "pr-add-load",
    "kind": "progression",
    "name": "Add Load",
    "shortCue": "Add a band, a weight, or something honest from the kitchen.",
    "movementGoal": "Strength adaptation",
    "points": 5,
    "art": "progression-load",
    "duration": 20,
    "effect": "External resistance"
  },
  {
    "id": "pr-slow-tempo",
    "kind": "progression",
    "name": "Slow Tempo",
    "shortCue": "Take twice as long in both directions.",
    "movementGoal": "Time under tension and precision",
    "points": 5,
    "art": "progression-tempo",
    "duration": 30,
    "effect": "Double the time"
  },
  {
    "id": "pr-add-balance",
    "kind": "progression",
    "name": "Add Balance",
    "shortCue": "Remove a point of contact, or soften the surface.",
    "movementGoal": "Reactive stability",
    "points": 5,
    "art": "progression-balance",
    "duration": 20,
    "effect": "Fewer points of contact"
  },
  {
    "id": "pr-add-coordination",
    "kind": "progression",
    "name": "Add Coordination",
    "shortCue": "Layer a second task — opposite limbs, breath count, eyes closed.",
    "movementGoal": "Motor planning under load",
    "points": 5,
    "art": "progression-coord",
    "duration": 20,
    "effect": "A second task on top"
  }
],
  challenges: [
  {
    "id": "first-build",
    "name": "First Build",
    "description": "Create your first sequence.",
    "detail": "Save any sequence in the Sequence Builder.",
    "trigger": "sequence-saved",
    "rule": {},
    "reward": {
      "points": 25,
      "badgeId": "first-build"
    },
    "packId": "core"
  },
  {
    "id": "flow-finder",
    "name": "Flow Finder",
    "description": "Use one Transition card.",
    "detail": "Complete a sequence containing at least one Transition card.",
    "trigger": "sequence-complete",
    "rule": {
      "minTransitions": 1
    },
    "reward": {
      "points": 25,
      "badgeId": "flow-finder"
    },
    "packId": "core"
  },
  {
    "id": "progressive-thinker",
    "name": "Progressive Thinker",
    "description": "Use one Progression card.",
    "detail": "Complete a sequence containing at least one Progression card.",
    "trigger": "sequence-complete",
    "rule": {
      "minProgressions": 1
    },
    "reward": {
      "points": 25,
      "badgeId": "progressive-thinker"
    },
    "packId": "core"
  },
  {
    "id": "full-practice",
    "name": "Full Practice",
    "description": "Complete a sequence containing Bridging + Scapula + Core.",
    "detail": "All three starting decks, completed in one build.",
    "trigger": "sequence-complete",
    "rule": {
      "requiredDeckIds": [
        "bridging",
        "scapula",
        "core"
      ]
    },
    "reward": {
      "points": 60,
      "badgeId": "full-practice",
      "themeId": "witchy-autumn"
    },
    "packId": "core"
  },
  {
    "id": "remix",
    "name": "Remix",
    "description": "Replay a saved sequence after changing at least two cards.",
    "detail": "Edit a completed build — swap, add or remove two cards — then complete it again.",
    "trigger": "remix",
    "rule": {},
    "reward": {
      "points": 40,
      "badgeId": "remix"
    },
    "packId": "core"
  },
  {
    "id": "bridge-builder",
    "name": "Bridge Builder",
    "description": "Complete Bridge, Bridge March and one Progression card in one sequence.",
    "detail": "Reward: unlocks Single-Leg Bridge.",
    "trigger": "sequence-complete",
    "rule": {
      "requiredCardIds": [
        "bridge-foundation",
        "bridge-working"
      ],
      "minProgressions": 1
    },
    "reward": {
      "points": 50,
      "badgeId": "bridge-builder",
      "unlocksCardId": "bridge-challenge"
    },
    "packId": "core"
  },
  {
    "id": "steady-shoulders",
    "name": "Steady Shoulders",
    "description": "Complete Scapular Glide, Quadruped Scapular Press and one Transition card in one sequence.",
    "detail": "Reward: unlocks Plank Scapular Control.",
    "trigger": "sequence-complete",
    "rule": {
      "requiredCardIds": [
        "scapula-foundation",
        "scapula-working"
      ],
      "minTransitions": 1
    },
    "reward": {
      "points": 50,
      "badgeId": "steady-shoulders",
      "unlocksCardId": "scapula-challenge"
    },
    "packId": "core"
  },
  {
    "id": "centre-finder",
    "name": "Centre Finder",
    "description": "Complete Dead Bug, Hundred Preparation and one Progression card in one sequence.",
    "detail": "Reward: unlocks Teaser Preparation.",
    "trigger": "sequence-complete",
    "rule": {
      "requiredCardIds": [
        "core-foundation",
        "core-working"
      ],
      "minProgressions": 1
    },
    "reward": {
      "points": 50,
      "badgeId": "centre-finder",
      "unlocksCardId": "core-challenge"
    },
    "packId": "core"
  }
],
  themes: [
  {
    "id": "watercolor-botanical",
    "name": "Watercolour Botanical",
    "description": "Warm ivory paper, muted sage, forest green and antique gold. The default field guide.",
    "packId": "core",
    "unlockedByDefault": true,
    "vars": {
      "--paper": "#F5EEDF",
      "--paper-deep": "#EBE1CC",
      "--paper-card": "#FBF6EA",
      "--ink": "#2B2A24",
      "--ink-soft": "#6B6455",
      "--ink-faint": "#9A9280",
      "--line": "#C9BCA0",
      "--forest": "#2F4A3C",
      "--sage": "#8CA189",
      "--dusty-blue": "#5F7C93",
      "--aubergine": "#5A3550",
      "--gold": "#B48A3E",
      "--gold-soft": "#DCC489",
      "--wash-a": "rgba(140,161,137,0.30)",
      "--wash-b": "rgba(95,124,147,0.24)",
      "--wash-c": "rgba(180,138,62,0.20)",
      "--rail": "#F0E7D4",
      "--shadow": "rgba(63,52,32,0.20)",
      "--glow": "rgba(180,138,62,0.55)",
      "--grain-opacity": "0.32",
      "--moon": "☾"
    }
  },
  {
    "id": "witchy-autumn",
    "name": "Witchy Autumn",
    "description": "Midnight navy and aubergine, pressed herbs, tiny moons and candlelight. Same movement, different weather.",
    "packId": "core",
    "unlockedByDefault": false,
    "vars": {
      "--paper": "#161A2A",
      "--paper-deep": "#10131F",
      "--paper-card": "#1E2337",
      "--ink": "#EDE4D0",
      "--ink-soft": "#B6AC96",
      "--ink-faint": "#7C7460",
      "--line": "#3C4360",
      "--forest": "#7FA98C",
      "--sage": "#8FA79A",
      "--dusty-blue": "#8AA8C6",
      "--aubergine": "#B08AC0",
      "--gold": "#D9B25F",
      "--gold-soft": "#7A6330",
      "--wash-a": "rgba(127,169,140,0.26)",
      "--wash-b": "rgba(138,168,198,0.22)",
      "--wash-c": "rgba(176,138,192,0.26)",
      "--rail": "#1A1F31",
      "--shadow": "rgba(0,0,0,0.55)",
      "--glow": "rgba(217,178,95,0.65)",
      "--grain-opacity": "0.22",
      "--moon": "☽"
    }
  }
],
  regions: [
  {
    "id": "center-balance",
    "name": "Center & Balance",
    "subtitle": "Stability · Awareness · Return Home",
    "accentVar": "--forest",
    "packId": "core",
    "nodes": [
      {
        "id": "tripod-foot",
        "label": "Tripod Foot",
        "x": 22,
        "y": 26,
        "cardId": "balance-foundation",
        "deckId": "standing-balance",
        "note": "The three points of the foot. Arrives with Balance & Longevity."
      },
      {
        "id": "weight-shift",
        "label": "Weight Shift",
        "x": 62,
        "y": 20,
        "cardId": "balance-working",
        "deckId": "standing-balance",
        "note": "Travelling weight without collapsing a hip."
      },
      {
        "id": "heel-raise",
        "label": "Heel Raise",
        "x": 76,
        "y": 58,
        "cardId": "balance-challenge",
        "deckId": "standing-balance",
        "note": "Rising through the whole foot and staying there."
      },
      {
        "id": "balance",
        "label": "Balance",
        "x": 36,
        "y": 70,
        "concept": true,
        "note": "Not a single exercise — the thread running through the whole region."
      }
    ],
    "links": [
      [
        "tripod-foot",
        "weight-shift"
      ],
      [
        "weight-shift",
        "heel-raise"
      ],
      [
        "tripod-foot",
        "balance"
      ],
      [
        "balance",
        "heel-raise"
      ]
    ]
  },
  {
    "id": "core-concepts",
    "name": "Core Concepts",
    "subtitle": "Build Understanding · Move Better",
    "accentVar": "--aubergine",
    "packId": "core",
    "nodes": [
      {
        "id": "breath",
        "label": "Breath",
        "x": 20,
        "y": 24,
        "concept": true,
        "note": "Where every deck starts. Ribs wide, back and low."
      },
      {
        "id": "rib-pelvis",
        "label": "Rib / Pelvis Stack",
        "x": 60,
        "y": 22,
        "concept": true,
        "note": "The relationship the Core deck keeps returning to."
      },
      {
        "id": "dead-bug",
        "label": "Dead Bug",
        "x": 32,
        "y": 66,
        "cardId": "core-foundation",
        "deckId": "core",
        "note": "The foundation card of the Core deck."
      },
      {
        "id": "hip-dissociation",
        "label": "Hip Dissociation",
        "x": 74,
        "y": 62,
        "cardId": "core-working",
        "deckId": "core",
        "note": "Legs moving while the centre stays quiet."
      }
    ],
    "links": [
      [
        "breath",
        "rib-pelvis"
      ],
      [
        "breath",
        "dead-bug"
      ],
      [
        "rib-pelvis",
        "dead-bug"
      ],
      [
        "dead-bug",
        "hip-dissociation"
      ]
    ]
  },
  {
    "id": "strength-support",
    "name": "Strength & Support",
    "subtitle": "Confidence · Function · Go Further",
    "accentVar": "--dusty-blue",
    "packId": "core",
    "nodes": [
      {
        "id": "bridge",
        "label": "Bridge",
        "x": 24,
        "y": 28,
        "cardId": "bridge-foundation",
        "deckId": "bridging",
        "note": "The foundation card of the Bridging deck."
      },
      {
        "id": "scapular-support",
        "label": "Scapular Support",
        "x": 68,
        "y": 24,
        "cardId": "scapula-foundation",
        "deckId": "scapula",
        "note": "The foundation card of the Scapula deck."
      },
      {
        "id": "hinge",
        "label": "Hinge",
        "x": 30,
        "y": 70,
        "cardId": "bridge-working",
        "deckId": "bridging",
        "note": "Hip-led loading. Opens up through the Bridging deck."
      },
      {
        "id": "floor-rise",
        "label": "Floor Rise",
        "x": 74,
        "y": 68,
        "cardId": "rise-foundation",
        "deckId": "floor-rise",
        "note": "Down and up again. Arrives with Balance & Longevity."
      }
    ],
    "links": [
      [
        "bridge",
        "scapular-support"
      ],
      [
        "bridge",
        "hinge"
      ],
      [
        "scapular-support",
        "floor-rise"
      ],
      [
        "hinge",
        "floor-rise"
      ]
    ]
  }
]
};
