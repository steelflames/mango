// The rules of Q Movement: points, streaks, doses, seams, challenges and unlocks.
// Ported faithfully from the current game so progress means the same thing.
import type { Card, Challenge, Content, Dose, MovementCard, Position, TransitionCard } from '../content/types';
import { RULES } from '../content/catalog';
import type { Analytics, GameState, PendingUnlock, Sequence, Slot } from './types';

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
/** "6 reps × 2" / "40s" — for tight spaces */
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
  deckIds: string[];
  maxPoints: number;
}

export function sequenceStats(slots: Slot[], content: Content): SequenceStats {
  const views = slots.map((s) => viewSlot(s, content)).filter(Boolean) as SlotView[];
  const mix = { foundation: 0, working: 0, challenge: 0 };
  const deckIds: string[] = [];
  let movementCount = 0, transitionCount = 0, progressionCount = 0, durationSeconds = 0, maxPoints = 0;
  for (const v of views) {
    durationSeconds += v.duration;
    maxPoints += v.points;
    progressionCount += v.modifiers.length;
    if (v.card.kind === 'movement') {
      movementCount += 1;
      mix[v.card.level] += 1;
      if (!deckIds.includes(v.card.deckId)) deckIds.push(v.card.deckId);
    } else if (v.card.kind === 'transition') transitionCount += 1;
  }
  durationSeconds += Math.max(0, views.length - 1) * GAP_BETWEEN_CARDS;
  return { views, movementCount, transitionCount, progressionCount, totalCards: views.length, durationSeconds, durationLabel: minutesLabel(durationSeconds), mix, deckIds, maxPoints };
}

export function mixLabel(mix: SequenceStats['mix']): string {
  const out: string[] = [];
  if (mix.foundation) out.push(`${mix.foundation} Foundation`);
  if (mix.working) out.push(`${mix.working} Working`);
  if (mix.challenge) out.push(`${mix.challenge} Challenge`);
  return out.length ? out.join(' · ') : 'No movement cards yet';
}

export function averageCompletion(seq: Sequence): number {
  const p = seq.analytics.completionPercents;
  return p.length ? Math.round(p.reduce((a, b) => a + b, 0) / p.length) : 0;
}

export function emptyAnalytics(): Analytics {
  return { plays: 0, completedPlays: 0, rewatches: 0, cardsViewed: 0, completionPercents: [] };
}

export function newSlot(cardId: string): Slot {
  return { slotId: `slot-${Math.random().toString(36).slice(2, 9)}`, cardId, modifiers: [] };
}

/** How many edits turn one build into another (used for the Remix challenge). */
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

/** A believable little audience for a freshly published build (the feed is simulated). */
export function simulatedAudience(cardCount: number) {
  const base = 20 + cardCount * 7;
  const jitter = (n: number) => Math.max(3, Math.round(n * (0.6 + Math.random() * 0.9)));
  const plays = jitter(base * 3);
  const completedPlays = Math.round(plays * (0.6 + Math.random() * 0.3));
  return {
    reactions: { creative: jitter(base * 0.9), sweaty: jitter(base * 0.4), gentle: jitter(base * 1.1), educational: jitter(base * 1.4) },
    community: { plays, completedPlays, rewatches: Math.round(plays * (0.2 + Math.random() * 0.25)) }
  };
}

// ---------------- seams: where the body changes position between cards ----------------

