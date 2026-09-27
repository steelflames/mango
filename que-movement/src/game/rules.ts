// The rules of Que Movement: points, streaks, doses, seams, milestones and the Technique tree.
import type { Card, Content, Dose, Milestone, MilestoneTrigger, MovementCard, Position, TechniqueNode, TransitionCard } from '../content/types';
import { DECOR, TITLES, type DecorUnlock } from '../content/studio';
import type { Analytics, GameState, Sequence, Slot } from './types';

export const SECONDS_PER_REP = 6;
export const SETUP_SECONDS = 15;
export const GAP_BETWEEN_CARDS = 12;
export const SLOW_TEMPO = 'pr-slow-tempo';

/** Streak bonus: nothing for the first two cards, then +2 every three in a row, up to +10. */
export function streakBonus(streak: number): number {
  return streak < 3 ? 0 : Math.min(10, Math.floor(streak / 3) * 2);
}

export function doseSeconds(dose: Dose, slow = false): number {
  const base = dose.kind === 'hold' ? dose.seconds : dose.reps * SECONDS_PER_REP;
  return Math.round(base * (dose.perSide ? 2 : 1) * (slow ? 2 : 1));
}
export function doseWithSetup(dose: Dose, slow = false): number {
  return doseSeconds(dose, slow) + SETUP_SECONDS;
}
/** "6 reps each side" / "Hold 40s" */
export function doseLabel(dose: Dose): string {
  const side = dose.perSide ? ' each side' : '';
  return dose.kind === 'hold' ? `Hold ${dose.seconds}s${side}` : `${dose.reps} reps${side}`;
}
/** "6 reps × 2" / "40s", for tight spaces */
export function doseShort(dose: Dose): string {
  const side = dose.perSide ? ' × 2' : '';
  return dose.kind === 'hold' ? `${dose.seconds}s${side}` : `${dose.reps} reps${side}`;
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
export function minutesLabel(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

export function cardSeconds(card: Card): number {
  return card.kind === 'movement' ? doseWithSetup(card.dose) : card.duration;
}

export interface SlotView {
  slot: Slot;
  card: Card;
  modifiers: Card[];
  points: number;
  duration: number;
}

export function viewSlot(slot: Slot, content: Content): SlotView | null {
  const card = content.cardById[slot.cardId];
  if (!card) return null;
  const modifiers = slot.modifiers.map((m) => content.cardById[m]).filter(Boolean) as Card[];
  const slow = modifiers.some((m) => m.id === SLOW_TEMPO);
  const extra = modifiers.filter((m) => m.id !== SLOW_TEMPO).reduce((a, m) => a + m.duration, 0);
  const duration = card.kind === 'movement' ? doseWithSetup(card.dose, slow) + extra : card.duration + extra;
  return { slot, card, modifiers, points: card.points + modifiers.reduce((a, m) => a + m.points, 0), duration };
}

export interface SequenceStats {
  views: SlotView[];
  movementCount: number;
  transitionCount: number;
  progressionCount: number;
  totalCards: number;
  durationSeconds: number;
  durationLabel: string;
  mix: { foundation: number; working: number; challenge: number };
  pathIds: string[];
  maxPoints: number;
}

export function sequenceStats(slots: Slot[], content: Content): SequenceStats {
  const views = slots.map((s) => viewSlot(s, content)).filter(Boolean) as SlotView[];
  const mix = { foundation: 0, working: 0, challenge: 0 };
  const pathIds: string[] = [];
  let movementCount = 0, transitionCount = 0, progressionCount = 0, durationSeconds = 0, maxPoints = 0;
  for (const v of views) {
    durationSeconds += v.duration;
    maxPoints += v.points;
    progressionCount += v.modifiers.length;
    if (v.card.kind === 'movement') {
      movementCount += 1;
      mix[v.card.level] += 1;
      if (!pathIds.includes(v.card.pathId)) pathIds.push(v.card.pathId);
    } else if (v.card.kind === 'transition') transitionCount += 1;
  }
  durationSeconds += Math.max(0, views.length - 1) * GAP_BETWEEN_CARDS;
  return { views, movementCount, transitionCount, progressionCount, totalCards: views.length, durationSeconds, durationLabel: minutesLabel(durationSeconds), mix, pathIds, maxPoints };
}

export function mixLabel(mix: SequenceStats['mix']): string {
  const out: string[] = [];
  if (mix.foundation) out.push(`${mix.foundation} Foundation`);
  if (mix.working) out.push(`${mix.working} Working`);
  if (mix.challenge) out.push(`${mix.challenge} Challenge`);
  return out.length ? out.join(' · ') : 'No movements yet';
}

export function emptyAnalytics(): Analytics {
  return { plays: 0, completedPlays: 0, completionPercents: [] };
}

export function newSlot(cardId: string): Slot {
  return { slotId: `slot-${Math.random().toString(36).slice(2, 9)}`, cardId, modifiers: [] };
}

/** How many edits turn one build into another (used for the Remix milestone). */
export function editDistance(a: string[], b: string[]): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) row[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], row[j - 1]);
    prev = row;
  }
  return prev[b.length];
}
export function signature(slots: Slot[]): string[] {
  return slots.map((s) => [s.cardId, ...s.modifiers].join('+'));
}

