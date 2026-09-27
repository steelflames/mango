export type ReactionKey = 'creative' | 'sweaty' | 'gentle' | 'educational';

export interface Slot {
  slotId: string;
  cardId: string;
  /** Progression card ids attached to this movement card (up to two). */
  modifiers: string[];
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
}

export interface PlayState {
  sequenceId: string;
  index: number;
  completedSlotIds: string[];
  streak: number;
  bestStreak: number;
  pointsEarned: number;
  startedAt: number;
  finished: boolean;
}

/** A player-made deck inside the Repertoire. */
export interface RepDeck {
  id: string;
  name: string;
  cardIds: string[];
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
  streak: number;
  play: PlayState | null;
  seenIntro: boolean;
}

export type Action =
  | { type: 'draft/name'; name: string }
  | { type: 'draft/add'; cardId: string; index?: number }
  | { type: 'draft/attach'; slotId: string; cardId: string }
  | { type: 'draft/detach'; slotId: string; cardId: string }
  | { type: 'draft/move'; from: number; to: number }
  | { type: 'draft/remove'; slotId: string }
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
  | { type: 'play/complete' }
  | { type: 'play/exit' }
  | { type: 'ui/dismissReveal' }
  | { type: 'ui/dismissMilestones' }
  | { type: 'ui/seenIntro' }
  | { type: 'theme/set'; themeId: string }
  | { type: 'studio/name'; name: string }
  | { type: 'studio/decor'; slot: DecorSlot; variant: string }
  | { type: 'game/reset' };
