import type { Branch, MovementCard, Path, SpecialCard } from './types';

// Mat Fundamentals: the first Technique branch. Three paths grow out of Breath.
// Pure data. Positions on the tree are % of the canvas; see TechniqueScreen.

export const paths: Path[] = [
  {
    id: 'bridging',
    name: 'Bridging',
    tagline: 'Lift · Connect · Flow',
    description: 'The back of the body waking up. Hip extension, trunk organisation, and lifting without gripping.',
    accentVar: '--forest'
  },
  {
    id: 'core',
    name: 'Core',
    tagline: 'Build · Integrate · Ground',
    description: 'Ribs and pelvis learning to talk to each other. Breath first, then load, then articulation.',
    accentVar: '--aubergine'
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    tagline: 'Stabilise · Strengthen · Move Freely',
    description: 'Shoulder blades that glide and settle. Support for everything done on the hands.',
    accentVar: '--dusty-blue'
  }
];

const mv = (c: Omit<MovementCard, 'kind' | 'points' | 'duration'>): MovementCard => ({
  kind: 'movement',
  points: c.level === 'foundation' ? 10 : c.level === 'working' ? 15 : 20,
  duration: 0,
  ...c
});

export const movementCards: MovementCard[] = [
  mv({ id: 'breathing', pathId: 'core', level: 'foundation', name: 'Supine Breathing', art: 'breathing', position: 'supine',
    dose: { kind: 'reps', reps: 6 }, shortCue: 'Breathe wide into the back of the ribs; let the exhale settle them home.', movementGoal: 'Lateral breath and a quiet, heavy ribcage' }),

  mv({ id: 'bridge', pathId: 'bridging', level: 'foundation', name: 'Bridge', art: 'bridge', position: 'supine',
    dose: { kind: 'reps', reps: 8 }, shortCue: 'Reach the knees away and lift from the backs of the legs.', movementGoal: 'Hip extension and trunk organisation' }),
  mv({ id: 'bridge-march', pathId: 'bridging', level: 'working', name: 'Bridge March', art: 'bridge-march', position: 'supine',
    dose: { kind: 'reps', reps: 6, perSide: true }, shortCue: 'Keep the pelvis level as one foot quietly floats.', movementGoal: 'Pelvic stability under changing load' }),
  mv({ id: 'clam', pathId: 'bridging', level: 'foundation', name: 'Side-Lying Clam', art: 'clam', position: 'side-lying',
    dose: { kind: 'reps', reps: 10, perSide: true }, shortCue: 'Feet stay together; the top knee opens like a book.', movementGoal: 'Hip rotation with a still pelvis' }),
  mv({ id: 'single-leg-bridge', pathId: 'bridging', level: 'challenge', name: 'Single-Leg Bridge', art: 'single-leg-bridge', position: 'supine',
    dose: { kind: 'reps', reps: 5, perSide: true }, shortCue: 'Lift from the standing leg without letting the opposite hip drop.', movementGoal: 'Single-leg hip extension with control' }),

  mv({ id: 'dead-bug', pathId: 'core', level: 'foundation', name: 'Dead Bug', art: 'dead-bug', position: 'supine',
    dose: { kind: 'reps', reps: 6, perSide: true }, shortCue: 'Keep the ribs heavy as the opposite arm and leg travel away.', movementGoal: 'Rib and pelvis connection' }),
  mv({ id: 'toe-taps', pathId: 'core', level: 'foundation', name: 'Toe Taps', art: 'toe-taps', position: 'supine',
    dose: { kind: 'reps', reps: 8, perSide: true }, shortCue: 'From tabletop, lower one foot to kiss the mat. The back stays quiet.', movementGoal: 'Hip dissociation from a steady centre' }),
  mv({ id: 'hundred-prep', pathId: 'core', level: 'working', name: 'Hundred Preparation', art: 'hundred-prep', position: 'supine',
    dose: { kind: 'hold', seconds: 40 }, shortCue: 'Curl to the tips of the shoulder blades and pulse the arms with the breath.', movementGoal: 'Sustained flexion with breath' }),
  mv({ id: 'roll-up', pathId: 'core', level: 'working', name: 'Roll Up', art: 'roll-up', position: 'supine',
    dose: { kind: 'reps', reps: 5 }, shortCue: 'Peel up one bone at a time, reach past the feet, then roll home.', movementGoal: 'Spinal articulation in flexion' }),
  mv({ id: 'teaser-prep', pathId: 'core', level: 'challenge', name: 'Teaser Preparation', art: 'teaser-prep', position: 'supine',
    dose: { kind: 'reps', reps: 5 }, shortCue: 'Roll through the spine and find the balance point behind the sit bones.', movementGoal: 'Articulated flexion and balance' }),

  mv({ id: 'scapular-glide', pathId: 'shoulders', level: 'foundation', name: 'Scapular Glide', art: 'scapular-glide', position: 'seated',
    dose: { kind: 'reps', reps: 10 }, shortCue: 'Let the shoulder blades slide wide, then gather them home.', movementGoal: 'Scapular mobility and awareness' }),
  mv({ id: 'quad-press', pathId: 'shoulders', level: 'working', name: 'Quadruped Scapular Press', art: 'quad-press', position: 'quadruped',
    dose: { kind: 'reps', reps: 8 }, shortCue: 'Press the floor away, then melt a little between the arms.', movementGoal: 'Serratus control in weight bearing' }),
  mv({ id: 'bird-dog', pathId: 'shoulders', level: 'working', name: 'Bird Dog', art: 'bird-dog', position: 'quadruped',
    dose: { kind: 'reps', reps: 6, perSide: true }, shortCue: 'Reach long through opposite hand and heel. The water glass on your back stays full.', movementGoal: 'Cross-body stability on a narrow base' }),
  mv({ id: 'swan-prep', pathId: 'shoulders', level: 'working', name: 'Swan Preparation', art: 'swan-prep', position: 'prone',
    dose: { kind: 'reps', reps: 6 }, shortCue: 'Slide the shoulder blades down and let the chest glide forward and up.', movementGoal: 'Upper-back extension without pinching' }),
  mv({ id: 'plank-control', pathId: 'shoulders', level: 'challenge', name: 'Plank Scapular Control', art: 'plank-control', position: 'prone',
    dose: { kind: 'hold', seconds: 30 }, shortCue: 'Hold the plank while the shoulder blades stay wide and quiet.', movementGoal: 'Scapular stability under full load' })
];

