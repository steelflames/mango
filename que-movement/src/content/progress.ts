// Practice Rank and Daily Intentions: the long rhythm of the game.
// Everything here is deterministic and shown before it's earned. No gacha, no guilt.

/** Lifetime points needed to reach each rank (index 0 is rank 1). */
export const RANK_XP = [0, 60, 150, 280, 450, 660, 910, 1200, 1530, 1900, 2310, 2760, 3250, 3780, 4350];
export const MAX_RANK = RANK_XP.length;

/** Points given when a rank is claimed. */
export const rankGift = (rank: number) => 10 + rank * 5;

export type IntentionEvent =
  | 'perform' | 'harmony-3' | 'counterpose' | 'arrive-settle' | 'transition' | 'five-cards'
  | 'queue-try' | 'save' | 'learn' | 'studio' | 'send';

export interface Intention {
  id: IntentionEvent;
  text: string;
  tier: 0 | 1 | 2;
  points: number;
}

export const INTENTIONS: Intention[] = [
  { id: 'perform', text: 'Perform any Sequence, all the way through.', tier: 0, points: 10 },
  { id: 'save', text: 'Save a new Sequence, or improve an old one.', tier: 0, points: 10 },
  { id: 'studio', text: 'Change something in your Studio.', tier: 0, points: 10 },
  { id: 'queue-try', text: 'Try someone else’s Sequence from In the Queue.', tier: 0, points: 10 },
  { id: 'harmony-3', text: 'Perform a Sequence with three Harmonies or more.', tier: 1, points: 15 },
  { id: 'transition', text: 'Perform a Sequence that bridges a change of position.', tier: 1, points: 15 },
  { id: 'five-cards', text: 'Perform a Sequence of five cards or more.', tier: 1, points: 15 },
  { id: 'learn', text: 'Learn a new Technique.', tier: 1, points: 15 },
  { id: 'counterpose', text: 'Earn the Counterpose Harmony.', tier: 2, points: 20 },
  { id: 'arrive-settle', text: 'Earn Arrive and Settle in the same Sequence.', tier: 2, points: 20 },
  { id: 'send', text: 'Send a Sequence to a client.', tier: 2, points: 20 }
];

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Three intentions for a given day: one gentle, one steady, one deep. Same day, same three. */
export function intentionsFor(day: string): IntentionEvent[] {
  let h = 2166136261;
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return ([0, 1, 2] as const).map((tier, i) => {
    const pool = INTENTIONS.filter((x) => x.tier === tier);
    return pool[(h >>> (i * 5)) % pool.length].id;
  });
}
