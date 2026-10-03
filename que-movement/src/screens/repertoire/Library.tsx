import { useRef, useState } from 'react';
import { POSITION_LABEL } from '../../content/content';
import type { Card } from '../../content/types';
import { cardSeconds, clock, doseShort } from '../../game/rules';
import { useStore } from '../../game/store';
import { useInput } from '../../input/InputProvider';
import { Art, cardAria, Tag } from '../../ui/Cards';
import { CardDetails } from '../../ui/CardDetails';
import { useNav, type BuilderView } from '../../ui/nav';
import { useOverlays, type MenuItem } from '../../ui/Overlays';
import { useDraft } from '../../ui/useDraft';
import { fly, sequenceLanding } from '../../ui/fly';
import { useCardDrag } from './drag';
import { collectionName, libraryGroups, resolveColl, SORTS } from './library';
import { useDeckMenu } from './Sidebar';
import { Bookcase } from './Bookcase';

const LEVELS: [BuilderView['level'], string][] = [['all', 'All levels'], ['foundation', 'Foundation'], ['working', 'Working'], ['challenge', 'Challenge']];

export function SearchIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>;
}
function GridIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg>;
}
function ListIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M9 6.5h11M9 12h11M9 17.5h11" /><circle cx="4.8" cy="6.5" r="1" fill="currentColor" /><circle cx="4.8" cy="12" r="1" fill="currentColor" /><circle cx="4.8" cy="17.5" r="1" fill="currentColor" /></svg>;
}
export const MoreIcon = () => <span aria-hidden="true" className="more-dots">⋯</span>;