export const specialCards: SpecialCard[] = [
  { id: 'tr-seated-supine', kind: 'transition', name: 'Seated Roll Down', art: 'transition-roll', points: 5, duration: 30, from: ['seated'], to: ['supine'],
    shortCue: 'Roll back through the spine until the shoulders reach the mat.', movementGoal: 'Sequential descent to the floor' },
  { id: 'tr-supine-side', kind: 'transition', name: 'Log Roll to Side', art: 'transition-roll', points: 5, duration: 25, from: ['supine'], to: ['side-lying'],
    shortCue: 'Lower with control, then roll to one side as one piece.', movementGoal: 'Changing base of support smoothly' },
  { id: 'tr-roll-to-quadruped', kind: 'transition', name: 'Roll to Quadruped', art: 'transition-turn', points: 5, duration: 30, from: ['supine', 'side-lying'], to: ['quadruped'],
    shortCue: 'Roll to one side, press up, and arrive on all fours.', movementGoal: 'Floor-level position change' },
  { id: 'tr-quad-prone', kind: 'transition', name: 'Quadruped to Prone', art: 'transition-roll', points: 5, duration: 25, from: ['quadruped'], to: ['prone'],
    shortCue: 'Walk the hands forward and lower with the ribs staying long.', movementGoal: 'Loading the front of the body' },
  { id: 'tr-quad-seated', kind: 'transition', name: 'Quadruped to Seated', art: 'transition-turn', points: 5, duration: 25, from: ['quadruped'], to: ['seated', 'kneeling'],
    shortCue: 'Let the hips travel back and around, hands quiet.', movementGoal: 'Rotational transition on the floor' },

  { id: 'pr-slow-tempo', kind: 'progression', pathId: 'core', name: 'Slow Tempo', art: 'progression-tempo', points: 5, duration: 0, effect: 'Double the time',
    shortCue: 'Take twice as long in both directions.', movementGoal: 'Time under tension and precision' },
  { id: 'pr-longer-lever', kind: 'progression', pathId: 'bridging', name: 'Longer Lever', art: 'progression-lever', points: 5, duration: 20, effect: 'More leverage at the joint',
    shortCue: 'Reach the limb further away from its joint.', movementGoal: 'Increased load without added weight' },
  { id: 'pr-add-coordination', kind: 'progression', pathId: 'shoulders', name: 'Add Coordination', art: 'progression-coord', points: 5, duration: 20, effect: 'A second task on top',
    shortCue: 'Layer a second task: opposite limbs, a breath count, eyes closed.', movementGoal: 'Motor planning under load' }
];