export function transitionFits(t: TransitionCard, a: Position, b: Position): boolean {
  return (t.from.includes(a) && t.to.includes(b)) || (t.from.includes(b) && t.to.includes(a));
}
export function transitionsFor(a: Position, b: Position, content: Content): TransitionCard[] {
  return content.cards.filter((c): c is TransitionCard => c.kind === 'transition' && transitionFits(c, a, b));
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

// ---------------- points, challenges and unlocks ----------------

export function addPoints(state: GameState, amount: number) {
  const totalPoints = state.totalPoints + amount;
  return { totalPoints, countedPoints: Math.min(RULES.pointCap, totalPoints) };
}

interface ChallengeEvent {
  trigger: Challenge['trigger'];
  completedCardIds: string[];
  completionPercent: number;
}

export function challengeMet(ch: Challenge, ev: ChallengeEvent, content: Content): boolean {
  if (ch.trigger !== ev.trigger) return false;
  const { rule } = ch;
  const ids = ev.completedCardIds;
  const cards = ids.map((id) => content.cardById[id]).filter(Boolean) as Card[];
  if (rule.requiredCardIds?.some((id) => !ids.includes(id))) return false;
  if (rule.requiredDeckIds) {
    const decks = new Set(cards.filter((c): c is MovementCard => c.kind === 'movement').map((c) => c.deckId));
    if (rule.requiredDeckIds.some((d) => !decks.has(d))) return false;
  }
  if (rule.minTransitions && cards.filter((c) => c.kind === 'transition').length < rule.minTransitions) return false;
  if (rule.minProgressions && cards.filter((c) => c.kind === 'progression').length < rule.minProgressions) return false;
  if (rule.minCards && ids.length < rule.minCards) return false;
  if (rule.requireFullCompletion && ev.completionPercent < 100) return false;
  return true;
}

export function newlyMetChallenges(ev: ChallengeEvent, content: Content, done: string[]): Challenge[] {
  return content.challenges.filter((c) => !done.includes(c.id) && challengeMet(c, ev, content));
}

export function applyChallenges(state: GameState, met: Challenge[]): GameState {
  if (!met.length) return state;
  let points = 0;
  const badges = new Set(state.badgeIds);
  const themes = new Set(state.unlockedThemeIds);
  for (const c of met) {
    points += c.reward.points ?? 0;
    if (c.reward.badgeId) badges.add(c.reward.badgeId);
    if (c.reward.themeId) themes.add(c.reward.themeId);
  }
  return {
    ...state,
    ...addPoints(state, points),
    badgeIds: [...badges],
    unlockedThemeIds: [...themes],
    completedChallengeIds: [...state.completedChallengeIds, ...met.map((c) => c.id).filter((id) => !state.completedChallengeIds.includes(id))],
    pendingChallengeIds: [...state.pendingChallengeIds, ...met.map((c) => c.id)]
  };
}

export function deckCard(content: Content, deckId: string, level: MovementCard['level']): MovementCard | undefined {
  return content.movementCards.find((c) => c.deckId === deckId && c.level === level);
}
export function challengeThatUnlocks(content: Content, cardId: string): string | undefined {
  return content.challenges.find((c) => c.reward.unlocksCardId === cardId)?.id;
}

/** Cards that open up after a completed sequence. Working opens after Foundation is
 *  practised and the deck is completed in a sequence; Challenge after Working is
 *  practised and its challenge is done. */
export function findUnlocks(state: GameState, content: Content, completedDeckIds: string[]): PendingUnlock[] {
  const out: PendingUnlock[] = [];
  const unlocked = new Set(state.unlockedCardIds);
  const count = (id: string) => state.completedCounts[id] ?? 0;
  const decksDone = new Set([...state.decksCompletedInSequence, ...completedDeckIds]);
  for (const deck of content.decks) {
    const f = deckCard(content, deck.id, 'foundation');
    const w = deckCard(content, deck.id, 'working');
    const c = deckCard(content, deck.id, 'challenge');
    if (w && !unlocked.has(w.id) && f && count(f.id) > 0 && decksDone.has(deck.id)) {
      unlocked.add(w.id);
      out.push({ cardId: w.id, cardName: w.name, level: 'working', deckName: deck.name, message: 'A further option in this deck. Not a better one — another way in.' });
    }
    if (c && !unlocked.has(c.id)) {
      const ch = challengeThatUnlocks(content, c.id);
      const wOpen = !!w && unlocked.has(w.id);
      const wDone = !!w && count(w.id) > 0;
      const chDone = ch ? state.completedChallengeIds.includes(ch) : wDone;
      if (wOpen && wDone && chDone) {
        unlocked.add(c.id);
        out.push({ cardId: c.id, cardName: c.name, level: 'challenge', deckName: deck.name, message: 'The deck opens further. Return to Foundation whenever you like.' });
      }
    }
  }
  return out;
}

/** Which of a locked card's requirements are already met, in order. */
export function requirementProgress(state: GameState, content: Content, card: MovementCard): boolean[] {
  const count = (id: string) => state.completedCounts[id] ?? 0;
  const f = deckCard(content, card.deckId, 'foundation');
  const w = deckCard(content, card.deckId, 'working');
  if (card.level === 'working') {
    const deckDone = state.decksCompletedInSequence.includes(card.deckId);
    return [!!f && count(f.id) > 0, deckDone, deckDone];
  }
  if (card.level === 'challenge') {
    const ch = challengeThatUnlocks(content, card.id);
    return [!!w && state.unlockedCardIds.includes(w.id), !!w && count(w.id) > 0, ch ? state.completedChallengeIds.includes(ch) : false];
  }
  return [];
}
