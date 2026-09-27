import { CONTENT } from '../content/content';
import { RULES } from '../content/catalog';
import { STARTER_TRANSITIONS } from '../content/mat';
import { seedSequences } from '../content/seeds';
import { DECOR, DEFAULT_DECOR } from '../content/studio';
import type { Content } from '../content/types';
import {
  addPoints, checkMilestones, decorOpen, editDistance, emptyAnalytics, newSlot, readNode,
  signature, simulatedAudience, streakBonus, viewSlot
} from './rules';
import type { Action, GameState, Sequence } from './types';

export const STORAGE_KEY = 'que-movement:v4';
export const DEFAULT_THEME = 'watercolor-botanical';
export const PRIMARY_DECK = 'd-primary';

export function freshState(): GameState {
  const starters = CONTENT.branch.nodes.filter((n) => n.cost === 0).map((n) => n.cardId);
  return {
    version: 4,
    ownedCardIds: [...starters, ...STARTER_TRANSITIONS],
    points: 0,
    lifetimePoints: 0,
    completedCounts: {},
    sequences: seedSequences(),
    draftName: '',
    draftSlots: [],
    draftSourceId: null,
    decks: [{ id: PRIMARY_DECK, name: 'My Practice', cardIds: starters }],
    primaryDeckId: PRIMARY_DECK,
    archivedCardIds: [],
    savedSequenceIds: [],
    pinnedSequenceId: null,
    completedMilestoneIds: [],
    badgeIds: [],
    pendingMilestoneIds: [],
    pendingReveals: [],
    themeId: DEFAULT_THEME,
    unlockedThemeIds: CONTENT.themes.filter((t) => t.unlockedByDefault).map((t) => t.id),
    studioName: 'My Studio',
    decor: { ...DEFAULT_DECOR },
    streak: 0,
    play: null,
    seenIntro: false
  };
}

/** Load saved progress. Saves from Q Movement (before the Technique tree) start fresh. */
export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw);
    if (saved.version !== 4) return freshState();
    const base = freshState();
    const sequences: Sequence[] = saved.sequences ?? [];
    const missingSeeds = base.sequences.filter((s) => !sequences.some((x) => x.id === s.id));
    return { ...base, ...saved, decor: { ...base.decor, ...saved.decor }, sequences: [...sequences, ...missingSeeds] };
  } catch {
    return freshState();
  }
}

export function saveState(state: GameState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode: play on without saving */ }
}

function updateSeq(state: GameState, id: string, fn: (s: Sequence) => Sequence): GameState {
  return { ...state, sequences: state.sequences.map((s) => (s.id === id ? fn(s) : s)) };
}

