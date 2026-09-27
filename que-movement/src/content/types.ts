// The shape of Que Movement content. Everything the game knows about is plain data
// in this shape, so a new Technique branch is added as a data file, never as a screen.

export type Level = 'foundation' | 'working' | 'challenge';
export type Position = 'supine' | 'prone' | 'side-lying' | 'quadruped' | 'kneeling' | 'seated' | 'standing';

export type Dose =
  | { kind: 'reps'; reps: number; perSide?: boolean }
  | { kind: 'hold'; seconds: number; perSide?: boolean };

/** A path of study inside a Technique branch (Bridging, Core, Shoulders). Colours its Qcards. */
export interface Path {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accentVar: string;
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
  pathId: string;
  level: Level;
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
  pathId: string;
  effect: string;
}

export type SpecialCard = TransitionCard | ProgressionCard;
export type Card = MovementCard | SpecialCard;

/** One Technique on the skill tree. Unlocking it creates its Qcard. */
export interface TechniqueNode {
  id: string;
  cardId: string;
  pathId: string;
  /** Position on the tree, in % of the canvas. */
  x: number;
  y: number;
  /** Points to spend. 0 = known from the start. */
  cost: number;
  /** Techniques that must be known first. At least one of them must also have been practised. */
  requires: string[];
  note: string;
}

export interface Branch {
  id: string;
  name: string;
  subtitle: string;
  nodes: TechniqueNode[];
}

export type MilestoneTrigger = 'sequence-saved' | 'sequence-complete' | 'remix' | 'technique' | 'published' | 'deck-made';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  trigger: MilestoneTrigger;
  rule: {
    requiredPathIds?: string[];
    minTransitions?: number;
    minProgressions?: number;
    minCards?: number;
    /** Every Technique on this path is known. */
    masterPath?: string;
  };
  reward: { points?: number; badgeId: string; themeId?: string };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  unlockedByDefault: boolean;
  vars: Record<string, string>;
}

export interface Badge {
  id: string;
  name: string;
  glyph: string;
  description: string;
}

/** Everything the game knows about. */
export interface Content {
  branch: Branch;
  paths: Path[];
  pathById: Record<string, Path>;
  movementCards: MovementCard[];
  specialCards: SpecialCard[];
  cards: Card[];
  cardById: Record<string, Card>;
  nodeById: Record<string, TechniqueNode>;
  nodeByCard: Record<string, TechniqueNode>;
  milestones: Milestone[];
  themes: Theme[];
  badges: Badge[];
}
