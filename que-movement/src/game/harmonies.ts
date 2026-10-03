// The Pilates Council's sequencing principles. Each Harmony is something a great teacher
// would say out loud in a class; the builder lights them live, Play pays them out.
import type { Content, MovementCard, Position } from '../content/types';
import { POSITION_LABEL } from '../content/content';
import { readSeams, transitionsFor, viewSlot } from './rules';
import type { Slot } from './types';

export type HarmonyStatus = 'met' | 'open' | 'idle';

export interface HarmonyDef {
  id: string;
  name: string;
  glyph: string;
  /** In the teacher's voice. */
  says: string;
  points: number;
}

export const HARMONIES: HarmonyDef[] = [
  { id: 'arrive', name: 'Arrive', glyph: '☾', says: 'Start with the breath, or something that asks nothing of you yet.', points: 5 },
  { id: 'rising-arc', name: 'Rising Arc', glyph: '⌒', says: 'Build to the hardest thing in the middle, never the first or the last.', points: 10 },
  { id: 'counterpose', name: 'Counterpose', glyph: '⇅', says: 'Every flexion deserves an extension. After you curl, open the front of the body.', points: 10 },
  { id: 'seamless', name: 'Seamless', glyph: '≈', says: 'Don’t make them scramble. Bridge the change of position.', points: 10 },
  { id: 'economy', name: 'Economy', glyph: '◇', says: 'Five or more exercises, two changes of position at most. Flow beats fuss.', points: 10 },
  { id: 'whole-body', name: 'Whole Body', glyph: '❋', says: 'Something for the back line, the centre and the shoulders.', points: 15 },
  { id: 'settle', name: 'Settle', glyph: '∿', says: 'Send them home calmer than they came.', points: 5 }
];

export interface HarmonyReading {
  def: HarmonyDef;
  status: HarmonyStatus;
  /** The teacher's note: what would make it sing. */
  hint?: string;
}

interface Step { card: MovementCard; intensity: number; index: number }

/** A movement's intensity with its progressions on it (each adds one, to a peak of 5). */
function stepIntensity(card: MovementCard, modifiers: string[]) {
  return Math.min(5, card.intensity + modifiers.length);
}

export function classArc(slots: Slot[], content: Content): { kind: 'movement' | 'transition' | 'progression'; intensity: number; pathId?: string; name: string }[] {
  return slots.map((s) => {
    const v = viewSlot(s, content);
    if (!v) return { kind: 'transition' as const, intensity: 0, name: '' };
    if (v.card.kind === 'movement') return { kind: 'movement' as const, intensity: stepIntensity(v.card, s.modifiers), pathId: v.card.pathId, name: v.card.name };
    return { kind: v.card.kind, intensity: 0, name: v.card.name };
  });
}

