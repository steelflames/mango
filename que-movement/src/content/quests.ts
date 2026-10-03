// Daily Quests: small asks, on the mat and off it. Clear one and another is drawn from the
// types you've switched on. Rewards are fixed and shown up front; only which quest comes next
// is left to chance. Presets choose types and wording, never make health claims.

/** Things that happen in the game and can clear an in-app quest. */
export type QuestEvent = 'perform' | 'harmony-3' | 'counterpose' | 'arrive-settle' | 'transition' | 'five-cards' | 'queue-try' | 'save' | 'learn' | 'studio' | 'send' | 'bridge';

export type QuestType = 'practice' | 'stretch' | 'massage' | 'walk' | 'breath' | 'posture' | 'water';
export type Preset = 'everything' | 'office' | 'low-back' | 'scoliosis' | 'gentle';

export interface QuestTemplate {
  id: string;
  type: QuestType;
  text: string;
  points: number;
  /** In-app quests clear themselves when this happens; off-mat quests are ticked by you. */
  event?: QuestEvent;
  presets: Preset[];
}

export const QUEST_TYPES: { id: QuestType; label: string; glyph: string }[] = [
  { id: 'practice', label: 'Practice', glyph: '✦' },
  { id: 'stretch', label: 'Stretch', glyph: '∿' },
  { id: 'massage', label: 'Self-massage', glyph: '❀' },
  { id: 'walk', label: 'Walks', glyph: '⌁' },
  { id: 'breath', label: 'Breath', glyph: '☾' },
  { id: 'posture', label: 'Posture breaks', glyph: '⋀' },
  { id: 'water', label: 'Water', glyph: '◌' }
];

export const PRESETS: { id: Preset; label: string; about: string; types: QuestType[]; count: number }[] = [
  { id: 'everything', label: 'Everything', about: 'A bit of all of it.', types: ['practice', 'stretch', 'massage', 'walk', 'breath', 'posture', 'water'], count: 3 },
  { id: 'office', label: 'Office Worker', about: 'Breaks from the chair, the screen and the shoulders-up-to-the-ears.', types: ['practice', 'stretch', 'walk', 'breath', 'posture', 'water'], count: 4 },
  { id: 'low-back', label: 'Low Back Health', about: 'Walking, hips and gentle movement through the day.', types: ['practice', 'stretch', 'walk', 'breath', 'posture'], count: 3 },
  { id: 'scoliosis', label: 'Scoliosis-Friendly', about: 'Breath into both sides, side-body length, and a walk.', types: ['practice', 'stretch', 'breath', 'walk', 'massage'], count: 3 },
  { id: 'gentle', label: 'Gentle Days', about: 'Kind, small and restful.', types: ['breath', 'walk', 'massage', 'water', 'practice'], count: 2 }
];

const ALL: Preset[] = ['everything', 'office', 'low-back', 'scoliosis', 'gentle'];

