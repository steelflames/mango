import type { Card, Content } from './types';
import { branch, movementCards, paths, specialCards } from './mat';
import { badges, milestones, themes } from './catalog';

const cards: Card[] = [...movementCards, ...specialCards];

/** Everything the game knows about, indexed once. */
export const CONTENT: Content = {
  branch,
  paths,
  pathById: Object.fromEntries(paths.map((p) => [p.id, p])),
  movementCards,
  specialCards,
  cards,
  cardById: Object.fromEntries(cards.map((c) => [c.id, c])),
  nodeById: Object.fromEntries(branch.nodes.map((n) => [n.id, n])),
  nodeByCard: Object.fromEntries(branch.nodes.map((n) => [n.cardId, n])),
  milestones,
  themes,
  badges
};

export const POSITION_LABEL: Record<string, string> = {
  supine: 'Supine',
  prone: 'Prone',
  'side-lying': 'Side-lying',
  quadruped: 'Quadruped',
  kneeling: 'Kneeling',
  seated: 'Seated',
  standing: 'Standing'
};

export const LEVEL_LABEL = { foundation: 'Foundation', working: 'Working', challenge: 'Challenge' } as const;
export const LEVEL_ORDER = { foundation: 0, working: 1, challenge: 2 } as const;