function newSequence(name: string, slots: Sequence['slots'], now: number): Sequence {
  return {
    id: `seq-${now.toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    name,
    author: 'You',
    slots,
    createdAt: now,
    updatedAt: now,
    published: false,
    reactions: { creative: 0, sweaty: 0, gentle: 0, educational: 0 },
    myReaction: null,
    analytics: emptyAnalytics()
  };
}

const copySlots = (slots: Sequence['slots']) => slots.map((s) => ({ ...newSlot(s.cardId), modifiers: [...s.modifiers] }));

export function reduce(state: GameState, action: Action, content: Content = CONTENT): GameState {
  switch (action.type) {
    case 'draft/name':
      return { ...state, draftName: action.name };
    case 'draft/add': {
      if (state.draftSlots.length >= RULES.maxSteps) return state;
      const slots = [...state.draftSlots];
      const at = action.index === undefined ? slots.length : Math.max(0, Math.min(slots.length, action.index));
      slots.splice(at, 0, newSlot(action.cardId));
      return { ...state, draftSlots: slots };
    }
    case 'draft/attach': {
      const card = content.cardById[action.cardId];
      if (!card || card.kind !== 'progression') return state;
      return {
        ...state,
        draftSlots: state.draftSlots.map((s) => {
          if (s.slotId !== action.slotId) return s;
          const target = content.cardById[s.cardId];
          if (!target || target.kind !== 'movement') return s;
          if (s.modifiers.includes(action.cardId) || s.modifiers.length >= RULES.maxProgressionsPerCard) return s;
          return { ...s, modifiers: [...s.modifiers, action.cardId] };
        })
      };
    }
    case 'draft/detach':
      return { ...state, draftSlots: state.draftSlots.map((s) => (s.slotId === action.slotId ? { ...s, modifiers: s.modifiers.filter((m) => m !== action.cardId) } : s)) };
    case 'draft/move': {
      const slots = [...state.draftSlots];
      if (action.from < 0 || action.from >= slots.length) return state;
      const [it] = slots.splice(action.from, 1);
      slots.splice(Math.max(0, Math.min(slots.length, action.to)), 0, it);
      return { ...state, draftSlots: slots };
    }
    case 'draft/remove':
      return { ...state, draftSlots: state.draftSlots.filter((s) => s.slotId !== action.slotId) };
    case 'draft/clear':
      return { ...state, draftSlots: [] };
    case 'draft/new':
      return { ...state, draftSlots: [], draftName: '', draftSourceId: null, streak: 0 };
    case 'draft/load': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq) return state;
      return { ...state, draftSlots: copySlots(seq.slots), draftName: seq.name, draftSourceId: seq.seeded ? null : seq.id, streak: 0 };
    }
    case 'sequence/save': {
      if (!state.draftSlots.length) return state;
      const now = Date.now();
      const name = state.draftName.trim() || 'Untitled Sequence';
      const slots = state.draftSlots.map((s) => ({ ...s, modifiers: [...s.modifiers] }));
      const existing = state.draftSourceId ? state.sequences.find((s) => s.id === state.draftSourceId && !s.seeded) : undefined;
      let next: GameState;
      let id: string;
      if (existing) {
        id = existing.id;
        next = updateSeq(state, id, (s) => ({ ...s, name, slots, updatedAt: now }));
      } else {
        const seq = newSequence(name, slots, now);
        id = seq.id;
        next = { ...state, sequences: [seq, ...state.sequences] };
      }
      return checkMilestones({ ...next, draftSourceId: id, draftName: name }, { trigger: 'sequence-saved' }, content);
    }
    case 'sequence/saveAndStart': {
      const saved = reduce(state, { type: 'sequence/save' }, content);
      return saved.draftSourceId ? reduce(saved, { type: 'play/start', sequenceId: saved.draftSourceId }, content) : saved;
    }
    case 'sequence/publish': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq || seq.published || seq.seeded) return state;
      const aud = simulatedAudience(seq.slots.length);
      const next = updateSeq(state, seq.id, (s) => ({ ...s, published: true, publishedAt: Date.now(), studio: state.studioName, reactions: aud.reactions, community: aud.community }));
      return checkMilestones(next, { trigger: 'published' }, content);
    }
    case 'sequence/react':
      return updateSeq(state, action.sequenceId, (s) => {
        const r = { ...s.reactions };
        if (s.myReaction === action.reaction) {
          r[action.reaction] = Math.max(0, r[action.reaction] - 1);
          return { ...s, reactions: r, myReaction: null };
        }
        if (s.myReaction) r[s.myReaction] = Math.max(0, r[s.myReaction] - 1);
        r[action.reaction] += 1;
        return { ...s, reactions: r, myReaction: action.reaction };
      });
    case 'sequence/remix': {
      const src = state.sequences.find((s) => s.id === action.sequenceId);
      if (!src) return state;
      const now = Date.now();
      const seq = newSequence(src.seeded ? `${src.name}, remixed` : `${src.name} (remix)`, copySlots(src.slots), now);
      return { ...state, sequences: [seq, ...state.sequences], draftSlots: copySlots(seq.slots), draftName: seq.name, draftSourceId: seq.id, streak: 0 };
    }
    case 'sequence/delete':
      return {
        ...state,
        sequences: state.sequences.filter((s) => s.id !== action.sequenceId || s.seeded),
        draftSourceId: state.draftSourceId === action.sequenceId ? null : state.draftSourceId,
        pinnedSequenceId: state.pinnedSequenceId === action.sequenceId ? null : state.pinnedSequenceId
      };
    case 'sequence/toggleSaved': {
      const on = state.savedSequenceIds.includes(action.sequenceId);
      const next = updateSeq(state, action.sequenceId, (s) => (s.community ? { ...s, community: { ...s.community, saves: s.community.saves + (on ? -1 : 1) } } : s));
      return { ...next, savedSequenceIds: on ? state.savedSequenceIds.filter((id) => id !== action.sequenceId) : [action.sequenceId, ...state.savedSequenceIds] };
    }
    case 'sequence/pin':
      return { ...state, pinnedSequenceId: action.sequenceId };

    case 'technique/unlock': {
      const node = content.nodeById[action.nodeId];
      if (!node || readNode(node, state, content).status !== 'ready') return state;
      const next: GameState = {
        ...state,
        points: state.points - node.cost,
        ownedCardIds: [...state.ownedCardIds, node.cardId],
        pendingReveals: [...state.pendingReveals, { cardId: node.cardId }]
      };
      return checkMilestones(next, { trigger: 'technique' }, content);
    }

    case 'deck/create': {
      const decks = [...state.decks, { id: action.deckId, name: action.name, cardIds: action.cardIds ?? [] }];
      return checkMilestones({ ...state, decks }, { trigger: 'deck-made' }, content);
    }
    case 'deck/rename':
      return { ...state, decks: state.decks.map((d) => (d.id === action.deckId ? { ...d, name: action.name } : d)) };
    case 'deck/delete': {
      if (state.decks.length <= 1) return state;
      const decks = state.decks.filter((d) => d.id !== action.deckId);
      return { ...state, decks, primaryDeckId: state.primaryDeckId === action.deckId ? decks[0].id : state.primaryDeckId };
    }
    case 'deck/primary':
      return state.decks.some((d) => d.id === action.deckId) ? { ...state, primaryDeckId: action.deckId } : state;
    case 'deck/add':
      if (!state.ownedCardIds.includes(action.cardId)) return state;
      return {
        ...state,
        archivedCardIds: state.archivedCardIds.filter((id) => id !== action.cardId),
        decks: state.decks.map((d) => (d.id === action.deckId && !d.cardIds.includes(action.cardId) ? { ...d, cardIds: [...d.cardIds, action.cardId] } : d))
      };
    case 'deck/remove':
      return { ...state, decks: state.decks.map((d) => (d.id === action.deckId ? { ...d, cardIds: d.cardIds.filter((id) => id !== action.cardId) } : d)) };
    case 'card/archive':
      return state.archivedCardIds.includes(action.cardId) ? state : { ...state, archivedCardIds: [...state.archivedCardIds, action.cardId] };
    case 'card/restore':
      return { ...state, archivedCardIds: state.archivedCardIds.filter((id) => id !== action.cardId) };

    case 'play/start': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq || !seq.slots.length) return state;
      return {
        ...updateSeq(state, seq.id, (s) => ({ ...s, analytics: { ...s.analytics, plays: s.analytics.plays + 1 } })),
        streak: 0,
        play: { sequenceId: seq.id, index: 0, completedSlotIds: [], streak: 0, bestStreak: 0, pointsEarned: 0, startedAt: Date.now(), finished: false }
      };
    }
    case 'play/goto': {
      const play = state.play;
      if (!play) return state;
      const seq = state.sequences.find((s) => s.id === play.sequenceId);
      if (!seq) return state;
      return { ...state, play: { ...play, index: Math.max(0, Math.min(seq.slots.length - 1, action.index)) } };
    }
    case 'play/complete': {
      const play = state.play;
      if (!play || play.finished) return state;
      const seq = state.sequences.find((s) => s.id === play.sequenceId);
      if (!seq) return state;
      const slot = seq.slots[play.index];
      if (!slot || play.completedSlotIds.includes(slot.slotId)) return state;
      const view = viewSlot(slot, content);
      if (!view) return state;
      const streak = play.streak + 1;
      const earned = view.points + streakBonus(streak);
      const counts = { ...state.completedCounts };
      for (const id of [view.card.id, ...view.modifiers.map((m) => m.id)]) counts[id] = (counts[id] ?? 0) + 1;
      let next: GameState = {
        ...state,
        ...addPoints(state, earned),
        streak,
        completedCounts: counts,
        play: { ...play, streak, bestStreak: Math.max(play.bestStreak, streak), pointsEarned: play.pointsEarned + earned, completedSlotIds: [...play.completedSlotIds, slot.slotId] }
      };
      const p = next.play!;
      if (p.completedSlotIds.length !== seq.slots.length) return next;
      // The whole Sequence is done: record it and check milestones.
      const completedCardIds = seq.slots.flatMap((s) => [s.cardId, ...s.modifiers]);
      next = updateSeq(next, seq.id, (s) => ({ ...s, analytics: { ...s.analytics, completedPlays: s.analytics.completedPlays + 1, completionPercents: [...s.analytics.completionPercents, 100] } }));
      next = checkMilestones(next, { trigger: 'sequence-complete', completedCardIds }, content);
      const sig = signature(seq.slots);
      if (seq.signatureAtLastCompletion && editDistance(seq.signatureAtLastCompletion, sig) >= 2) next = checkMilestones(next, { trigger: 'remix', completedCardIds }, content);
      next = updateSeq(next, seq.id, (s) => ({ ...s, signatureAtLastCompletion: sig }));
      return { ...next, play: { ...next.play!, finished: true } };
    }
    case 'play/exit': {
      const play = state.play;
      if (!play) return state;
      const seq = state.sequences.find((s) => s.id === play.sequenceId);
      if (!seq || play.finished) return { ...state, play: null };
      const pct = seq.slots.length ? Math.round((play.completedSlotIds.length / seq.slots.length) * 100) : 0;
      return { ...updateSeq(state, seq.id, (s) => ({ ...s, analytics: { ...s.analytics, completionPercents: [...s.analytics.completionPercents, pct] } })), play: null };
    }

    case 'ui/dismissReveal':
      return { ...state, pendingReveals: state.pendingReveals.slice(1) };
    case 'ui/dismissMilestones':
      return { ...state, pendingMilestoneIds: [] };
    case 'ui/seenIntro':
      return { ...state, seenIntro: true };
    case 'theme/set':
      return state.unlockedThemeIds.includes(action.themeId) ? { ...state, themeId: action.themeId } : state;
    case 'studio/name':
      return { ...state, studioName: action.name };
    case 'studio/decor': {
      const variant = DECOR.find((d) => d.slot === action.slot)?.variants.find((v) => v.id === action.variant);
      if (!variant || !decorOpen(variant.unlock, state, content)) return state;
      return { ...state, decor: { ...state.decor, [action.slot]: action.variant } };
    }
    case 'game/reset':
      return { ...freshState(), seenIntro: true };
    default:
      return state;
  }
}
