// The shape of Q Movement content. Every pack is plain data in this shape,
// so new packs (Classical Mat, Reformer…) are added as data files, never as screens.

export type Level = 'foundation' | 'working' | 'challenge';
export type Position = 'supine' | 'prone' | 'side-lying' | 'quadruped' | 'kneeling' | 'seated' | 'standing';

export type Dose =
  | { kind: 'reps'; reps: number; perSide?: boolean }
  | { kind: 'hold'; seconds: number; perSide?: boolean };

export interface Deck {
  id: string;
  name: string;
  tagline: string;
  description: string;
  regionId: string;
  accentVar: string;
  artKey: string;
  packId: string;
}

interface CardBase {
  id: string;
  name: string;
  shortCue: string;
  movementGoal: string;
  points: number;
  art: string;
  duration: number;
}

export interface MovementCard extends CardBase {
  kind: 'movement';
  deckId: string;
  level: Level;
  unlockedByDefault: boolean;
  requirements: string[];
  position: Position;
  dose: Dose;
}

export interface TransitionCard extends CardBase {
  kind: 'transition';
  from: Position[];
  to: Position[];
}

export interface ProgressionCard extends CardBase {
  kind: 'progression';
  effect: string;
}

export type SpecialCard = TransitionCard | ProgressionCard;
export type Card = MovementCard | SpecialCard;

export type ChallengeTrigger = 'sequence-saved' | 'sequence-complete' | 'remix';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  detail: string;
  trigger: ChallengeTrigger;
  rule: {
    requiredCardIds?: string[];
    requiredDeckIds?: string[];
    minTransitions?: number;
    minProgressions?: number;
    minCards?: number;
    requireFullCompletion?: boolean;
  };
  reward: { points?: number; badgeId?: string; themeId?: string; unlocksCardId?: string };
  packId: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  packId: string;
  unlockedByDefault: boolean;
  vars: Record<string, string>;
}

export interface RegionNode {
  id: string;
  label: string;
  x: number;
  y: number;
  note: string;
  concept?: boolean;
  cardId?: string;
  deckId?: string;
}

export interface Region {
  id: string;
  name: string;
  subtitle: string;
  accentVar: string;
  packId: string;
  nodes: RegionNode[];
  links: [string, string][];
}

export interface Expansion {
  id: string;
  name: string;
  description: string;
  deckIds: string[];
  themeId?: string;
  installedByDefault: boolean;
  available: boolean;
}

export interface Badge {
  id: string;
  name: string;
  glyph: string;
  description: string;
}

export interface Pack {
  id: string;
  decks: Deck[];
  movementCards: MovementCard[];
  specialCards: SpecialCard[];
  challenges: Challenge[];
  themes: Theme[];
  regions: Region[];
}

/** Everything the installed packs add up to. */
export interface Content {
  packIds: string[];
  decks: Deck[];
  movementCards: MovementCard[];
  specialCards: SpecialCard[];
  cards: Card[];
  cardById: Record<string, Card>;
  deckById: Record<string, Deck>;
  challenges: Challenge[];
  themes: Theme[];
  regions: Region[];
  expansions: Expansion[];
  badges: Badge[];
  /** Every movement card that exists in any pack, installed or not (the Q Map needs this). */
  allMovementCards: MovementCard[];
  allDecks: Deck[];
}