/** The middle column: the collection or deck being shown, as a cover grid or a list. */
export function Library() {
  const { state, content } = useStore();
  const { builder: view, setBuilder, go } = useNav();
  const { openMenu } = useOverlays();
  const deckMenu = useDeckMenu();
  const sortRef = useRef<HTMLButtonElement>(null);
  const deckMore = useRef<HTMLButtonElement>(null);
  const { groups, count } = libraryGroups(view, state, content);
  const coll = resolveColl(view.coll, state);
  const deck = state.decks.find((d) => d.id === coll);
  const sort = SORTS.find((s) => s.key === view.sortBy)!;
  const toLearn = content.branch.nodes.filter((n) => !state.ownedCardIds.includes(n.cardId)).length;

  const openSort = () => openMenu(sortRef.current, 'Sort Qcards', [
    ...SORTS.map<MenuItem>((s) => ({ label: s.label, checked: s.key === view.sortBy, onSelect: () => setBuilder({ sortBy: s.key }) })),
    { label: view.sortDir === 1 ? `Reverse: ${sort.down}` : `Reverse: ${sort.up}`, hint: 'Same as the ↑↓ button', onSelect: () => setBuilder({ sortDir: view.sortDir === 1 ? -1 : 1 }) }
  ]);

  const note = coll === 'transition' ? 'Transitions carry the body from one position to the next. Every Repertoire has them.'
    : coll === 'progression' ? 'Progressions change a movement: slower, longer, busier. Drag one onto a step, or tap to attach it to the selected step.'
      : coll === 'archive' ? 'Archived Qcards are kept safe, just out of the way. Restore them from their ⋯ menu.'
        : coll === 'all' ? 'Every Qcard you know. Drag one onto a deck in the sidebar to keep it close.'
          : null;

  if (coll === 'bookcase') return (
    <section className="lib-main" aria-label="Bookcase">
      <div className="lib-title"><div><p className="eyebrow">Collection</p><h2 className="lib-title__name">Bookcase</h2></div></div>
      <Bookcase />
    </section>
  );

  return (
    <section className="lib-main" aria-label={`${collectionName(view.coll, state)} Qcards`}>
      <div className="lib-title">
        <div>
          <p className="eyebrow">{deck ? (deck.id === state.primaryDeckId ? '★ Primary deck' : 'Deck') : 'Collection'}</p>
          <h2 className="lib-title__name">{collectionName(view.coll, state)}</h2>
        </div>
        {deck && <button ref={deckMore} type="button" className="more-btn" aria-label={`Options for ${deck.name}`} aria-haspopup="menu" onClick={() => deckMenu(deckMore.current, deck)}><MoreIcon /></button>}
      </div>
      <div className="lib-tools">
        <label className="search">
          <SearchIcon />
          <span className="sr-only">Filter Qcards</span>
          <input type="search" value={view.query} placeholder="Filter Qcards" onChange={(e) => setBuilder({ query: e.target.value })} />
          {view.query && <button type="button" className="search__clear" aria-label="Clear filter" onClick={() => setBuilder({ query: '' })}>×</button>}
        </label>
        <div className="sort-group">
          <button ref={sortRef} type="button" className="chip chip--tool" aria-haspopup="menu" onClick={openSort} data-a="Change sort">
            Sort: {sort.label} <span aria-hidden="true">▾</span>
          </button>
          <button type="button" className="chip chip--tool chip--icon" onClick={() => setBuilder({ sortDir: view.sortDir === 1 ? -1 : 1 })}
            aria-label={`Sort direction: ${view.sortDir === 1 ? sort.up : sort.down}. Reverse it`} title={view.sortDir === 1 ? sort.up : sort.down} data-a="Reverse order">
            <span aria-hidden="true" className="dir-arrow">{view.sortDir === 1 ? '↑' : '↓'}</span>
          </button>
        </div>
        <div className="seg" role="radiogroup" aria-label="View">
          <button type="button" role="radio" aria-checked={view.view === 'grid'} className={view.view === 'grid' ? 'is-on' : ''} onClick={() => setBuilder({ view: 'grid' })} aria-label="Cover grid" title="Cover grid"><GridIcon /></button>
          <button type="button" role="radio" aria-checked={view.view === 'list'} className={view.view === 'list' ? 'is-on' : ''} onClick={() => setBuilder({ view: 'list' })} aria-label="List" title="List"><ListIcon /></button>
        </div>
      </div>
      {coll !== 'transition' && coll !== 'progression' && (
        <div className="level-chips" role="radiogroup" aria-label="Level">
          {LEVELS.map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={view.level === k} className={`chip chip--level ${view.level === k ? 'is-on' : ''}`} data-level={k} onClick={() => setBuilder({ level: k })}>
              <span className="chip__dot" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      )}
      {note && <p className="lib-note">{note}</p>}
      <div className="lib-scroll scroll" tabIndex={-1}>
        {view.view === 'list' && count > 0 && <ListHead />}
        {groups.map((g) => (
          <section key={g.key} className="lib-group" aria-label={g.title}>
            <h3 className="lib-group__title">{g.title}{g.sub && <span>{g.sub}</span>}</h3>
            {view.view === 'grid'
              ? <div className="tile-grid">{g.cards.map((c) => <Tile key={c.id} card={c} />)}</div>
              : <div className="lrows">{g.cards.map((c) => <Row key={c.id} card={c} />)}</div>}
          </section>
        ))}
        {count === 0 && (
          <div className="empty">
            {view.query || view.level !== 'all' ? (
              <>
                <p className="empty__title">Nothing matches</p>
                <p className="muted">Try a position (Supine, Seated), a level, or a path name.</p>
                <button type="button" className="btn btn--ghost" onClick={() => setBuilder({ query: '', level: 'all' })}>Clear the filter</button>
              </>
            ) : deck ? (
              <>
                <p className="empty__title">An empty deck</p>
                <p className="muted">Open All Qcards and drag cards onto {deck.name} in the sidebar, or use a card’s ⋯ menu.</p>
                <button type="button" className="btn btn--ghost" onClick={() => setBuilder({ coll: 'all' })}>Show All Qcards</button>
              </>
            ) : <p className="empty__title">Nothing here yet</p>}
          </div>
        )}
        {toLearn > 0 && coll !== 'archive' && coll !== 'transition' && (
          <button type="button" className="lib-more" onClick={() => go('technique')} data-a="Open Technique">
            <span aria-hidden="true">✧</span> {toLearn} more Techniques to learn. Each one becomes a Qcard. <strong>Technique →</strong>
          </button>
        )}
      </div>
    </section>
  );
}

function ListHead() {
  const { builder: view, setBuilder } = useNav();
  const col = (key: BuilderView['sortBy'], label: string) => (
    <button type="button" className={`lhead__col ${view.sortBy === key ? 'is-on' : ''}`} onClick={() => setBuilder(view.sortBy === key ? { sortDir: view.sortDir === 1 ? -1 : 1 } : { sortBy: key, sortDir: 1 })}
      aria-label={`Sort by ${label}`} data-a={`Sort by ${label}`}>
      {label}{view.sortBy === key && <span aria-hidden="true">{view.sortDir === 1 ? ' ↑' : ' ↓'}</span>}
    </button>
  );
  return (
    <div className="lhead" role="presentation">
      <span />
      {col('az', 'Name')}
      {col('position', 'Position')}
      {col('level', 'Level')}
      {col('time', 'Time')}
      <span />
    </div>
  );
}

/** Everything a Qcard can do, for its ⋯ menu (X on a controller). */
function useCardMenu(card: Card) {
  const { state, dispatch, content } = useStore();
  const { builder } = useNav();
  const { openMenu, openSheet } = useOverlays();
  const { toast } = useInput();
  const draft = useDraft();
  const coll = resolveColl(builder.coll, state);
  const viewingDeck = state.decks.find((d) => d.id === coll);
  const archived = state.archivedCardIds.includes(card.id);
  const details = () => openSheet({ eyebrow: card.kind === 'transition' ? 'Transition' : `${content.pathById[card.pathId]?.name} path`, title: card.name, body: <CardDetails card={card} /> });
  return {
    details,
    menu: (anchor: HTMLElement | null) => {
      const items: MenuItem[] = [{ label: 'Details', onSelect: details }];
      if (!archived && card.kind !== 'progression') {
        items.push({ label: 'Add to end of Sequence', disabled: draft.full, onSelect: () => draft.add(card) });
        if (draft.selIndex >= 0) items.push({ label: `Add after step ${draft.selIndex + 1}`, disabled: draft.full, onSelect: () => draft.add(card, draft.selIndex + 1) });
        items.push({ label: 'Add to start of Sequence', disabled: draft.full, onSelect: () => draft.add(card, 0) });
      }
      if (!archived && card.kind === 'progression') {
        const movements = draft.slots.filter((s) => content.cardById[s.cardId]?.kind === 'movement');
        items.push({
          label: 'Attach to…', disabled: !movements.length, hint: movements.length ? undefined : 'Add a movement first',
          items: movements.map((s) => ({ label: `${draft.slots.indexOf(s) + 1}. ${content.cardById[s.cardId]?.name}`, checked: s.modifiers.includes(card.id), onSelect: () => draft.attach(card, s) }))
        });
      }
      items.push({
        label: 'Add to deck…',
        items: state.decks.map((d) => ({
          label: d.name, checked: d.cardIds.includes(card.id),
          onSelect: () => {
            if (d.cardIds.includes(card.id)) dispatch({ type: 'deck/remove', deckId: d.id, cardId: card.id });
            else dispatch({ type: 'deck/add', deckId: d.id, cardId: card.id });
            toast(d.cardIds.includes(card.id) ? `${card.name} taken out of ${d.name}.` : `${card.name} added to ${d.name}.`);
          }
        }))
      });
      if (viewingDeck?.cardIds.includes(card.id)) items.push({ label: `Take out of ${viewingDeck.name}`, onSelect: () => { dispatch({ type: 'deck/remove', deckId: viewingDeck.id, cardId: card.id }); toast(`${card.name} taken out of ${viewingDeck.name}. It’s still in All Qcards.`); } });
      items.push(archived
        ? { label: 'Restore from archive', onSelect: () => { dispatch({ type: 'card/restore', cardId: card.id }); toast(`${card.name} restored.`); } }
        : { label: 'Archive', hint: 'Out of the way, never lost', onSelect: () => { dispatch({ type: 'card/archive', cardId: card.id }); toast(`${card.name} archived.`); } });
      openMenu(anchor, card.name, items);
    }
  };
}

function useTileAction(card: Card) {
  const { state, content } = useStore();
  const draft = useDraft();
  const m = useCardMenu(card);
  const archived = state.archivedCardIds.includes(card.id);
  const target = card.kind === 'progression' ? draft.attachTarget() : undefined;
  const label = archived ? 'Details' : card.kind === 'progression' ? (target ? `Attach to ${content.cardById[target.cardId]?.name}` : 'Details') : draft.full ? 'Details' : 'Add to Sequence';
  const run = () => {
    if (archived || (card.kind === 'progression' && !target) || (card.kind !== 'progression' && draft.full)) { m.details(); return false; }
    return draft.add(card);
  };
  const inBuild = card.kind === 'progression'
    ? state.draftSlots.filter((s) => s.modifiers.includes(card.id)).length
    : state.draftSlots.filter((s) => s.cardId === card.id).length;
  return { archived, label, run, menu: m.menu, inBuild, practised: state.completedCounts[card.id] ?? 0 };
}

function Tile({ card }: { card: Card }) {
  const { content } = useStore();
  const t = useTileAction(card);
  const { bind, drag } = useCardDrag();
  const [hover, setHover] = useState(false);
  const artRef = useRef<HTMLSpanElement>(null);
  const moreId = `tm-${card.id}`;
  const tap = () => { if (t.run() && card.kind !== 'progression') fly(artRef.current, sequenceLanding()); };
  const meta = card.kind === 'movement' ? `${POSITION_LABEL[card.position]} · ${doseShort(card.dose)}` : card.kind === 'transition' ? `${POSITION_LABEL[card.from[0]]} ↔ ${POSITION_LABEL[card.to[0]]}` : card.effect;
  return (
    <div className={`tile tile--${card.kind} ${drag?.card.id === card.id ? 'is-lifted' : ''} ${t.archived ? 'is-archived' : ''}`} data-x={moreId} data-x-label="Qcard options"
      onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <button type="button" className="tile__main" onClick={tap} {...(t.archived ? {} : bind(card))} onFocus={() => setHover(true)} onBlur={() => setHover(false)}
        aria-label={`${cardAria(card)}${t.inBuild ? `, in your Sequence ${t.inBuild}×` : ''}`} data-a={t.label}>
        <span className="tile__art" ref={artRef}>
          <Art card={card} content={content} live={hover} dim={t.archived} />
          <Tag card={card} className="tile__tag" />
          {t.practised > 0 && <span className="tile__count" title={`Performed ${t.practised}×`}>✓ {t.practised}</span>}
          {t.inBuild > 0 && <span className="tile__in" aria-hidden="true">In Sequence{t.inBuild > 1 ? ` ×${t.inBuild}` : ''}</span>}
          {!t.archived && <span className="tile__add" aria-hidden="true">+</span>}
        </span>
        <span className="tile__name">{card.name}</span>
        <span className="tile__meta">{meta}</span>
      </button>
      <button type="button" id={moreId} className="more-btn tile__more" aria-label={`Options for ${card.name}`} aria-haspopup="menu" onClick={(e) => t.menu(e.currentTarget)} data-a="Options"><MoreIcon /></button>
    </div>
  );
}

function Row({ card }: { card: Card }) {
  const { content } = useStore();
  const t = useTileAction(card);
  const { bind } = useCardDrag();
  const moreId = `tm-${card.id}`;
  const pos = card.kind === 'movement' ? POSITION_LABEL[card.position] : card.kind === 'transition' ? `${POSITION_LABEL[card.from[0]]} ↔ ${POSITION_LABEL[card.to[0]]}` : '—';
  return (
    <div className={`lrow ${t.archived ? 'is-archived' : ''}`} data-x={moreId} data-x-label="Qcard options">
      <button type="button" className="lrow__main" onClick={t.run} {...(t.archived ? {} : bind(card))} aria-label={cardAria(card)} data-a={t.label}>
        <span className="lrow__art"><Art card={card} content={content} dim={t.archived} /></span>
        <span className="lrow__name">{card.name}<small>{t.inBuild ? `In your Sequence${t.inBuild > 1 ? ` ×${t.inBuild}` : ''}` : card.kind === 'progression' ? card.effect : card.shortCue}</small></span>
        <span className="lrow__pos">{pos}</span>
        <span className="lrow__level"><Tag card={card} /></span>
        <span className="lrow__time">{clock(cardSeconds(card))}</span>
      </button>
      <button type="button" id={moreId} className="more-btn" aria-label={`Options for ${card.name}`} aria-haspopup="menu" onClick={(e) => t.menu(e.currentTarget)} data-a="Options"><MoreIcon /></button>
    </div>
  );
}
