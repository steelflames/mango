import { useRef } from 'react';
import { POSITION_LABEL } from '../../content/content';
import type { Card } from '../../content/types';
import { clock, doseShort } from '../../game/rules';
import { useStore } from '../../game/store';
import { Art, cardAria, LockIcon, Tag } from '../../ui/Cards';
import { CardDetails } from '../../ui/CardDetails';
import { useNav, type BuilderView } from '../../ui/nav';
import { useOverlays, type MenuItem } from '../../ui/Overlays';
import { useDraft } from '../../ui/useDraft';
import { cardSeconds, collectionName, libraryGroups, SORTS } from './library';

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

/** The middle column: search, sort, view, level chips, then the cards as a cover-art grid or a list. */
export function Library() {
  const { content } = useStore();
  const { builder: view, setBuilder } = useNav();
  const { openMenu } = useOverlays();
  const sortRef = useRef<HTMLButtonElement>(null);
  const { groups, count } = libraryGroups(view, content);
  const special = view.coll === 'transition' || view.coll === 'progression';
  const sort = SORTS.find((s) => s.key === view.sortBy)!;

  const openSort = () => openMenu(sortRef.current, 'Sort cards', [
    ...SORTS.filter((s) => !special || s.key === 'az' || s.key === 'time' || (s.key === 'position' && view.coll === 'transition')).map<MenuItem>((s) => ({
      label: s.label, checked: s.key === view.sortBy, onSelect: () => setBuilder({ sortBy: s.key })
    })),
    { label: view.sortDir === 1 ? `Reverse: ${sort.down}` : `Reverse: ${sort.up}`, hint: 'Same as the ↑↓ button', onSelect: () => setBuilder({ sortDir: view.sortDir === 1 ? -1 : 1 }) }
  ]);

  return (
    <section className="lib-main" aria-label={`${collectionName(view.coll, content)} cards`}>
      <div className="lib-tools">
        <label className="search">
          <SearchIcon />
          <span className="sr-only">Filter cards</span>
          <input type="search" value={view.query} placeholder="Filter cards" onChange={(e) => setBuilder({ query: e.target.value })} />
          {view.query && <button type="button" className="search__clear" aria-label="Clear filter" onClick={() => setBuilder({ query: '' })}>×</button>}
        </label>
        <div className="sort-group">
          <button ref={sortRef} type="button" className="chip chip--tool" aria-haspopup="menu" onClick={openSort} data-a="Change sort">
            Sort: {special && view.sortBy !== 'time' && view.sortBy !== 'position' ? 'A–Z' : sort.label} <span aria-hidden="true">▾</span>
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
      {!special && (
        <div className="level-chips" role="radiogroup" aria-label="Level">
          {LEVELS.map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={view.level === k} className={`chip chip--level ${view.level === k ? 'is-on' : ''}`} data-level={k} onClick={() => setBuilder({ level: k })}>
              <span className="chip__dot" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      )}
      {special && (
        <p className="lib-note">
          {view.coll === 'transition'
            ? 'Transitions carry the body from one position to the next. Put one between two cards whose positions differ.'
            : 'Progressions change a movement card — slower, longer, further. Tap one to attach it to the selected step (or the last movement). Up to two per card.'}
        </p>
      )}
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
            <p className="empty__title">Nothing matches “{view.query}”</p>
            <p className="muted">Try a position (Supine, Seated), a level, or a deck name.</p>
            <button type="button" className="btn btn--ghost" onClick={() => setBuilder({ query: '', level: 'all' })}>Clear the filter</button>
          </div>
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

/** Everything a card can do, for its ⋯ menu (X on a controller). */
function useCardMenu(card: Card) {
  const { content } = useStore();
  const { setBuilder } = useNav();
  const { openMenu, openSheet } = useOverlays();
  const draft = useDraft();
  const details = () => openSheet({ eyebrow: card.kind === 'movement' ? `${content.deckById[card.deckId]?.name} deck` : card.kind === 'transition' ? 'Transition' : 'Progression', title: card.name, body: <CardDetails card={card} /> });
  const open = draft.isOpen(card);
  return {
    details,
    menu: (anchor: HTMLElement | null) => {
      const items: MenuItem[] = [{ label: 'Details', hint: open ? undefined : 'How to open it', onSelect: details }];
      if (open && card.kind !== 'progression') {
        items.push({ label: 'Add to end', disabled: draft.full, onSelect: () => draft.add(card) });
        if (draft.selIndex >= 0) items.push({ label: `Add after step ${draft.selIndex + 1}`, disabled: draft.full, onSelect: () => draft.add(card, draft.selIndex + 1) });
        items.push({ label: 'Add to start', disabled: draft.full, onSelect: () => draft.add(card, 0) });
      }
      if (card.kind === 'progression') {
        const movements = draft.slots.filter((s) => content.cardById[s.cardId]?.kind === 'movement');
        items.push({
          label: 'Attach to…', disabled: !movements.length, hint: movements.length ? undefined : 'Add a movement first',
          items: movements.map((s) => {
            const i = draft.slots.indexOf(s);
            return { label: `${i + 1}. ${content.cardById[s.cardId]?.name}`, checked: s.modifiers.includes(card.id), onSelect: () => draft.attach(card, s) };
          })
        });
      }
      if (card.kind === 'movement') items.push({ label: `All of ${content.deckById[card.deckId]?.name}`, onSelect: () => setBuilder({ coll: card.deckId, level: 'all' }) });
      openMenu(anchor, card.name, items);
    }
  };
}

function useTileAction(card: Card) {
  const { state, content } = useStore();
  const draft = useDraft();
  const m = useCardMenu(card);
  const open = draft.isOpen(card);
  const target = card.kind === 'progression' ? draft.attachTarget() : undefined;
  const label = !open ? 'How to open it' : card.kind === 'progression' ? (target ? `Attach to ${content.cardById[target.cardId]?.name}` : 'Details') : draft.full ? 'Details' : 'Add to sequence';
  const run = () => {
    if (!open || (card.kind === 'progression' && !target) || (card.kind !== 'progression' && draft.full)) m.details();
    else draft.add(card);
  };
  const inBuild = card.kind === 'progression'
    ? state.draftSlots.filter((s) => s.modifiers.includes(card.id)).length
    : state.draftSlots.filter((s) => s.cardId === card.id).length;
  return { open, label, run, menu: m.menu, inBuild, practised: state.completedCounts[card.id] ?? 0 };
}

function Tile({ card }: { card: Card }) {
  const { content } = useStore();
  const t = useTileAction(card);
  const moreId = `tm-${card.id}`;
  const meta = card.kind === 'movement' ? `${POSITION_LABEL[card.position]} · ${doseShort(card.dose)}` : card.kind === 'transition' ? `${POSITION_LABEL[card.from[0]]} ↔ ${POSITION_LABEL[card.to[0]]}` : card.effect;
  return (
    <div className={`tile tile--${card.kind} ${t.open ? '' : 'is-locked'}`} data-x={moreId} data-x-label="Card options">
      <button type="button" className="tile__main" onClick={t.run} aria-label={`${cardAria(card)}${t.open ? '' : ', locked'}${t.inBuild ? `, in your build ${t.inBuild}×` : ''}`} data-a={t.label}>
        <span className="tile__art">
          <Art card={card} content={content} dim={!t.open} />
          <Tag card={card} className="tile__tag" />
          {t.practised > 0 && <span className="tile__count" title={`Practised ${t.practised}×`}>✓ {t.practised}</span>}
          {!t.open && <span className="lock-badge" aria-hidden="true"><LockIcon /></span>}
          {t.inBuild > 0 && <span className="tile__in" aria-hidden="true">In build{t.inBuild > 1 ? ` ×${t.inBuild}` : ''}</span>}
          {t.open && <span className="tile__add" aria-hidden="true">+</span>}
        </span>
        <span className="tile__name">{card.name}</span>
        <span className="tile__meta">{t.open ? meta : 'Locked · see how to open it'}</span>
      </button>
      <button type="button" id={moreId} className="more-btn tile__more" aria-label={`Options for ${card.name}`} aria-haspopup="menu" onClick={(e) => t.menu(e.currentTarget)} data-a="Options"><MoreIcon /></button>
    </div>
  );
}

function Row({ card }: { card: Card }) {
  const { content } = useStore();
  const t = useTileAction(card);
  const moreId = `tm-${card.id}`;
  const pos = card.kind === 'movement' ? POSITION_LABEL[card.position] : card.kind === 'transition' ? `${POSITION_LABEL[card.from[0]]} ↔ ${POSITION_LABEL[card.to[0]]}` : '—';
  return (
    <div className={`lrow ${t.open ? '' : 'is-locked'}`} data-x={moreId} data-x-label="Card options">
      <button type="button" className="lrow__main" onClick={t.run} aria-label={`${cardAria(card)}${t.open ? '' : ', locked'}`} data-a={t.label}>
        <span className="lrow__art"><Art card={card} content={content} dim={!t.open} />{!t.open && <span className="lock-badge lock-badge--sm" aria-hidden="true"><LockIcon /></span>}</span>
        <span className="lrow__name">{card.name}<small>{t.open ? (t.inBuild ? `In your build${t.inBuild > 1 ? ` ×${t.inBuild}` : ''}` : card.kind === 'progression' ? card.effect : card.shortCue) : 'Locked'}</small></span>
        <span className="lrow__pos">{pos}</span>
        <span className="lrow__level"><Tag card={card} /></span>
        <span className="lrow__time">{clock(cardSeconds(card))}</span>
      </button>
      <button type="button" id={moreId} className="more-btn" aria-label={`Options for ${card.name}`} aria-haspopup="menu" onClick={(e) => t.menu(e.currentTarget)} data-a="Options"><MoreIcon /></button>
    </div>
  );
}