export const QUESTS: QuestTemplate[] = [
  { id: 'q-perform', type: 'practice', text: 'Perform any Sequence, all the way through.', points: 15, event: 'perform', presets: ALL },
  { id: 'q-harmony-3', type: 'practice', text: 'Perform a Sequence with three Harmonies or more.', points: 15, event: 'harmony-3', presets: ['everything', 'office', 'low-back', 'scoliosis'] },
  { id: 'q-counterpose', type: 'practice', text: 'Earn the Counterpose Harmony.', points: 20, event: 'counterpose', presets: ['everything', 'office'] },
  { id: 'q-arrive-settle', type: 'practice', text: 'Earn Arrive and Settle in the same Sequence.', points: 20, event: 'arrive-settle', presets: ['everything', 'gentle', 'scoliosis'] },
  { id: 'q-transition', type: 'practice', text: 'Perform a Sequence that bridges a change of position.', points: 15, event: 'transition', presets: ['everything', 'low-back'] },
  { id: 'q-bridge', type: 'practice', text: 'Perform a Sequence with a Bridge in it.', points: 15, event: 'bridge', presets: ['low-back', 'office'] },
  { id: 'q-learn', type: 'practice', text: 'Learn a new Technique.', points: 15, event: 'learn', presets: ['everything'] },
  { id: 'q-queue', type: 'practice', text: 'Try someone else’s Sequence from In the Queue.', points: 10, event: 'queue-try', presets: ['everything', 'gentle'] },
  { id: 'q-send', type: 'practice', text: 'Send a Sequence to a client.', points: 15, event: 'send', presets: ['everything'] },

  { id: 'q-chest', type: 'stretch', text: 'Doorway chest stretch: three slow breaths on each side.', points: 10, presets: ['everything', 'office'] },
  { id: 'q-neck', type: 'stretch', text: 'Ear towards shoulder, five easy breaths on each side.', points: 10, presets: ['everything', 'office', 'gentle'] },
  { id: 'q-hipflexor', type: 'stretch', text: 'Kneeling hip-flexor stretch, 30 seconds on each side.', points: 10, presets: ['everything', 'office', 'low-back'] },
  { id: 'q-hamstring', type: 'stretch', text: 'Hamstring stretch lying on your back, with a strap or towel.', points: 10, presets: ['low-back', 'everything'] },
  { id: 'q-sidebody', type: 'stretch', text: 'Side-body reach: arm long, lean gently, five breaths on each side.', points: 10, presets: ['scoliosis', 'everything', 'office'] },
  { id: 'q-catcow', type: 'stretch', text: 'Eight slow rounds of cat and cow.', points: 10, presets: ['low-back', 'scoliosis', 'gentle', 'everything'] },

  { id: 'q-feet', type: 'massage', text: 'Roll each foot over a ball for a minute.', points: 10, presets: ['everything', 'gentle', 'office'] },
  { id: 'q-jaw', type: 'massage', text: 'Two minutes easing your jaw and temples with your fingertips.', points: 10, presets: ['everything', 'office', 'gentle'] },
  { id: 'q-upperback', type: 'massage', text: 'Upper back over a rolled towel or foam roller, two minutes.', points: 10, presets: ['everything', 'scoliosis', 'office'] },

  { id: 'q-walk10', type: 'walk', text: 'A ten-minute walk. Leave the phone in your pocket.', points: 10, presets: ALL },
  { id: 'q-walklunch', type: 'walk', text: 'A walk after a meal, even five minutes.', points: 10, presets: ['office', 'low-back', 'everything'] },
  { id: 'q-stairs', type: 'walk', text: 'Take the stairs once today.', points: 10, presets: ['office', 'everything'] },

  { id: 'q-lateral', type: 'breath', text: 'Three minutes of wide, lateral breathing.', points: 10, presets: ALL },
  { id: 'q-box', type: 'breath', text: 'Four rounds of box breathing: in 4, hold 4, out 4, hold 4.', points: 10, presets: ['office', 'gentle', 'everything'] },
  { id: 'q-oneside', type: 'breath', text: 'Five breaths into the side that feels more closed.', points: 10, presets: ['scoliosis'] },

  { id: 'q-reset', type: 'posture', text: 'Stand up and reset once an hour, three times today.', points: 10, presets: ['office', 'low-back', 'everything'] },
  { id: 'q-screen', type: 'posture', text: 'Check your desk: screen at eye height, feet on the floor.', points: 10, presets: ['office'] },
  { id: 'q-tall', type: 'posture', text: 'Sit tall without leaning back for the length of one song.', points: 10, presets: ['office', 'scoliosis', 'everything'] },

  { id: 'q-water', type: 'water', text: 'Drink a full glass of water.', points: 5, presets: ['office', 'gentle', 'everything'] }
];

export const questById = (id: string) => QUESTS.find((q) => q.id === id);

/** How many quest clears a day pay points. After that they keep coming, for the joy of it. */
export const PAID_CLEARS_PER_DAY = 6;

/** Draw a quest from the enabled types and preset, avoiding ones already showing. */
export function drawQuest(types: QuestType[], preset: Preset, exclude: string[]): string | null {
  const pool = QUESTS.filter((q) => types.includes(q.type) && q.presets.includes(preset) && !exclude.includes(q.id));
  const fallback = QUESTS.filter((q) => types.includes(q.type) && !exclude.includes(q.id));
  const from = pool.length ? pool : fallback;
  return from.length ? from[Math.floor(Math.random() * from.length)].id : null;
}
