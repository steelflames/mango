// Sorting and grouping for the Builder's card library — the "music library" half.
import { LEVEL_LABEL, LEVEL_ORDER, POSITION_LABEL } from '../../content/content';
import type { Card, Content, Position } from '../../content/types';
import { doseWithSetup } from '../../game/rules';
import type { BuilderView } from '../../ui/nav';

export interface Group { key: string; title: string; sub?: string; cards: Card[] }

export const POSITION_ORDER: Position[] = ['supine', 'prone', 'side-lying', 'quadruped', 'kneeling', 'seated', 'standing'];

export const SORTS: { key: BuilderView['sortBy']; label: string; up: string; down: string }[] = [
  { key: 'deck', label: 'Deck', up: 'Deck order', down: 'Reverse deck order' },
  { key: 'level', label: 'Level', up: 'Foundation first', down: 'Challenge first' },
  { key: 'position', label: 'Position', up: 'Lying down first', down: 'Standing first' },
  { key: 'time', label: 'Time', up: 'Shortest first', down: 'Longest first' },
  { key: 'az', label: 'A–Z', up: 'A to Z', down: 'Z to A' }
];

export function cardSeconds(card: Card): number {
  return card.kind === 'movement' ? doseWithSetup(card.dose) : card.duration;
}

export function collectionName(coll: string, content: Content): string {
  if (coll === 'all') return 'All movements';
  if (coll === 'transition') return 'Transitions';
  if (coll === 'progression') return 'Progressions';
  return content.deckById[coll]?.name ?? 'Cards';
}

export function collections(content: Content): string[] {
  return ['all', ...content.decks.map((d) => d.id), 'transition', 'progression'];
}

export function collectionCards(coll: string, content: Content): Card[] {
  if (coll === 'transition') return content.specialCards.filter((c) => c.kind === 'transition');
  if (coll === 'progression') return content.specialCards.filter((c) => c.kind === 'progression');
  if (coll === 'all') return content.movementCards;
  return content.movementCards.filter((c) => c.deckId === coll);
}

function matches(card: Card, q: string, content: Content): boolean {
  if (!q) return true;
  const hay = [card.name, card.shortCue, card.movementGoal];
  if (card.kind === 'movement') hay.push(POSITION_LABEL[card.position], LEVEL_LABEL[card.level], content.deckById[card.deckId]?.name ?? '');
  if (card.kind === 'transition') hay.push(...card.from.map((p) => POSITION_LABEL[p]), ...card.to.map((p) => POSITION_LABEL[p]));
  if (card.kind === 'progression') hay.push(card.effect);
  return hay.join(' ').toLowerCase().includes(q.toLowerCase());
}

const levelOf = (c: Card) => (c.kind === 'movement' ? LEVEL_ORDER[c.level] : 0);
const deckIndex = (c: Card, content: Content) => (c.kind === 'movement' ? content.decks.findIndex((d) => d.id === c.deckId) : 99);
const posOf = (c: Card): Position => (c.kind === 'movement' ? c.position : c.kind === 'transition' ? c.from[0] : 'supine');

export function libraryGroups(view: BuilderView, content: Content): { groups: Group[]; count: number } {
  const q = view.query.trim();
  let cards = collectionCards(view.coll, content).filter((c) => matches(c, q, content));
  if (view.level !== 'all') cards = cards.filter((c) => c.kind !== 'movement' || c.level === view.level);
  const dir = view.sortDir;
  const byName = (a: Card, b: Card) => a.name.localeCompare(b.name);
  const count = cards.length;
  const special = view.coll === 'transition' || view.coll === 'progression';

  if (view.sortBy === 'time') return { count, groups: [{ key: 'time', title: dir === 1 ? 'Shortest first' : 'Longest first', cards: [...cards].sort((a, b) => (cardSeconds(a) - cardSeconds(b)) * dir || byName(a, b)) }] };
  if (view.sortBy === 'az' || (special && view.sortBy !== 'position')) {
    return { count, groups: [{ key: 'az', title: special ? collectionName(view.coll, content) : dir === 1 ? 'A to Z' : 'Z to A', cards: [...cards].sort((a, b) => byName(a, b) * dir) }] };
  }
  if (view.sortBy === 'level') {
    const levels = (['foundation', 'working', 'challenge'] as const).slice();
    if (dir === -1) levels.reverse();
    return {
      count,
      groups: levels.map((l) => ({
        key: l, title: LEVEL_LABEL[l],
        sub: l === 'foundation' ? 'Complete on its own' : 'Another way in',
        cards: cards.filter((c) => c.kind === 'movement' && c.level === l).sort((a, b) => deckIndex(a, content) - deckIndex(b, content))
      })).filter((g) => g.cards.length)
    };
  }
  if (view.sortBy === 'position') {
    const order = dir === 1 ? POSITION_ORDER : [...POSITION_ORDER].reverse();
    return {
      count,
      groups: order.map((p) => ({
        key: p, title: POSITION_LABEL[p],
        cards: cards.filter((c) => posOf(c) === p).sort((a, b) => levelOf(a) - levelOf(b) || byName(a, b))
      })).filter((g) => g.cards.length)
    };
  }
  // by deck
  const decks = content.decks.filter((d) => cards.some((c) => c.kind === 'movement' && c.deckId === d.id));
  if (dir === -1) decks.reverse();
  return {
    count,
    groups: decks.map((d) => {
      const dc = cards.filter((c) => c.kind === 'movement' && c.deckId === d.id).sort((a, b) => (levelOf(a) - levelOf(b)) * dir);
      return { key: d.id, title: d.name, sub: `${d.tagline} · ${dc.length} card${dc.length === 1 ? '' : 's'}`, cards: dc };
    })
  };
}