/** A believable little audience for a freshly published Sequence (the feed is simulated). */
export function simulatedAudience(cardCount: number) {
  const base = 20 + cardCount * 7;
  const jitter = (n: number) => Math.max(3, Math.round(n * (0.6 + Math.random() * 0.9)));
  return {
    reactions: { creative: jitter(base * 0.9), sweaty: jitter(base * 0.4), gentle: jitter(base * 1.1), educational: jitter(base * 1.4) },
    community: { plays: jitter(base * 3), saves: jitter(base * 0.5) }
  };
}

// ---------------- seams: where the body changes position between cards ----------------

export function transitionFits(t: TransitionCard, a: Position, b: Position): boolean {
  return (t.from.includes(a) && t.to.includes(b)) || (t.from.includes(b) && t.to.includes(a));
}
export function transitionsFor(a: Position, b: Position, content: Content, owned?: string[]): TransitionCard[] {
  return content.cards.filter((c): c is TransitionCard => c.kind === 'transition' && transitionFits(c, a, b) && (!owned || owned.includes(c.id)));
}

export interface Seam {
  /** Index of the movement card the seam sits before. */
  index: number;
  slotId: string;
  from: Position;
  to: Position;
  status: 'bridged' | 'open';
}

export function readSeams(slots: Slot[], content: Content) {
  const seams: Seam[] = [];
  const transitionStatus: Record<string, 'matched' | 'unmatched' | 'unneeded'> = {};
  const route: Position[] = [];
  let last: Position | null = null;
  let waiting: { slotId: string; card: TransitionCard }[] = [];
  slots.forEach((slot, index) => {
    const card = content.cardById[slot.cardId];
    if (!card) return;
    if (card.kind === 'transition') { waiting.push({ slotId: slot.slotId, card }); return; }
    if (card.kind !== 'movement') return;
    const pos = card.position;
    if (route[route.length - 1] !== pos) route.push(pos);
    if (last && pos !== last) {
      const from: Position = last;
      const match = waiting.find((w) => transitionFits(w.card, from, pos));
      for (const w of waiting) transitionStatus[w.slotId] = w === match ? 'matched' : 'unmatched';
      seams.push({ index, slotId: slot.slotId, from, to: pos, status: match ? 'bridged' : 'open' });
    } else {
      for (const w of waiting) transitionStatus[w.slotId] = 'unneeded';
    }
    waiting = [];
    last = pos;
  });
  for (const w of waiting) transitionStatus[w.slotId] = 'unneeded';
  return { seams, transitionStatus, openSeams: seams.filter((s) => s.status === 'open').length, route };
}

// ---------------- points ----------------

export function addPoints(state: GameState, amount: number) {
  return { points: state.points + amount, lifetimePoints: state.lifetimePoints + amount };
}

// ---------------- the Technique tree ----------------

export type NodeStatus = 'known' | 'ready' | 'saving' | 'practise' | 'locked';

export interface NodeReading {
  status: NodeStatus;
  /** Each requirement, and whether it is met. */
  steps: { label: string; done: boolean }[];
  missingPoints: number;
}

