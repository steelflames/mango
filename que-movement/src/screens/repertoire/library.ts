// Collections, sorting and grouping for the Repertoire's card library.
import { LEVEL_LABEL, LEVEL_ORDER, POSITION_LABEL } from '../../content/content';
import type { Card, Content, Position } from '../../content/types';
import { cardSeconds } from '../../game/rules';
import type { GameState } from '../../game/types';
import type { BuilderView } from '../../ui/nav';

export interface Group { key: string; title: string; sub?: string; cards: Card[] }

export const POSITION_ORDER: Position[] = ['supine', 'prone', 'side-lying', 'quadruped', 'kneeling', 'seated', 'standing'];

export const SORTS: { key: BuilderView['sortBy']; label: string; up: string; down: string }[] = [
  { key: 'path', label: 'Path', up: 'Path order', down: 'Reverse path order' },
  { key: 'level', label: 'Level', up: 'Foundation first', down: 'Challenge first' },
  { key: 'position', label: 'Position', up: 'Lying down first', down: 'Sitting up first' },
  { key: 'time', label: 'Time', up: 'Shortest first', down: 'Longest first' },
  { key: 'az', label: 'A–Z', up: 'A to Z', down: 'Z to A' }
];

export const SPECIAL_COLLS = ['bookcase', 'all', 'transition', 'progression', 'archive'] as const;

/** 'primary' is a stand-in for whichever deck is primary right now. */
export function resolveColl(coll: string, state: GameState): string {
  return coll === 'primary' ? state.primaryDeckId : coll;
}

export function collectionName(coll: string, state: GameState): string {
  const c = resolveColl(coll, state);
  if (c === 'bookcase') return 'Bookcase';
  if (c === 'all') return 'All Qcards';
  if (c === 'transition') return 'Transitions';
  if (c === 'progression') return 'Progressions';
  if (c === 'archive') return 'Archive';
  return state.decks.find((d) => d.id === c)?.name ?? 'Deck';
}

export function collections(state: GameState): string[] {
  return [...state.decks.map((d) => d.id), ...SPECIAL_COLLS];
}

export function collectionCards(coll: string, state: GameState, content: Content): Card[] {
  const c = resolveColl(coll, state);
  const owned = (id: string) => state.ownedCardIds.includes(id);
  const live = (card: Card) => owned(card.id) && !state.archivedCardIds.includes(card.id);
  if (c === 'archive') return state.archivedCardIds.map((id) => content.cardById[id]).filter(Boolean);
  if (c === 'transition') return content.specialCards.filter((x) => x.kind === 'transition' && live(x));
  if (c === 'progression') return content.specialCards.filter((x) => x.kind === 'progression' && live(x));
  if (c === 'all' || c === 'bookcase') return content.cards.filter((x) => x.kind !== 'transition' && live(x));
  const deck = state.decks.find((d) => d.id === c);
  return deck ? deck.cardIds.map((id) => content.cardById[id]).filter((x) => x && live(x)) : [];
}

function matches(card: Card, q: string, content: Content): boolean {
  if (!q) return true;
  const hay = [card.name, card.shortCue, card.movementGoal];
  if (card.kind === 'movement') hay.push(POSITION_LABEL[card.position], LEVEL_LABEL[card.level], content.pathById[card.pathId]?.name ?? '');
  if (card.kind === 'transition') hay.push(...card.from.map((p) => POSITION_LABEL[p]), ...card.to.map((p) => POSITION_LABEL[p]));
  if (card.kind === 'progression') hay.push(card.effect, content.pathById[card.pathId]?.name ?? '');
  return hay.join(' ').toLowerCase().includes(q.toLowerCase());
}

const levelOf = (c: Card) => (c.kind === 'movement' ? LEVEL_ORDER[c.level] : 3);
const pathIndex = (c: Card, content: Content) => (c.kind === 'transition' ? 99 : content.paths.findIndex((p) => p.id === c.pathId));
const posOf = (c: Card): Position | null => (c.kind === 'movement' ? c.position : c.kind === 'transition' ? c.from[0] : null);

export function libraryGroups(view: BuilderView, state: GameState, content: Content): { groups: Group[]; count: number } {
  const q = view.query.trim();
  let cards = collectionCards(view.coll, state, content).filter((c) => matches(c, q, content));
  if (view.level !== 'all') cards = cards.filter((c) => c.kind === 'movement' && c.level === view.level);
  const dir = view.sortDir;
  const byName = (a: Card, b: Card) => a.name.localeCompare(b.name);
  const count = cards.length;

  if (view.sortBy === 'time') return { count, groups: [{ key: 'time', title: dir === 1 ? 'Shortest first' : 'Longest first', cards: [...cards].sort((a, b) => (cardSeconds(a) - cardSeconds(b)) * dir || byName(a, b)) }] };
  if (view.sortBy === 'az') return { count, groups: [{ key: 'az', title: dir === 1 ? 'A to Z' : 'Z to A', cards: [...cards].sort((a, b) => byName(a, b) * dir) }] };
  if (view.sortBy === 'level') {
    const levels = (['foundation', 'working', 'challenge'] as const).slice();
    if (dir === -1) levels.reverse();
    const groups: Group[] = levels.map((l) => ({
      key: l, title: LEVEL_LABEL[l], sub: l === 'foundation' ? 'Complete on its own' : 'Another way in',
      cards: cards.filter((c) => c.kind === 'movement' && c.level === l).sort((a, b) => pathIndex(a, content) - pathIndex(b, content))
    }));
    groups.push({ key: 'other', title: 'Transitions and progressions', cards: cards.filter((c) => c.kind !== 'movement').sort(byName) });
    return { count, groups: groups.filter((g) => g.cards.length) };
  }
  if (view.sortBy === 'position') {
    const order = dir === 1 ? POSITION_ORDER : [...POSITION_ORDER].reverse();
    const groups: Group[] = order.map((p) => ({ key: p, title: POSITION_LABEL[p], cards: cards.filter((c) => posOf(c) === p).sort((a, b) => levelOf(a) - levelOf(b) || byName(a, b)) }));
    groups.push({ key: 'any', title: 'Any position', sub: 'Progressions change the card they sit on', cards: cards.filter((c) => posOf(c) === null).sort(byName) });
    return { count, groups: groups.filter((g) => g.cards.length) };
  }
  // by path
  const paths = [...content.paths];
  if (dir === -1) paths.reverse();
  const groups: Group[] = paths.map((p) => {
    const pc = cards.filter((c) => c.kind !== 'transition' && c.pathId === p.id).sort((a, b) => (levelOf(a) - levelOf(b)) * dir);
    return { key: p.id, title: p.name, sub: `${p.tagline} · ${pc.length} Qcard${pc.length === 1 ? '' : 's'}`, cards: pc };
  });
  groups.push({ key: 'transition', title: 'Transitions', sub: 'Between positions', cards: cards.filter((c) => c.kind === 'transition').sort(byName) });
  return { count, groups: groups.filter((g) => g.cards.length) };
}
