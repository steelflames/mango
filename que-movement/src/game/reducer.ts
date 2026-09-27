import { buildContent } from '../content/content';
import { RULES } from '../content/catalog';
import { seedSequences } from '../content/seeds';
import type { Content } from '../content/types';
import {
  addPoints, applyChallenges, editDistance, emptyAnalytics, findUnlocks, newSlot,
  newlyMetChallenges, signature, simulatedAudience, streakBonus, viewSlot
} from './rules';
import type { Action, GameState, Sequence } from './types';
import { MY_BUILDS } from './types';

export const STORAGE_KEY = 'q-movement:v2';
const LEGACY_KEY = 'q-movement:v1';
export const DEFAULT_THEME = 'watercolor-botanical';

export function freshState(): GameState {
  const content = buildContent(['core']);
  return {
    version: 3,
    unlockedCardIds: content.movementCards.filter((c) => c.unlockedByDefault).map((c) => c.id),
    completedCounts: {},
    totalPoints: 0,
    countedPoints: 0,
    sequences: seedSequences(),
    draftName: '',
    draftSlots: [],
    draftSourceId: null,
    completedChallengeIds: [],
    badgeIds: [],
    themeId: DEFAULT_THEME,
    unlockedThemeIds: content.themes.filter((t) => t.unlockedByDefault).map((t) => t.id),
    installedPackIds: ['core'],
    streak: 0,
    play: null,
    pendingUnlocks: [],
    pendingChallengeIds: [],
    decksCompletedInSequence: [],
    seenIntro: false,
    folders: [{ id: MY_BUILDS, name: 'My builds', sequenceIds: [] }]
  };
}

/** Load saved progress. Earlier builds of the game (q-movement:v1) carry over. */
export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw);
    if (saved.version !== 2 && saved.version !== 3) return freshState();
    const base = freshState();
    const sequences: Sequence[] = saved.sequences ?? [];
    const missingSeeds = base.sequences.filter((s) => !sequences.some((x) => x.id === s.id));
    const folders = saved.folders?.length ? saved.folders : base.folders;
    return { ...base, ...saved, version: 3, sequences: [...sequences, ...missingSeeds], folders };
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

function placeInFolder(state: GameState, sequenceId: string, folderId: string): GameState {
  return {
    ...state,
    folders: state.folders.map((f) => {
      const rest = f.sequenceIds.filter((id) => id !== sequenceId);
      return f.id === folderId && folderId !== MY_BUILDS ? { ...f, sequenceIds: [...rest, sequenceId] } : { ...f, sequenceIds: rest };
    })
  };
}