/** Transitions are connective tissue: every Repertoire has them from the start. */
export const STARTER_TRANSITIONS = specialCards.filter((c) => c.kind === 'transition').map((c) => c.id);

export const branch: Branch = {
  id: 'mat-fundamentals',
  name: 'Mat Fundamentals',
  subtitle: 'Breath first. Then three ways to grow from it.',
  nodes: [
    { id: 'n-breath', cardId: 'breathing', pathId: 'core', x: 3, y: 49, cost: 0, requires: [], note: 'Where every path begins.' },

    { id: 'n-bridge', cardId: 'bridge', pathId: 'bridging', x: 23, y: 13, cost: 0, requires: ['n-breath'], note: 'The first lift.' },
    { id: 'n-bridge-march', cardId: 'bridge-march', pathId: 'bridging', x: 44, y: 4, cost: 30, requires: ['n-bridge'], note: 'The bridge, with one foot floating.' },
    { id: 'n-clam', cardId: 'clam', pathId: 'bridging', x: 44, y: 22, cost: 25, requires: ['n-bridge'], note: 'Hips from a new angle.' },
    { id: 'n-longer-lever', cardId: 'pr-longer-lever', pathId: 'bridging', x: 65, y: 4, cost: 35, requires: ['n-bridge-march'], note: 'A progression: longer limbs, more load.' },
    { id: 'n-single-leg-bridge', cardId: 'single-leg-bridge', pathId: 'bridging', x: 86, y: 13, cost: 75, requires: ['n-bridge-march', 'n-clam'], note: 'Everything the path has taught, on one leg.' },

    { id: 'n-dead-bug', cardId: 'dead-bug', pathId: 'core', x: 23, y: 49, cost: 0, requires: ['n-breath'], note: 'Ribs heavy, limbs travelling.' },
    { id: 'n-slow-tempo', cardId: 'pr-slow-tempo', pathId: 'core', x: 44, y: 58, cost: 20, requires: ['n-dead-bug'], note: 'A progression: the same work, twice as slow.' },
    { id: 'n-toe-taps', cardId: 'toe-taps', pathId: 'core', x: 44, y: 40, cost: 25, requires: ['n-dead-bug'], note: 'Legs move; the centre stays.' },
    { id: 'n-hundred-prep', cardId: 'hundred-prep', pathId: 'core', x: 65, y: 31, cost: 45, requires: ['n-toe-taps'], note: 'Flexion with breath.' },
    { id: 'n-roll-up', cardId: 'roll-up', pathId: 'core', x: 65, y: 49, cost: 50, requires: ['n-toe-taps'], note: 'The spine, one bone at a time.' },
    { id: 'n-teaser-prep', cardId: 'teaser-prep', pathId: 'core', x: 86, y: 40, cost: 90, requires: ['n-hundred-prep', 'n-roll-up'], note: 'Articulation meets balance.' },

    { id: 'n-scapular-glide', cardId: 'scapular-glide', pathId: 'shoulders', x: 23, y: 85, cost: 0, requires: ['n-breath'], note: 'Shoulder blades that glide.' },
    { id: 'n-quad-press', cardId: 'quad-press', pathId: 'shoulders', x: 44, y: 76, cost: 25, requires: ['n-scapular-glide'], note: 'Onto the hands.' },
    { id: 'n-swan-prep', cardId: 'swan-prep', pathId: 'shoulders', x: 44, y: 94, cost: 40, requires: ['n-scapular-glide'], note: 'Extension, led by the upper back.' },
    { id: 'n-bird-dog', cardId: 'bird-dog', pathId: 'shoulders', x: 65, y: 76, cost: 40, requires: ['n-quad-press'], note: 'Reach long, stay level.' },
    { id: 'n-coordination', cardId: 'pr-add-coordination', pathId: 'shoulders', x: 86, y: 94, cost: 35, requires: ['n-bird-dog'], note: 'A progression: a second task on top.' },
    { id: 'n-plank-control', cardId: 'plank-control', pathId: 'shoulders', x: 86, y: 76, cost: 80, requires: ['n-quad-press', 'n-bird-dog'], note: 'The whole shoulder girdle, fully loaded.' }
  ]
};
