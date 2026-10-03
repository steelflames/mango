import { CONTENT } from '../content/content';
import { RULES } from '../content/catalog';
import { STARTER_TRANSITIONS } from '../content/mat';
import { rankGift, todayKey } from '../content/progress';
import { drawQuest, PAID_CLEARS_PER_DAY, PRESETS, questById, type QuestEvent } from '../content/quests';
import { seedSequences } from '../content/seeds';
import { VISITS_PER_DAY, WELCOME_NOTES, type GuestNote } from '../content/community';
import { DECOR, DEFAULT_DECOR } from '../content/studio';
import type { Content } from '../content/types';
import {
  addPoints, checkMilestones, decorOpen, editDistance, emptyAnalytics, newSlot, rankOf, readNode,
  FLAT_RATE, PEAK_POINTS, round15, signature, simulatedAudience, viewSlot
} from './rules';
import { peakSlotIds, readHarmonies } from './harmonies';
import type { Action, GameState, PlayState, Sequence } from './types';

export const STORAGE_KEY = 'que-movement:v4';
export const DEFAULT_THEME = 'night-market';
export const PRIMARY_DECK = 'd-primary';
/** Custom deck slots on the shelf; the rest live in the Deck Library. */
export const DECK_SLOTS = 6;
/** Below this, finishing a card is a tap-through, not a real run of it. */
const MIN_REAL_SECONDS = 10;

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
    play: null,
    seenIntro: false,
    rankClaimed: 1,
    quests: freshQuests(),
    questFlash: null,
    profile: { bio: '', mood: 'unhurried', top8: ['pip', 'wren'] },
    guestbook: [...WELCOME_NOTES],
    kudos: 0,
    studioHours: { day: todayKey(), visits: 0 },
    clients: [
      { id: 'c-maya', name: 'Maya', focus: 'Lower back, desk job' },
      { id: 'c-ruth', name: 'Ruth', focus: 'Balance and bone density' }
    ],
    sent: []
  };
}

function freshQuests(prev?: GameState['quests']): GameState['quests'] {
  const preset = prev?.preset ?? 'everything';
  const def = PRESETS.find((p) => p.id === preset)!;
  const types = prev?.types ?? def.types;
  const count = prev?.count ?? def.count;
  const active: string[] = [];
  for (let i = 0; i < count; i += 1) { const q = drawQuest(types, preset, active); if (q) active.push(q); }
  return { day: todayKey(), active, cleared: 0, count, types, preset };
}

/** A new day: fresh quests, the paid-clears counter back to zero. Settings carry over. */
function today(state: GameState): GameState {
  return state.quests?.day === todayKey() ? state : { ...state, quests: freshQuests(state.quests) };
}

/** Clear a quest: pay it (while today's paid clears last) and draw another in its place. */
function clearQuest(state: GameState, id: string, paid: boolean): GameState {
  const q = state.quests;
  if (!q.active.includes(id)) return state;
  const def = questById(id);
  const pays = paid && q.cleared < PAID_CLEARS_PER_DAY ? def?.points ?? 0 : 0;
  const rest = q.active.filter((x) => x !== id);
  const next = drawQuest(q.types, q.preset, [...rest, id]);
  const active = q.active.map((x) => (x === id ? next : x)).filter(Boolean) as string[];
  return {
    ...state,
    ...(pays ? addPoints(state, pays) : {}),
    quests: { ...q, active, cleared: paid ? q.cleared + 1 : q.cleared },
    questFlash: paid ? { id, points: pays } : state.questFlash
  };
}

