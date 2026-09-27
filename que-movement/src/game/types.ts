import type { Level } from '../content/types';

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
  rewatches: number;
  cardsViewed: number;
  completionPercents: number[];
}

export interface Sequence {
  id: string;
  name: string;
  author: string;
  seeded?: boolean;
  slots: Slot[];
  createdAt: number;
  updatedAt: number;
  published: boolean;
  publishedAt?: number;
  reactions: Record<ReactionKey, number>;
  myReaction: ReactionKey | null;
  analytics: Analytics;
  community?: { plays: number; completedPlays: number; rewatches: number };
  signatureAtLastCompletion?: string[];
}

export interface PlayState {
  sequenceId: string;
  index: number;
  completedSlotIds: string[];
  streak: number;
  bestStreak: number;
  pointsEarned: number;
  viewedSlotIds: string[];
  startedAt: number;
  finished: boolean;
}

export interface PendingUnlock {
  cardId: string;
  cardName: string;
  level: Level;
  deckName: string;
  message: string;
}

/** Player-made folders for saved sequences. Anything not in a folder lives in "My builds". */
export interface Folder {
  id: string;
  name: string;
  sequenceIds: string[];
}

export interface GameState {
  version: 3;
  unlockedCardIds: string[];
  completedCounts: Record<string, number>;
  totalPoints: number;
  countedPoints: number;
  sequences: Sequence[];
  draftName: string;
  draftSlots: Slot[];
  draftSourceId: string | null;
  completedChallengeIds: string[];
  badgeIds: string[];
  themeId: string;
  unlockedThemeIds: string[];
  installedPackIds: string[];
  streak: number;
  play: PlayState | null;
  pendingUnlocks: PendingUnlock[];
  pendingChallengeIds: string[];
  decksCompletedInSequence: string[];
  seenIntro: boolean;
  folders: Folder[];
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
  | { type: 'sequence/save'; folderId?: string }
  | { type: 'sequence/saveAndStart' }
  | { type: 'sequence/publish'; sequenceId: string }
  | { type: 'sequence/react'; sequenceId: string; reaction: ReactionKey }
  | { type: 'sequence/copy'; sequenceId: string }
  | { type: 'sequence/delete'; sequenceId: string }
  | { type: 'folder/create'; folderId: string; name: string; sequenceId?: string }
  | { type: 'folder/move'; sequenceId: string; folderId: string }
  | { type: 'folder/delete'; folderId: string }
  | { type: 'play/start'; sequenceId: string }
  | { type: 'play/goto'; index: number }
  | { type: 'play/complete' }
  | { type: 'play/exit' }
  | { type: 'ui/dismissRewards' }
  | { type: 'ui/seenIntro' }
  | { type: 'theme/set'; themeId: string }
  | { type: 'pack/install'; packId: string }
  | { type: 'pack/uninstall'; packId: string }
  | { type: 'game/reset' };

export const MY_BUILDS = 'f-mine';