export function reduce(state: GameState, action: Action, content: Content = buildContent(state.installedPackIds)): GameState {
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
      return { ...state, draftSlots: [], draftName: '', draftSourceId: null, streak: 0, play: null };
    case 'draft/load': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq) return state;
      return {
        ...state,
        draftSlots: seq.slots.map((s) => ({ ...newSlot(s.cardId), modifiers: [...s.modifiers] })),
        draftName: seq.name,
        draftSourceId: seq.seeded ? null : seq.id,
        streak: 0
      };
    }
    case 'sequence/save': {
      if (!state.draftSlots.length) return state;
      const now = Date.now();
      const name = state.draftName.trim() || 'Untitled Build';
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
      next = { ...next, draftSourceId: id, draftName: name };
      if (action.folderId) next = placeInFolder(next, id, action.folderId);
      const met = newlyMetChallenges({ trigger: 'sequence-saved', completedCardIds: [], completionPercent: 0 }, content, next.completedChallengeIds);
      return applyChallenges(next, met);
    }
    case 'sequence/saveAndStart': {
      const saved = reduce(state, { type: 'sequence/save' }, content);
      return saved.draftSourceId ? reduce(saved, { type: 'play/start', sequenceId: saved.draftSourceId }, content) : saved;
    }
    case 'sequence/publish': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq || seq.published) return state;
      const aud = simulatedAudience(seq.slots.length);
      return updateSeq(state, seq.id, (s) => ({ ...s, published: true, publishedAt: Date.now(), reactions: aud.reactions, community: aud.community }));
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
    case 'sequence/copy': {
      const src = state.sequences.find((s) => s.id === action.sequenceId);
      if (!src) return state;
      const now = Date.now();
      const seq = newSequence(`${src.name} (my version)`, src.slots.map((s) => ({ ...newSlot(s.cardId), modifiers: [...s.modifiers] })), now);
      return { ...state, sequences: [seq, ...state.sequences], draftSlots: seq.slots.map((s) => ({ ...s })), draftName: seq.name, draftSourceId: seq.id, streak: 0 };
    }
    case 'sequence/delete':
      return {
        ...state,
        sequences: state.sequences.filter((s) => s.id !== action.sequenceId),
        draftSourceId: state.draftSourceId === action.sequenceId ? null : state.draftSourceId,
        folders: state.folders.map((f) => ({ ...f, sequenceIds: f.sequenceIds.filter((id) => id !== action.sequenceId) }))
      };
    case 'folder/create': {
      const next = { ...state, folders: [...state.folders, { id: action.folderId, name: action.name, sequenceIds: [] }] };
      return action.sequenceId ? placeInFolder(next, action.sequenceId, action.folderId) : next;
    }
    case 'folder/move':
      return placeInFolder(state, action.sequenceId, action.folderId);
    case 'folder/delete':
      return action.folderId === MY_BUILDS ? state : { ...state, folders: state.folders.filter((f) => f.id !== action.folderId) };
    case 'play/start': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq || !seq.slots.length) return state;
      const plays = seq.analytics.plays + 1;
      return {
        ...updateSeq(state, seq.id, (s) => ({
          ...s,
          analytics: { ...s.analytics, plays, rewatches: plays > 1 ? s.analytics.rewatches + 1 : s.analytics.rewatches, cardsViewed: s.analytics.cardsViewed + 1 }
        })),
        streak: 0,
        play: {
          sequenceId: seq.id, index: 0, completedSlotIds: [], streak: 0, bestStreak: 0, pointsEarned: 0,
          viewedSlotIds: seq.slots[0] ? [seq.slots[0].slotId] : [], startedAt: Date.now(), finished: false
        }
      };
    }
    case 'play/goto': {
      const play = state.play;
      if (!play) return state;
      const seq = state.sequences.find((s) => s.id === play.sequenceId);
      if (!seq) return state;
      const index = Math.max(0, Math.min(seq.slots.length - 1, action.index));
      const slot = seq.slots[index];
      const seen = play.viewedSlotIds.includes(slot.slotId);
      const next = seen ? state : updateSeq(state, seq.id, (s) => ({ ...s, analytics: { ...s.analytics, cardsViewed: s.analytics.cardsViewed + 1 } }));
      return { ...next, play: { ...play, index, viewedSlotIds: seen ? play.viewedSlotIds : [...play.viewedSlotIds, slot.slotId] } };
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
      // The whole sequence is done: record it, check challenges and unlocks.
      const completedCardIds = p.completedSlotIds.flatMap((id) => {
        const s = seq.slots.find((x) => x.slotId === id);
        return s ? [s.cardId, ...s.modifiers] : [];
      });
      next = updateSeq(next, seq.id, (s) => ({ ...s, analytics: { ...s.analytics, completedPlays: s.analytics.completedPlays + 1, completionPercents: [...s.analytics.completionPercents, 100] } }));
      const met = newlyMetChallenges({ trigger: 'sequence-complete', completedCardIds, completionPercent: 100 }, content, next.completedChallengeIds);
      const sig = signature(seq.slots);
      if (seq.signatureAtLastCompletion && editDistance(seq.signatureAtLastCompletion, sig) >= 2) {
        met.push(...newlyMetChallenges({ trigger: 'remix', completedCardIds, completionPercent: 100 }, content, next.completedChallengeIds));
      }
      next = applyChallenges(next, met);
      next = updateSeq(next, seq.id, (s) => ({ ...s, signatureAtLastCompletion: sig }));
      const deckIds = [...new Set(completedCardIds.map((id) => content.cardById[id]).filter((c) => c && c.kind === 'movement').map((c) => (c as { deckId: string }).deckId))];
      const unlocks = findUnlocks(next, content, deckIds);
      return {
        ...next,
        decksCompletedInSequence: [...new Set([...next.decksCompletedInSequence, ...deckIds])],
        unlockedCardIds: [...new Set([...next.unlockedCardIds, ...unlocks.map((u) => u.cardId)])],
        pendingUnlocks: [...next.pendingUnlocks, ...unlocks],
        play: { ...next.play!, finished: true }
      };
    }
    case 'play/exit': {
      const play = state.play;
      if (!play) return { ...state, play: null };
      const seq = state.sequences.find((s) => s.id === play.sequenceId);
      if (!seq || play.finished) return { ...state, play: null };
      const pct = seq.slots.length ? Math.round((play.completedSlotIds.length / seq.slots.length) * 100) : 0;
      return { ...updateSeq(state, seq.id, (s) => ({ ...s, analytics: { ...s.analytics, completionPercents: [...s.analytics.completionPercents, pct] } })), play: null };
    }
    case 'ui/dismissRewards':
      return { ...state, pendingUnlocks: [], pendingChallengeIds: [] };
    case 'ui/seenIntro':
      return { ...state, seenIntro: true };
    case 'theme/set':
      return state.unlockedThemeIds.includes(action.themeId) ? { ...state, themeId: action.themeId } : state;
    case 'pack/install': {
      if (state.installedPackIds.includes(action.packId)) return state;
      const packs = [...state.installedPackIds, action.packId];
      const c = buildContent(packs);
      return {
        ...state,
        installedPackIds: packs,
        unlockedCardIds: [...new Set([...state.unlockedCardIds, ...c.movementCards.filter((m) => m.unlockedByDefault).map((m) => m.id)])],
        unlockedThemeIds: [...new Set([...state.unlockedThemeIds, ...c.themes.filter((t) => t.unlockedByDefault).map((t) => t.id)])]
      };
    }
    case 'pack/uninstall': {
      if (action.packId === 'core') return state;
      const packs = state.installedPackIds.filter((p) => p !== action.packId);
      const c = buildContent(packs);
      const ids = new Set(c.cards.map((x) => x.id));
      return {
        ...state,
        installedPackIds: packs,
        draftSlots: state.draftSlots.filter((s) => ids.has(s.cardId)).map((s) => ({ ...s, modifiers: s.modifiers.filter((m) => ids.has(m)) })),
        themeId: c.themes.some((t) => t.id === state.themeId) ? state.themeId : DEFAULT_THEME,
        play: null
      };
    }
    case 'game/reset':
      return { ...freshState(), seenIntro: true };
    default:
      return state;
  }
}
