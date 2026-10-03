import type { GuestNote } from '../content/community';
import type { Preset, QuestType } from '../content/quests';

export type ReactionKey = 'creative' | 'sweaty' | 'gentle' | 'educational';

export interface Slot {
  slotId: string;
  cardId: string;
  /** Progression card ids attached to this movement card (up to two). */
  modifiers: string[];
  /** Seconds this step takes, learned from performing it or set by hand. */
  durationOverride?: number;
  /** Ran well short of plan once. A second real short run is what changes the time. */
  shortSeen?: boolean;
}

export interface Analytics {
  plays: number;
  completedPlays: number;
  completionPercents: number[];
}

export interface Sequence {
  id: string;
  name: string;
  author: string;
  /** The creator's Studio, shown In the Queue. */
  studio?: string;
  /** A line from the creator. */
  note?: string;
  seeded?: boolean;
  slots: Slot[];
  createdAt: number;
  updatedAt: number;
  published: boolean;
  publishedAt?: number;
  reactions: Record<ReactionKey, number>;
  myReaction: ReactionKey | null;
  analytics: Analytics;
  community?: { plays: number; saves: number };
  signatureAtLastCompletion?: string[];
  /** Harmonies this Sequence has already paid out. Each pays once per Sequence. */
  harmoniesEarned?: string[];
  /** When it was last saved (built or saved from the Queue). */
  savedAt?: number;
}

export interface PlayState {
  sequenceId: string;
  index: number;
  completedSlotIds: string[];
  pointsEarned: number;
  startedAt: number;
  finished: boolean;
  /** Harmonies met, paid out when the last card is completed. */
  harmonyIds?: string[];
  /** Of those, the ones paid for the first time. */
  newHarmonyIds?: string[];
  harmonyPoints?: number;
  flatPoints?: number;
  peakPoints?: number;
  /** The last step whose time was learned, for a gentle note. */
  learned?: { slotId: string; seconds: number } | null;
}

/** A player-made deck inside the Repertoire. */
export interface RepDeck {
  id: string;
  name: string;
  cardIds: string[];
  /** Filed away in the Deck Library rather than in one of the six slots. */
  filed?: boolean;
}

/** A newly learned Technique, waiting to be revealed as a Qcard. */
export interface PendingReveal {
  cardId: string;
}

export type DecorSlot = 'wall' | 'floor' | 'rug' | 'mat' | 'equipment' | 'plant' | 'lamp' | 'prop';

export interface GameState {
  version: 4;
  /** Qcards you own: learned Techniques plus the starter transitions. */
  ownedCardIds: string[];
  /** Points to spend on Techniques. */
  points: number;
  /** Every point ever earned (Studio shows it; spending never lowers it). */
  lifetimePoints: number;
  completedCounts: Record<string, number>;
  sequences: Sequence[];
  draftName: string;
  draftSlots: Slot[];
  draftSourceId: string | null;
  decks: RepDeck[];
  primaryDeckId: string;
  archivedCardIds: string[];
  /** Sequences saved from In the Queue. */
  savedSequenceIds: string[];
  pinnedSequenceId: string | null;
  completedMilestoneIds: string[];
  badgeIds: string[];
  pendingMilestoneIds: string[];
  pendingReveals: PendingReveal[];
  themeId: string;
  unlockedThemeIds: string[];
  studioName: string;
  decor: Record<DecorSlot, string>;
  play: PlayState | null;
  seenIntro: boolean;
  /** Highest Practice Rank whose gift has been claimed. */
  rankClaimed: number;
  quests: {
    day: string;
    active: string[];
    /** Clears today; the first few pay. */
    cleared: number;
    count: number;
    types: QuestType[];
    preset: Preset;
  };
  /** The quest just cleared, for a moment's ribbon. */
  questFlash: { id: string; points: number } | null;
  profile: { bio: string; mood: string; top8: string[] };
  guestbook: GuestNote[];
  /** Teacher standing: left by visitors to your Studio. */
  kudos: number;
  studioHours: { day: string; visits: number };
  clients: Client[];
  sent: SentPlan[];
}

export interface Client {
  id: string;
  name: string;
  focus: string;
}

export interface SentPlan {
  id: string;
  clientId: string;
  sequenceId: string;
  sequenceName: string;
  note: string;
  at: number;
}

export type Action =
  | { type: 'draft/name'; name: string }
  | { type: 'draft/add'; cardId: string; index?: number }
  | { type: 'draft/attach'; slotId: string; cardId: string }
  | { type: 'draft/detach'; slotId: string; cardId: string }
  | { type: 'draft/move'; from: number; to: number }
  | { type: 'draft/remove'; slotId: string }
  | { type: 'draft/insertSlot'; slot: Slot; index: number }
  | { type: 'draft/clear' }
  | { type: 'draft/new' }
  | { type: 'draft/load'; sequenceId: string }
  | { type: 'sequence/save' }
  | { type: 'sequence/saveAndStart' }
  | { type: 'sequence/publish'; sequenceId: string }
  | { type: 'sequence/react'; sequenceId: string; reaction: ReactionKey }
  | { type: 'sequence/remix'; sequenceId: string }
  | { type: 'sequence/delete'; sequenceId: string }
  | { type: 'sequence/toggleSaved'; sequenceId: string }
  | { type: 'sequence/pin'; sequenceId: string | null }
  | { type: 'technique/unlock'; nodeId: string }
  | { type: 'deck/create'; deckId: string; name: string; cardIds?: string[] }
  | { type: 'deck/rename'; deckId: string; name: string }
  | { type: 'deck/delete'; deckId: string }
  | { type: 'deck/primary'; deckId: string }
  | { type: 'deck/add'; deckId: string; cardId: string }
  | { type: 'deck/remove'; deckId: string; cardId: string }
  | { type: 'card/archive'; cardId: string }
  | { type: 'card/restore'; cardId: string }
  | { type: 'play/start'; sequenceId: string }
  | { type: 'play/goto'; index: number }
  | { type: 'play/complete'; elapsed?: number }
  | { type: 'play/exit' }
  | { type: 'ui/dismissReveal' }
  | { type: 'ui/dismissMilestones' }
  | { type: 'ui/seenIntro' }
  | { type: 'theme/set'; themeId: string }
  | { type: 'studio/name'; name: string }
  | { type: 'studio/decor'; slot: DecorSlot; variant: string }
  | { type: 'profile/bio'; bio: string }
  | { type: 'profile/mood'; mood: string }
  | { type: 'profile/top8'; creatorId: string }
  | { type: 'studio/visit'; from: string; studio: string; text: string }
  | { type: 'client/add'; id: string; name: string; focus: string }
  | { type: 'client/remove'; id: string }
  | { type: 'client/send'; clientId: string; sequenceId: string; note: string }
  | { type: 'rank/claim' }
  | { type: 'quests/refresh' }
  | { type: 'quest/done'; id: string }
  | { type: 'quest/skip'; id: string }
  | { type: 'quests/settings'; count?: number; types?: QuestType[]; preset?: Preset }
  | { type: 'ui/dismissQuest' }
  | { type: 'deck/move'; deckId: string; dir: -1 | 1 }
  | { type: 'deck/file'; deckId: string }
  | { type: 'deck/unfile'; deckId: string; swapWith?: string }
  | { type: 'sequence/slotTime'; sequenceId: string; slotId: string; seconds: number }
  | { type: 'sequence/reorder'; sequenceId: string; from: number; to: number }
  | { type: 'game/reset' };
