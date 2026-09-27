import type { Card, Content, Pack } from './types';
import { corePack } from './packs/core';
import { balancePack } from './packs/balance';
import { badges, expansions } from './catalog';

/** Every pack the game knows about. Add a pack here and it appears everywhere. */
export const PACKS: Pack[] = [corePack, balancePack];

const cache = new Map<string, Content>();

/** Build the content for a set of installed packs (memoised by the set). */
export function buildContent(installed: string[]): Content {
  const ids = [...new Set(installed)].sort();
  const key = ids.join('|');
  const hit = cache.get(key);
  if (hit) return hit;
  const on = PACKS.filter((p) => ids.includes(p.id));
  const decks = on.flatMap((p) => p.decks);
  const movementCards = on.flatMap((p) => p.movementCards);
  const specialCards = on.flatMap((p) => p.specialCards);
  const cards: Card[] = [...movementCards, ...specialCards];
  const content: Content = {
    packIds: ids,
    decks,
    movementCards,
    specialCards,
    cards,
    cardById: Object.fromEntries(cards.map((c) => [c.id, c])),
    deckById: Object.fromEntries(decks.map((d) => [d.id, d])),
    challenges: on.flatMap((p) => p.challenges),
    themes: on.flatMap((p) => p.themes),
    regions: on.flatMap((p) => p.regions),
    expansions,
    badges,
    allMovementCards: PACKS.flatMap((p) => p.movementCards),
    allDecks: PACKS.flatMap((p) => p.decks)
  };
  cache.set(key, content);
  return content;
}

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

/** Which pack a card id belongs to (installed or not). */
export function packOfCard(cardId: string): Pack | undefined {
  return PACKS.find((p) => p.movementCards.some((c) => c.id === cardId) || p.specialCards.some((c) => c.id === cardId));
}
