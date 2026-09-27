import type { Badge, Milestone, Theme } from './types';

export const RULES = {
  maxSteps: 12,
  maxProgressionsPerCard: 2,
  /** Five or more steps across all three paths is a Full Practice. */
  fullPractice: 5
} as const;

export const badges: Badge[] = [
  { id: 'first-flow', name: 'First Flow', glyph: '✦', description: 'Saved a first Sequence.' },
  { id: 'curtain-call', name: 'Curtain Call', glyph: '☾', description: 'Performed a Sequence all the way through.' },
  { id: 'flow-finder', name: 'Flow Finder', glyph: '≈', description: 'Bridged a change of position with a transition.' },
  { id: 'progressive-thinker', name: 'Progressive Thinker', glyph: '⌃', description: 'Changed a movement with a progression.' },
  { id: 'curator', name: 'Curator', glyph: '❏', description: 'Made a Repertoire deck of your own.' },
  { id: 'full-practice', name: 'Full Practice', glyph: '❋', description: 'All three paths in one performed Sequence.' },
  { id: 'remix', name: 'Remix', glyph: '↻', description: 'Changed a finished Sequence and performed it again.' },
  { id: 'in-the-queue', name: 'In the Queue', glyph: '❀', description: 'Shared a Sequence with the community.' },
  { id: 'bridge-builder', name: 'Bridge Builder', glyph: '⌒', description: 'Learned every Technique on the Bridging path.' },
  { id: 'centre-finder', name: 'Centre Finder', glyph: '◉', description: 'Learned every Technique on the Core path.' },
  { id: 'steady-shoulders', name: 'Steady Shoulders', glyph: '⋀', description: 'Learned every Technique on the Shoulders path.' }
];

/** Milestones: what earns each badge. Checked when the trigger happens. */
export const milestones: Milestone[] = [
  { id: 'first-flow', name: 'First Flow', description: 'Save any Sequence.', trigger: 'sequence-saved', rule: {}, reward: { badgeId: 'first-flow', points: 10 } },
  { id: 'curtain-call', name: 'Curtain Call', description: 'Complete a Sequence in Play Mode.', trigger: 'sequence-complete', rule: {}, reward: { badgeId: 'curtain-call', points: 10 } },
  { id: 'flow-finder', name: 'Flow Finder', description: 'Complete a Sequence with a transition in it.', trigger: 'sequence-complete', rule: { minTransitions: 1 }, reward: { badgeId: 'flow-finder', points: 10 } },
  { id: 'progressive-thinker', name: 'Progressive Thinker', description: 'Complete a Sequence with a progression attached.', trigger: 'sequence-complete', rule: { minProgressions: 1 }, reward: { badgeId: 'progressive-thinker', points: 10 } },
  { id: 'curator', name: 'Curator', description: 'Make a second deck in your Repertoire.', trigger: 'deck-made', rule: {}, reward: { badgeId: 'curator', points: 5 } },
  { id: 'full-practice', name: 'Full Practice', description: 'Complete a Sequence using Bridging, Core and Shoulders.', trigger: 'sequence-complete', rule: { requiredPathIds: ['bridging', 'core', 'shoulders'] }, reward: { badgeId: 'full-practice', points: 20, themeId: 'witchy-autumn' } },
  { id: 'remix', name: 'Remix', description: 'Change two cards in a finished Sequence, then perform it again.', trigger: 'remix', rule: {}, reward: { badgeId: 'remix', points: 10 } },
  { id: 'in-the-queue', name: 'In the Queue', description: 'Publish a Sequence to In the Queue.', trigger: 'published', rule: {}, reward: { badgeId: 'in-the-queue', points: 5 } },
  { id: 'bridge-builder', name: 'Bridge Builder', description: 'Learn every Technique on the Bridging path.', trigger: 'technique', rule: { masterPath: 'bridging' }, reward: { badgeId: 'bridge-builder', points: 25 } },
  { id: 'centre-finder', name: 'Centre Finder', description: 'Learn every Technique on the Core path.', trigger: 'technique', rule: { masterPath: 'core' }, reward: { badgeId: 'centre-finder', points: 25 } },
  { id: 'steady-shoulders', name: 'Steady Shoulders', description: 'Learn every Technique on the Shoulders path.', trigger: 'technique', rule: { masterPath: 'shoulders' }, reward: { badgeId: 'steady-shoulders', points: 25 } }
];

export const themes: Theme[] = [
  {
    id: 'watercolor-botanical',
    name: 'Watercolour Botanical',
    description: 'Warm ivory paper, muted sage, forest green and antique gold.',
    unlockedByDefault: true,
    vars: {
      '--paper': '#F5EEDF', '--paper-deep': '#EBE1CC', '--paper-card': '#FBF6EA', '--ink': '#2B2A24', '--ink-soft': '#6B6455', '--ink-faint': '#9A9280',
      '--line': '#C9BCA0', '--forest': '#2F4A3C', '--sage': '#8CA189', '--dusty-blue': '#5F7C93', '--aubergine': '#5A3550', '--gold': '#B48A3E', '--gold-soft': '#DCC489',
      '--wash-a': 'rgba(140,161,137,0.30)', '--wash-b': 'rgba(95,124,147,0.24)', '--wash-c': 'rgba(180,138,62,0.20)', '--rail': '#F0E7D4',
      '--shadow': 'rgba(63,52,32,0.20)', '--glow': 'rgba(180,138,62,0.55)', '--grain-opacity': '0.32'
    }
  },
  {
    id: 'witchy-autumn',
    name: 'Witchy Autumn',
    description: 'Midnight navy and aubergine, pressed herbs and candlelight. Same movement, different weather.',
    unlockedByDefault: false,
    vars: {
      '--paper': '#161A2A', '--paper-deep': '#10131F', '--paper-card': '#1E2337', '--ink': '#EDE4D0', '--ink-soft': '#B6AC96', '--ink-faint': '#7C7460',
      '--line': '#3C4360', '--forest': '#7FA98C', '--sage': '#8FA79A', '--dusty-blue': '#8AA8C6', '--aubergine': '#B08AC0', '--gold': '#D9B25F', '--gold-soft': '#7A6330',
      '--wash-a': 'rgba(127,169,140,0.26)', '--wash-b': 'rgba(138,168,198,0.22)', '--wash-c': 'rgba(176,138,192,0.26)', '--rail': '#1A1F31',
      '--shadow': 'rgba(0,0,0,0.55)', '--glow': 'rgba(217,178,95,0.65)', '--grain-opacity': '0.22'
    }
  }
];