/** Read a Sequence against every Harmony. `owned` lets the teacher suggest cards you actually have. */
export function readHarmonies(slots: Slot[], content: Content, owned: string[]): HarmonyReading[] {
  const steps: Step[] = [];
  slots.forEach((s, index) => {
    const c = content.cardById[s.cardId];
    if (c?.kind === 'movement') steps.push({ card: c, intensity: stepIntensity(c, s.modifiers), index });
  });
  const has = (id: string) => owned.includes(id);
  const name = (id: string) => content.cardById[id]?.name ?? id;
  const calm = ['breathing', 'scapular-glide'].filter(has);
  const { seams, route } = readSeams(slots, content);
  const out: HarmonyReading[] = [];
  const push = (id: string, status: HarmonyStatus, hint?: string) => out.push({ def: HARMONIES.find((h) => h.id === id)!, status, hint });

  // Arrive
  if (!steps.length) push('arrive', 'idle');
  else if (steps[0].card.id === 'breathing' || steps[0].intensity <= 1) push('arrive', 'met');
  else push('arrive', 'open', calm.length ? `Open with ${name(calm[0])} before ${steps[0].card.name}.` : `Open with something gentler than ${steps[0].card.name}.`);

  // Rising Arc
  if (steps.length < 3) push('rising-arc', 'idle', 'Needs three movements or more.');
  else {
    const peak = Math.max(...steps.map((s) => s.intensity));
    const at = steps.map((s, i) => (s.intensity === peak ? i : -1)).filter((i) => i >= 0);
    const middle = at.some((i) => i > 0 && i < steps.length - 1);
    const rises = peak > steps[0].intensity;
    if (middle && rises) push('rising-arc', 'met');
    else {
      const p = steps[at[0]];
      push('rising-arc', 'open', !rises ? `Nothing climbs above where you began. Open gentler, or add a progression to ${steps[Math.floor(steps.length / 2)].card.name} so the work builds.` : `${p.card.name} is your peak. Move it towards the middle.`);
    }
  }

  // Counterpose
  const flex = steps.filter((s) => s.card.spine === 'flexion');
  if (!flex.length) push('counterpose', 'idle', 'Comes into play when a Sequence has flexion (Hundred, Roll Up, Teaser).');
  else {
    const lastFlex = flex[flex.length - 1];
    const ext = steps.some((s) => s.card.spine === 'extension' && s.index > lastFlex.index);
    if (ext) push('counterpose', 'met');
    else {
      const extOwned = content.movementCards.filter((c) => c.spine === 'extension' && has(c.id)).map((c) => c.name);
      push('counterpose', 'open', extOwned.length ? `After ${lastFlex.card.name}, answer it with ${extOwned.includes('Swan Preparation') ? 'Swan Preparation' : extOwned[0]}.` : `After ${lastFlex.card.name}, open the front of the body. Swan Preparation grows on the Shoulders path.`);
    }
  }

  // Seamless
  if (!seams.length) push('seamless', 'idle', 'Comes into play when the Sequence changes position.');
  else {
    const open = seams.find((s) => s.status === 'open');
    if (!open) push('seamless', 'met');
    else {
      const fit = transitionsFor(open.from as Position, open.to as Position, content, owned)[0];
      push('seamless', 'open', `${POSITION_LABEL[open.from]} → ${POSITION_LABEL[open.to]} has no bridge.${fit ? ` Add ${fit.name}.` : ''}`);
    }
  }

  // Economy
  const changes = Math.max(0, route.length - 1);
  if (steps.length < 5) push('economy', 'idle', `Needs five movements; you have ${steps.length}.`);
  else if (changes <= 2) push('economy', 'met');
  else push('economy', 'open', `${changes} changes of position. Gather cards that share a position so there are two at most.`);

  // Whole Body
  const paths = new Set(steps.map((s) => s.card.pathId));
  const missing = content.paths.filter((p) => !paths.has(p.id));
  if (!steps.length) push('whole-body', 'idle');
  else if (!missing.length) push('whole-body', 'met');
  else {
    const m = missing[0];
    const pick = content.movementCards.find((c) => c.pathId === m.id && has(c.id) && c.id !== 'breathing');
    push('whole-body', 'open', `Nothing for ${m.name} yet${pick ? `. Try ${pick.name}` : ''}.`);
  }

  // Settle
  if (steps.length < 3) push('settle', 'idle', 'Needs three movements or more.');
  else {
    const last = steps[steps.length - 1];
    if (last.intensity <= 2) push('settle', 'met');
    else push('settle', 'open', calm.length ? `You end on ${last.card.name}. Close with something quieter, such as ${name(calm[calm.length - 1])}.` : `End on something calmer than ${last.card.name}.`);
  }
  return out;
}

export function harmonyPoints(readings: HarmonyReading[]): number {
  return readings.filter((r) => r.status === 'met').reduce((a, r) => a + r.def.points, 0);
}

/** Movement steps at the Sequence's peak effort (3 or more). Completing one pays PEAK_POINTS. */
export function peakSlotIds(slots: Slot[], content: Content): string[] {
  const arc = classArc(slots, content);
  const peak = Math.max(0, ...arc.map((a) => a.intensity));
  if (peak < 3) return [];
  return slots.filter((_, i) => arc[i].kind === 'movement' && arc[i].intensity === peak).map((s) => s.slotId);
}