const known = (state: GameState, content: Content, nodeId: string) => {
  const n = content.nodeById[nodeId];
  return !!n && state.ownedCardIds.includes(n.cardId);
};
const practised = (state: GameState, content: Content, nodeId: string) => {
  const n = content.nodeById[nodeId];
  return !!n && (state.completedCounts[n.cardId] ?? 0) > 0;
};

/** Where a Technique stands: known, ready to learn, saving up, needs practice, or still locked. */
export function readNode(node: TechniqueNode, state: GameState, content: Content): NodeReading {
  if (state.ownedCardIds.includes(node.cardId)) return { status: 'known', steps: [], missingPoints: 0 };
  const name = (id: string) => content.cardById[content.nodeById[id]?.cardId]?.name ?? 'it';
  const reqsKnown = node.requires.every((r) => known(state, content, r));
  const anyPractised = node.requires.length === 0 || node.requires.some((r) => practised(state, content, r));
  const steps = [
    ...node.requires.map((r) => ({ label: `Learn ${name(r)}`, done: known(state, content, r) })),
    { label: node.requires.length > 1 ? `Perform ${node.requires.map(name).join(' or ')} in a Sequence` : `Perform ${name(node.requires[0])} in a Sequence`, done: anyPractised },
    { label: `${node.cost} points`, done: state.points >= node.cost }
  ];
  const missingPoints = Math.max(0, node.cost - state.points);
  const status: NodeStatus = !reqsKnown ? 'locked' : !anyPractised ? 'practise' : missingPoints > 0 ? 'saving' : 'ready';
  return { status, steps, missingPoints };
}

export function techniquesKnown(state: GameState, content: Content): number {
  return content.branch.nodes.filter((n) => state.ownedCardIds.includes(n.cardId)).length;
}

export function pathMastered(pathId: string, state: GameState, content: Content): boolean {
  return content.branch.nodes.filter((n) => n.pathId === pathId).every((n) => state.ownedCardIds.includes(n.cardId));
}

export function instructorTitle(state: GameState, content: Content): string {
  const n = techniquesKnown(state, content);
  return [...TITLES].reverse().find(([min]) => n >= min)?.[1] ?? TITLES[0][1];
}

// ---------------- milestones and badges ----------------

interface MilestoneEvent {
  trigger: MilestoneTrigger;
  completedCardIds?: string[];
}

export function milestoneMet(m: Milestone, ev: MilestoneEvent, state: GameState, content: Content): boolean {
  if (m.trigger !== ev.trigger) return false;
  const { rule } = m;
  if (rule.masterPath) return pathMastered(rule.masterPath, state, content);
  const ids = ev.completedCardIds ?? [];
  const cards = ids.map((id) => content.cardById[id]).filter(Boolean) as Card[];
  if (rule.requiredPathIds) {
    const paths = new Set(cards.filter((c): c is MovementCard => c.kind === 'movement').map((c) => c.pathId));
    if (rule.requiredPathIds.some((p) => !paths.has(p))) return false;
  }
  if (rule.minTransitions && cards.filter((c) => c.kind === 'transition').length < rule.minTransitions) return false;
  if (rule.minProgressions && cards.filter((c) => c.kind === 'progression').length < rule.minProgressions) return false;
  if (rule.minCards && ids.length < rule.minCards) return false;
  return true;
}

/** Check a trigger and pay out any milestones it completes. */
export function checkMilestones(state: GameState, ev: MilestoneEvent, content: Content): GameState {
  const met = content.milestones.filter((m) => !state.completedMilestoneIds.includes(m.id) && milestoneMet(m, ev, state, content));
  if (!met.length) return state;
  let points = 0;
  const badges = new Set(state.badgeIds);
  const themes = new Set(state.unlockedThemeIds);
  for (const m of met) {
    points += m.reward.points ?? 0;
    badges.add(m.reward.badgeId);
    if (m.reward.themeId) themes.add(m.reward.themeId);
  }
  return {
    ...state,
    ...addPoints(state, points),
    badgeIds: [...badges],
    unlockedThemeIds: [...themes],
    completedMilestoneIds: [...state.completedMilestoneIds, ...met.map((m) => m.id)],
    pendingMilestoneIds: [...state.pendingMilestoneIds, ...met.map((m) => m.id)]
  };
}

// ---------------- the Studio ----------------