/** In-app quests clear themselves when what they ask for happens. */
function intend(state: GameState, events: QuestEvent[]): GameState {
  let next = today(state);
  for (const e of events) {
    const hit = next.quests.active.find((id) => questById(id)?.event === e);
    if (hit) next = clearQuest(next, hit, true);
  }
  return next;
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
    return today({ ...base, ...saved, decor: { ...base.decor, ...saved.decor }, sequences: [...sequences, ...missingSeeds] });
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

const copySlots = (slots: Sequence['slots']) => slots.map((s) => ({ ...newSlot(s.cardId), modifiers: [...s.modifiers], durationOverride: s.durationOverride }));

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
    case 'draft/insertSlot': {
      if (state.draftSlots.length >= RULES.maxSteps) return state;
      const slots = [...state.draftSlots];
      slots.splice(Math.max(0, Math.min(slots.length, action.index)), 0, action.slot);
      return { ...state, draftSlots: slots };
    }
    case 'draft/clear':
      return { ...state, draftSlots: [] };
    case 'draft/new':
      return { ...state, draftSlots: [], draftName: '', draftSourceId: null };
    case 'draft/load': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq) return state;
      return { ...state, draftSlots: copySlots(seq.slots), draftName: seq.name, draftSourceId: seq.seeded ? null : seq.id };
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
        next = updateSeq(state, id, (s) => ({ ...s, name, slots, updatedAt: now, savedAt: now }));
      } else {
        const seq = { ...newSequence(name, slots, now), savedAt: now };
        id = seq.id;
        next = { ...state, sequences: [seq, ...state.sequences] };
      }
      return intend(checkMilestones({ ...next, draftSourceId: id, draftName: name }, { trigger: 'sequence-saved' }, content), ['save']);
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
      return { ...state, sequences: [seq, ...state.sequences], draftSlots: copySlots(seq.slots), draftName: seq.name, draftSourceId: seq.id };
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
      const next = updateSeq(state, action.sequenceId, (s) => ({ ...(s.community ? { ...s, community: { ...s.community, saves: s.community.saves + (on ? -1 : 1) } } : s), savedAt: on ? s.savedAt : Date.now() }));
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
      return intend(checkMilestones(next, { trigger: 'technique' }, content), ['learn']);
    }

    case 'deck/create': {
      const full = state.decks.filter((d) => !d.filed).length >= DECK_SLOTS;
      const decks = [...state.decks, { id: action.deckId, name: action.name, cardIds: action.cardIds ?? [], filed: full }];
      return checkMilestones({ ...state, decks }, { trigger: 'deck-made' }, content);
    }
    case 'deck/rename':
      return { ...state, decks: state.decks.map((d) => (d.id === action.deckId ? { ...d, name: action.name } : d)) };
    case 'deck/delete': {
      if (state.decks.length <= 1) return state;
      const decks = state.decks.filter((d) => d.id !== action.deckId);
      return { ...state, decks, primaryDeckId: state.primaryDeckId === action.deckId ? decks[0].id : state.primaryDeckId };
    }
    case 'deck/move': {
      const shelf = state.decks.filter((d) => !d.filed);
      const i = shelf.findIndex((d) => d.id === action.deckId);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= shelf.length) return state;
      [shelf[i], shelf[j]] = [shelf[j], shelf[i]];
      return { ...state, decks: [...shelf, ...state.decks.filter((d) => d.filed)] };
    }
    case 'deck/file':
      if (action.deckId === state.primaryDeckId) return state;
      return { ...state, decks: state.decks.map((d) => (d.id === action.deckId ? { ...d, filed: true } : d)) };
    case 'deck/unfile': {
      const shelf = state.decks.filter((d) => !d.filed);
      if (shelf.length >= DECK_SLOTS && (!action.swapWith || action.swapWith === state.primaryDeckId)) return state;
      return { ...state, decks: state.decks.map((d) => (d.id === action.deckId ? { ...d, filed: false } : d.id === action.swapWith ? { ...d, filed: true } : d)) };
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
        play: { sequenceId: seq.id, index: 0, completedSlotIds: [], pointsEarned: 0, startedAt: Date.now(), finished: false, learned: null }
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
      const earned = peakSlotIds(seq.slots, content).includes(slot.slotId) ? PEAK_POINTS : 0;
      const counts = { ...state.completedCounts };
      for (const id of [view.card.id, ...view.modifiers.map((m) => m.id)]) counts[id] = (counts[id] ?? 0) + 1;
      // Time learns from you. Longer than planned is learned at once: you needed it. Shorter has to
      // happen twice, and a tap-through under 10 s never counts, so skipping ahead can't shrink a class.
      let learned: PlayState['learned'] = null;
      let shortSeen = false;
      const el = action.elapsed;
      const off = el !== undefined && Math.abs(el - view.duration) >= Math.max(15, view.duration * 0.25);
      if (off && el! > view.duration) learned = { slotId: slot.slotId, seconds: round15(el!) };
      else if (off && el! >= MIN_REAL_SECONDS) {
        if (slot.shortSeen) learned = { slotId: slot.slotId, seconds: round15(el!) };
        else shortSeen = true;
      }
      if (learned && learned.seconds === view.duration) learned = null;
      let next: GameState = {
        ...state,
        ...addPoints(state, earned),
        completedCounts: counts,
        play: { ...play, pointsEarned: play.pointsEarned + earned, peakPoints: (play.peakPoints ?? 0) + earned, completedSlotIds: [...play.completedSlotIds, slot.slotId], learned }
      };
      const tapThrough = el !== undefined && el < MIN_REAL_SECONDS;
      if (!tapThrough && (learned || shortSeen || slot.shortSeen)) {
        next = updateSeq(next, seq.id, (s) => ({ ...s, slots: s.slots.map((x) => (x.slotId !== slot.slotId ? x : { ...x, durationOverride: learned ? learned.seconds : x.durationOverride, shortSeen: shortSeen || undefined })) }));
      }
      const p = next.play!;
      if (p.completedSlotIds.length !== seq.slots.length) return next;
      // The whole Sequence is done: the teachers score it, then record it and check milestones.
      const completedCardIds = seq.slots.flatMap((s) => [s.cardId, ...s.modifiers]);
      const readings = readHarmonies(seq.slots, content, next.ownedCardIds);
      const met = readings.filter((r) => r.status === 'met');
      const already = seq.harmoniesEarned ?? [];
      const fresh = met.filter((r) => !already.includes(r.def.id));
      const bonus = fresh.reduce((a, r) => a + r.def.points, 0);
      next = { ...next, ...addPoints(next, bonus + FLAT_RATE), play: { ...p, pointsEarned: p.pointsEarned + bonus + FLAT_RATE, harmonyIds: met.map((r) => r.def.id), newHarmonyIds: fresh.map((r) => r.def.id), harmonyPoints: bonus, flatPoints: FLAT_RATE } };
      next = updateSeq(next, seq.id, (s) => ({ ...s, harmoniesEarned: [...already, ...fresh.map((r) => r.def.id)] }));
      next = updateSeq(next, seq.id, (s) => ({ ...s, analytics: { ...s.analytics, completedPlays: s.analytics.completedPlays + 1, completionPercents: [...s.analytics.completionPercents, 100] } }));
      next = checkMilestones(next, { trigger: 'sequence-complete', completedCardIds, harmonies: met.length }, content);
      const sig = signature(seq.slots);
      if (seq.signatureAtLastCompletion && editDistance(seq.signatureAtLastCompletion, sig) >= 2) next = checkMilestones(next, { trigger: 'remix', completedCardIds }, content);
      next = updateSeq(next, seq.id, (s) => ({ ...s, signatureAtLastCompletion: sig }));
      const metIds = met.map((r) => r.def.id);
      const events: QuestEvent[] = ['perform'];
      if (seq.slots.some((sl) => sl.cardId.includes('bridge'))) events.push('bridge');
      if (met.length >= 3) events.push('harmony-3');
      if (metIds.includes('counterpose')) events.push('counterpose');
      if (metIds.includes('arrive') && metIds.includes('settle')) events.push('arrive-settle');
      if (seq.slots.some((sl) => content.cardById[sl.cardId]?.kind === 'transition')) events.push('transition');
      if (seq.slots.length >= 5) events.push('five-cards');
      if (seq.seeded) events.push('queue-try');
      next = intend(next, events);
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
      return intend({ ...state, decor: { ...state.decor, [action.slot]: action.variant } }, ['studio']);
    }
    case 'profile/bio':
      return { ...state, profile: { ...state.profile, bio: action.bio } };
    case 'profile/mood':
      return { ...state, profile: { ...state.profile, mood: action.mood } };
    case 'profile/top8': {
      const t = state.profile.top8;
      const top8 = t.includes(action.creatorId) ? t.filter((id) => id !== action.creatorId) : t.length >= 8 ? t : [...t, action.creatorId];
      return { ...state, profile: { ...state.profile, top8 } };
    }
    case 'studio/visit': {
      const hours = state.studioHours.day === todayKey() ? state.studioHours : { day: todayKey(), visits: 0 };
      if (hours.visits >= VISITS_PER_DAY) return state;
      const note: GuestNote = { id: `g-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, from: action.from, studio: action.studio, text: action.text, at: Date.now() };
      return { ...state, kudos: state.kudos + 1, studioHours: { ...hours, visits: hours.visits + 1 }, guestbook: [note, ...state.guestbook].slice(0, 40) };
    }
    case 'client/add':
      return { ...state, clients: [...state.clients, { id: action.id, name: action.name, focus: action.focus }] };
    case 'client/remove':
      return { ...state, clients: state.clients.filter((c) => c.id !== action.id) };
    case 'client/send': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq || !state.clients.some((c) => c.id === action.clientId)) return state;
      const plan = { id: `p-${Date.now().toString(36)}`, clientId: action.clientId, sequenceId: seq.id, sequenceName: seq.name, note: action.note, at: Date.now() };
      return intend({ ...state, sent: [plan, ...state.sent].slice(0, 60) }, ['send']);
    }
    case 'rank/claim': {
      const { rank } = rankOf(state.lifetimePoints);
      if (state.rankClaimed >= rank) return state;
      const next = state.rankClaimed + 1;
      return { ...state, ...addPoints(state, rankGift(next)), rankClaimed: next };
    }
    case 'quests/refresh':
      return today(state);
    case 'quest/done':
      return clearQuest(today(state), action.id, true);
    case 'quest/skip':
      return clearQuest(today(state), action.id, false);
    case 'quests/settings': {
      const q = today(state).quests;
      const preset = action.preset ?? q.preset;
      const def = PRESETS.find((p) => p.id === preset)!;
      const types = action.types ?? (action.preset ? def.types : q.types);
      const count = Math.max(1, Math.min(5, action.count ?? (action.preset ? def.count : q.count)));
      if (!types.length) return state;
      const keep = q.active.filter((id) => { const t = questById(id); return t && types.includes(t.type); }).slice(0, count);
      while (keep.length < count) { const d = drawQuest(types, preset, keep); if (!d) break; keep.push(d); }
      return { ...state, quests: { ...q, preset, types, count, active: keep } };
    }
    case 'ui/dismissQuest':
      return { ...state, questFlash: null };
    case 'sequence/slotTime':
      return updateSeq(state, action.sequenceId, (s) => ({ ...s, slots: s.slots.map((x) => (x.slotId === action.slotId ? { ...x, durationOverride: Math.max(15, Math.min(600, action.seconds)), shortSeen: undefined } : x)) }));
    case 'sequence/reorder': {
      const seq = state.sequences.find((s) => s.id === action.sequenceId);
      if (!seq) return state;
      const slots = [...seq.slots];
      if (action.from < 0 || action.from >= slots.length) return state;
      const current = state.play?.sequenceId === seq.id ? slots[state.play.index]?.slotId : undefined;
      const [it] = slots.splice(action.from, 1);
      slots.splice(Math.max(0, Math.min(slots.length, action.to)), 0, it);
      let next = updateSeq(state, seq.id, (s) => ({ ...s, slots, updatedAt: Date.now() }));
      if (current && next.play) next = { ...next, play: { ...next.play, index: slots.findIndex((x) => x.slotId === current) } };
      if (state.draftSourceId === seq.id) next = { ...next, draftSlots: slots.map((x) => ({ ...x })) };
      return next;
    }
    case 'game/reset':
      return { ...freshState(), seenIntro: true };
    default:
      return state;
  }
}
