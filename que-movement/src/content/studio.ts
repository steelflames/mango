import type { DecorSlot } from '../game/types';

// The Studio's decor: every slot has a few variants, some earned through play.
// Pure data. How each variant is drawn lives in ui/studio/Diorama.tsx.

export interface DecorUnlock {
  badgeId?: string;
  /** Practice Rank reached. */
  rank?: number;
  /** Number of Techniques known. */
  techniques?: number;
  lifetimePoints?: number;
}

export interface DecorVariant {
  id: string;
  name: string;
  unlock?: DecorUnlock;
}

export interface DecorSlotDef {
  slot: DecorSlot;
  label: string;
  variants: DecorVariant[];
}

export const DECOR: DecorSlotDef[] = [
  { slot: 'wall', label: 'Walls', variants: [
    { id: 'linen', name: 'Linen' },
    { id: 'sage', name: 'Sage limewash', unlock: { rank: 3 } },
    { id: 'clay', name: 'Clay plaster', unlock: { rank: 6 } },
    { id: 'dusk', name: 'Dusk blue', unlock: { badgeId: 'full-practice' } }
  ] },
  { slot: 'floor', label: 'Floor', variants: [
    { id: 'oak', name: 'Oak boards' },
    { id: 'walnut', name: 'Walnut', unlock: { rank: 4 } },
    { id: 'ash', name: 'Pale ash', unlock: { badgeId: 'remix' } }
  ] },
  { slot: 'rug', label: 'Rug', variants: [
    { id: 'none', name: 'Bare floor' },
    { id: 'moss', name: 'Moss round', unlock: { rank: 2 } },
    { id: 'terracotta', name: 'Terracotta runner', unlock: { badgeId: 'flow-finder' } },
    { id: 'woven', name: 'Woven stripe', unlock: { badgeId: 'in-the-queue' } }
  ] },
  { slot: 'mat', label: 'Mat', variants: [
    { id: 'sage', name: 'Sage mat' },
    { id: 'clay', name: 'Clay mat', unlock: { badgeId: 'curtain-call' } },
    { id: 'plum', name: 'Plum mat', unlock: { rank: 5 } }
  ] },
  { slot: 'equipment', label: 'Equipment', variants: [
    { id: 'none', name: 'Open floor' },
    { id: 'ball', name: 'Stability ball', unlock: { techniques: 6 } },
    { id: 'chair', name: 'Wunda chair', unlock: { techniques: 9 } },
    { id: 'reformer', name: 'Reformer', unlock: { techniques: 12 } }
  ] },
  { slot: 'plant', label: 'Plant', variants: [
    { id: 'fern', name: 'Boston fern' },
    { id: 'monstera', name: 'Monstera', unlock: { rank: 3 } },
    { id: 'olive', name: 'Olive tree', unlock: { badgeId: 'centre-finder' } }
  ] },
  { slot: 'lamp', label: 'Light', variants: [
    { id: 'lantern', name: 'Paper lantern' },
    { id: 'arc', name: 'Brass arc lamp', unlock: { badgeId: 'steady-shoulders' } },
    { id: 'candles', name: 'Candle cluster', unlock: { badgeId: 'bridge-builder' } }
  ] },
  { slot: 'prop', label: 'Props', variants: [
    { id: 'none', name: 'Nothing out' },
    { id: 'roller', name: 'Foam roller', unlock: { rank: 2 } },
    { id: 'ring', name: 'Magic circle', unlock: { badgeId: 'progressive-thinker' } },
    { id: 'blocks', name: 'Cork blocks', unlock: { rank: 7 } }
  ] }
];

export const DEFAULT_DECOR: Record<DecorSlot, string> = {
  wall: 'linen', floor: 'oak', rug: 'none', mat: 'sage', equipment: 'none', plant: 'fern', lamp: 'lantern', prop: 'none'
};

/** Instructor titles, earned by Techniques known. */
export const TITLES: [number, string][] = [
  [0, 'Newcomer'],
  [6, 'Apprentice'],
  [10, 'Practitioner'],
  [14, 'Instructor'],
  [18, 'Master Teacher']
];