export function decorOpen(unlock: DecorUnlock | undefined, state: GameState, content: Content): boolean {
  if (!unlock) return true;
  if (unlock.badgeId && !state.badgeIds.includes(unlock.badgeId)) return false;
  if (unlock.techniques && techniquesKnown(state, content) < unlock.techniques) return false;
  if (unlock.lifetimePoints && state.lifetimePoints < unlock.lifetimePoints) return false;
  return true;
}

export function decorHint(unlock: DecorUnlock | undefined, content: Content): string {
  if (!unlock) return '';
  if (unlock.badgeId) return `Earn the ${content.badges.find((b) => b.id === unlock.badgeId)?.name ?? ''} badge`;
  if (unlock.techniques) return `Know ${unlock.techniques} Techniques`;
  if (unlock.lifetimePoints) return `Earn ${unlock.lifetimePoints} points in all`;
  return '';
}

/** Decor that has opened up but hasn't been tried yet (the Studio tab shows a dot). */
export function openDecorCount(state: GameState, content: Content): number {
  return DECOR.flatMap((d) => d.variants).filter((v) => v.unlock && decorOpen(v.unlock, state, content)).length;
}

// ---------------- the next step (the loop guide in the top bar) ----------------

export type LoopStep = 'learn' | 'collect' | 'build' | 'play' | 'earn' | 'unlock' | 'share';

export interface NextStep {
  step: LoopStep;
  text: string;
  go: 'technique' | 'repertoire' | 'play' | 'queue' | 'studio';
}

export function nextStep(state: GameState, content: Content): NextStep {
  const inDeck = new Set(state.decks.flatMap((d) => d.cardIds));
  const loose = content.branch.nodes.find((n) => state.ownedCardIds.includes(n.cardId) && !inDeck.has(n.cardId) && !state.archivedCardIds.includes(n.cardId));
  if (loose) return { step: 'collect', text: `Add ${content.cardById[loose.cardId].name} to a deck`, go: 'repertoire' };
  const readings = content.branch.nodes.map((n) => ({ n, r: readNode(n, state, content) }));
  const ready = readings.filter((x) => x.r.status === 'ready').sort((a, b) => a.n.cost - b.n.cost)[0];
  if (ready) return { step: 'unlock', text: `Learn ${content.cardById[ready.n.cardId].name} · ${ready.n.cost} pts`, go: 'technique' };
  if (state.play && !state.play.finished) return { step: 'play', text: 'Finish your Sequence', go: 'play' };
  const mine = state.sequences.filter((s) => !s.seeded);
  if (!mine.length && !state.draftSlots.length) return { step: 'build', text: 'Build a first Sequence', go: 'repertoire' };
  if (state.draftSlots.length && !mine.some((s) => s.analytics.completedPlays > 0)) return { step: 'play', text: 'Perform your Sequence', go: 'repertoire' };
  const needsPractice = readings.find((x) => x.r.status === 'practise');
  const saving = readings.filter((x) => x.r.status === 'saving').sort((a, b) => a.r.missingPoints - b.r.missingPoints)[0];
  if (saving && saving.r.missingPoints <= 30) return { step: 'earn', text: `${saving.r.missingPoints} more points for ${content.cardById[saving.n.cardId].name}`, go: 'repertoire' };
  if (needsPractice) {
    const parent = content.cardById[content.nodeById[needsPractice.n.requires[0]].cardId]?.name;
    return { step: 'play', text: `Perform ${parent} to open what grows from it`, go: 'repertoire' };
  }
  if (saving) return { step: 'earn', text: `${saving.r.missingPoints} more points for ${content.cardById[saving.n.cardId].name}`, go: 'repertoire' };
  if (!mine.some((s) => s.published)) return { step: 'share', text: 'Share a Sequence In the Queue', go: 'queue' };
  return { step: 'build', text: 'Build something new', go: 'repertoire' };
}

/** A sequence's cards that the player doesn't own yet. */
export function unknownCards(seq: Sequence, state: GameState, content: Content): Card[] {
  const ids = [...new Set(seq.slots.flatMap((s) => [s.cardId, ...s.modifiers]))];
  return ids.filter((id) => !state.ownedCardIds.includes(id)).map((id) => content.cardById[id]).filter(Boolean) as Card[];
}
