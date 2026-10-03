import type { Content } from '../../content/types';
import { sequenceStats } from '../../game/rules';
import { useStore } from '../../game/store';
import type { GameState, RepDeck, Sequence } from '../../game/types';
import { useInput } from '../../input/InputProvider';
import { CardArt } from '../../ui/art/CardArt';
import { Mosaic } from '../../ui/Cards';
import { useNav } from '../../ui/nav';
import { useOverlays, type MenuItem } from '../../ui/Overlays';
import { useDraft } from '../../ui/useDraft';
import { SendToClient } from '../../ui/SendToClient';
import { useCardDrag } from './drag';
import { collectionCards, resolveColl } from './library';
import { MoreIcon } from './Library';
import { DECK_SLOTS } from '../../game/reducer';

function PlusIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12" /></svg>;
}

function CollArt({ coll, state, content }: { coll: string; state: GameState; content: Content }) {
  if (coll === 'transition') return <span className="coll__art"><CardArt art="transition-roll" kind="transition" /></span>;
  if (coll === 'progression') return <span className="coll__art"><CardArt art="progression-tempo" kind="progression" /></span>;
  if (coll === 'archive') return <span className="coll__art coll__art--glyph" aria-hidden="true">⌂</span>;
  const ids = collectionCards(coll, state, content).map((c) => c.id);
  return ids.length ? <Mosaic cardIds={ids} content={content} className="coll__art" /> : <span className="coll__art coll__art--glyph" aria-hidden="true">❏</span>;
}

/** Decks: the left column. Collection, six custom deck slots, the Deck Library tin, and In the Queue. */
export function Sidebar() {
  const { state, content } = useStore();
  const { builder, setBuilder } = useNav();
  const { drag } = useCardDrag();
  const newDeck = useNewDeck();
  const menu = useDeckMenu();
  const { openSheet } = useOverlays();
  const current = resolveColl(builder.coll, state);
  const coll = (id: string, label: string) => {
    const on = current === id;
    const n = collectionCards(id, state, content).length;
    return (
      <button key={id} type="button" className={`coll ${on ? 'is-on' : ''}`} aria-current={on || undefined} onClick={() => setBuilder({ coll: id, level: id === 'transition' || id === 'progression' ? 'all' : builder.level })}
        aria-label={`${label}, ${n} Qcards`} title={label} data-a={on ? 'Showing' : `Show ${label}`}>
        <CollArt coll={id} state={state} content={content} />
        <span className="coll__name">{label}</span>
        <span className="coll__count" aria-hidden="true">{n}</span>
      </button>
    );
  };
  const shelf = state.decks.filter((d) => !d.filed);
  const filed = state.decks.filter((d) => d.filed);
  const recent = state.sequences.filter((x) => (!x.seeded || state.savedSequenceIds.includes(x.id)))
    .sort((a, b) => (b.savedAt ?? b.updatedAt) - (a.savedAt ?? a.updatedAt)).slice(0, 3);
  return (
    <nav className="lib-side scroll" aria-label="Decks">
      <h2 className="side-title">Decks</h2>
      <p className="side-label">Collection</p>
      {coll('bookcase', 'Bookcase')}
      {coll('all', 'All Qcards')}
      {coll('transition', 'Transitions')}
      {coll('progression', 'Progressions')}
      {coll('archive', 'Archive')}
      <p className="side-label">Custom Decks <span className="side-label__n">{shelf.length} of {DECK_SLOTS}</span></p>
      {shelf.map((d) => {
        const on = current === d.id;
        const primary = d.id === state.primaryDeckId;
        const n = collectionCards(d.id, state, content).length;
        const over = drag?.target?.kind === 'deck' && drag.target.deckId === d.id;
        return (
          <div key={d.id} className={`deck-row ${over ? 'is-drop' : ''} ${drag ? 'is-droppable' : ''}`} data-drop-deck={d.id} data-x={`dm-${d.id}`} data-x-label="Deck options">
            <button type="button" className={`coll ${on ? 'is-on' : ''}`} aria-current={on || undefined} onClick={() => setBuilder({ coll: d.id })}
              aria-label={`${d.name}${primary ? ', primary deck' : ''}, ${n} Qcards`} title={d.name} data-a={on ? 'Showing' : `Show ${d.name}`}>
              <CollArt coll={d.id} state={state} content={content} />
              <span className="coll__name"><span>{primary && <span className="coll__star" aria-hidden="true">★ </span>}{d.name}</span></span>
              <span className="coll__count" aria-hidden="true">{n}</span>
            </button>
            <button type="button" id={`dm-${d.id}`} className="more-btn more-btn--sm" aria-label={`Options for ${d.name}`} aria-haspopup="menu" onClick={(e) => menu(e.currentTarget, d)}><MoreIcon /></button>
          </div>
        );
      })}
      {Array.from({ length: Math.max(0, DECK_SLOTS - shelf.length) }, (_, i) => (
        <button key={`empty-${i}`} type="button" className="deck-slot" onClick={() => void newDeck()} data-a="New deck"><PlusIcon /> New deck</button>
      ))}
      <button type="button" className="tin-btn" onClick={() => openSheet({ eyebrow: 'Decks', title: 'Deck Library', body: <DeckLibrary /> })} data-a="Open the tin">
        <span className="tin-btn__tin" aria-hidden="true" />
        <span>Deck Library<small>{filed.length ? `${filed.length} filed away` : 'File decks here when the shelf is full'}</small></span>
      </button>
      <p className="side-label side-label--row"><span>In the Queue</span><button type="button" className="link-btn" onClick={() => openSheet({ eyebrow: 'Repertoire', title: 'Your Sequences', body: <YourSequences /> })}>See all</button></p>
      <ul className="folder__list">
        {recent.map((x) => <SeqRow key={x.id} seq={x} />)}
        {!recent.length && <li className="folder__empty">Saved Sequences land here.</li>}
      </ul>
    </nav>
  );
}

/** The recipe tin: decks filed off the shelf. Unlimited; pull one out to swap it into a slot. */
function DeckLibrary() {
  const { state, content, dispatch } = useStore();
  const { openMenu } = useOverlays();
  const { toast } = useInput();
  const shelf = state.decks.filter((d) => !d.filed);
  const filed = state.decks.filter((d) => d.filed);
  const pull = (anchor: HTMLElement, d: RepDeck) => {
    if (shelf.length < DECK_SLOTS) { dispatch({ type: 'deck/unfile', deckId: d.id }); toast(`${d.name} is back on the shelf.`); return; }
    openMenu(anchor, 'Swap it with…', shelf.filter((x) => x.id !== state.primaryDeckId).map<MenuItem>((x) => ({ label: x.name, hint: 'Goes into the tin', onSelect: () => { dispatch({ type: 'deck/unfile', deckId: d.id, swapWith: x.id }); toast(`${d.name} out, ${x.name} filed.`); } })));
  };
  return (
    <div className="tin">
      <div className="tin__lid" aria-hidden="true"><span>Recipes for the Mat</span></div>
      <div className="tin__box">
        {filed.map((d) => (
          <div key={d.id} className="index-card">
            <span className="index-card__tab">{d.name.slice(0, 1)}</span>
            <Mosaic cardIds={d.cardIds} content={content} className="index-card__art" />
            <span className="index-card__name">{d.name}<small>{d.cardIds.length} Qcards</small></span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={(e) => pull(e.currentTarget, d)}>Pull out</button>
          </div>
        ))}
        {!filed.length && <p className="tin__empty">Nothing filed yet. From a deck’s ⋯ menu choose “File in the Deck Library”.</p>}
      </div>
      <p className="tin__note">Six decks sit on the shelf. The tin holds as many as you like.</p>
    </div>
  );
}

/** Every Sequence you've built or saved, for the Sequencer's “Your Sequences” button. */
export function YourSequences() {
  const { state } = useStore();
  const mine = state.sequences.filter((x) => !x.seeded).sort((a, b) => b.updatedAt - a.updatedAt);
  const saved = state.savedSequenceIds.map((id) => state.sequences.find((x) => x.id === id)).filter(Boolean) as Sequence[];
  return (
    <div className="your-seqs">
      <p className="side-label">Built by you</p>
      <ul className="folder__list">
        {mine.map((x) => <SeqRow key={x.id} seq={x} />)}
        {!mine.length && <li className="folder__empty">Save a Sequence in the Sequencer and it lands here.</li>}
      </ul>
      {saved.length > 0 && (<><p className="side-label">Saved from the Queue</p><ul className="folder__list">{saved.map((x) => <SeqRow key={x.id} seq={x} />)}</ul></>)}
    </div>
  );
}

function useNewDeck() {
  const { dispatch } = useStore();
  const { setBuilder } = useNav();
  const { ask } = useOverlays();
  const { toast } = useInput();
  return async (cardIds?: string[]) => {
    const name = await ask({ title: 'New deck', label: 'Deck name', placeholder: 'Morning, Clients, Gentle…', confirm: 'Make deck' });
    if (!name) return;
    const id = `d-${Date.now().toString(36)}`;
    dispatch({ type: 'deck/create', deckId: id, name, cardIds });
    setBuilder({ coll: id });
    toast(`${name} made. Drag Qcards onto it from All Qcards.`);
  };
}

/** The ⋯ menu for a deck, the same in the sidebar and above the library. */
export function useDeckMenu() {
  const { state, dispatch } = useStore();
  const { ask, confirm, openMenu } = useOverlays();
  const { toast } = useInput();
  return (anchor: HTMLElement | null, deck: RepDeck) => {
    const primary = deck.id === state.primaryDeckId;
    const items: MenuItem[] = [
      { label: primary ? 'Primary deck' : 'Make primary', checked: primary, disabled: primary, hint: 'New Qcards are offered here first', onSelect: () => { dispatch({ type: 'deck/primary', deckId: deck.id }); toast(`${deck.name} is your primary deck.`); } },
      { label: 'Rename', onSelect: async () => {
        const name = await ask({ title: `Rename ${deck.name}`, label: 'Deck name', placeholder: deck.name, confirm: 'Rename' });
        if (name) dispatch({ type: 'deck/rename', deckId: deck.id, name });
      } },
      { label: 'Move up', disabled: deck.filed, onSelect: () => dispatch({ type: 'deck/move', deckId: deck.id, dir: -1 }) },
      { label: 'Move down', disabled: deck.filed, onSelect: () => dispatch({ type: 'deck/move', deckId: deck.id, dir: 1 }) },
      deck.filed
        ? { label: 'Pull out of the Deck Library', onSelect: () => dispatch({ type: 'deck/unfile', deckId: deck.id }) }
        : { label: 'File in the Deck Library', disabled: primary, hint: primary ? 'The primary deck stays on the shelf' : 'Frees a slot; nothing is lost', onSelect: () => { dispatch({ type: 'deck/file', deckId: deck.id }); toast(`${deck.name} filed in the Deck Library.`); } },
      { label: 'Delete deck', danger: true, disabled: state.decks.length <= 1, hint: state.decks.length <= 1 ? 'Your only deck' : 'Its Qcards stay in All Qcards', onSelect: async () => {
        if (await confirm({ title: `Delete ${deck.name}?`, body: 'The deck goes. Its Qcards stay in your collection under All Qcards.', confirm: 'Delete deck', danger: true })) dispatch({ type: 'deck/delete', deckId: deck.id });
      } }
    ];
    openMenu(anchor, deck.name, items);
  };
}

/** The ⋯ menu for a Sequence, the same everywhere it appears. */
export function useSequenceMenu() {
  const { state, dispatch } = useStore();
  const { confirm, openMenu, openSheet } = useOverlays();
  const { toast } = useInput();
  const load = useLoadSequence();
  const remix = useRemixSequence();
  return (anchor: HTMLElement | null, seq: Sequence) => {
    const items: MenuItem[] = [
      { label: seq.seeded ? 'Try it in Play' : 'Perform it now', onSelect: () => dispatch({ type: 'play/start', sequenceId: seq.id }) },
      { label: 'Send to a client', onSelect: () => openSheet({ eyebrow: 'Send to a client', title: seq.name, body: <SendToClient seq={seq} /> }) }
    ];
    if (seq.seeded) {
      items.push({ label: 'Remix into my Repertoire', onSelect: () => void remix(seq) });
      items.push({ label: 'Take out of Saved', onSelect: () => dispatch({ type: 'sequence/toggleSaved', sequenceId: seq.id }) });
    } else {
      items.push({ label: 'Open in the builder', onSelect: () => void load(seq) });
      items.push(state.pinnedSequenceId === seq.id
        ? { label: 'Unpin from Studio', onSelect: () => dispatch({ type: 'sequence/pin', sequenceId: null }) }
        : { label: 'Pin to Studio', hint: 'Shows on your class board', onSelect: () => { dispatch({ type: 'sequence/pin', sequenceId: seq.id }); toast(`${seq.name} is on your Studio class board.`); } });
      items.push(seq.published
        ? { label: 'Shared In the Queue', disabled: true }
        : { label: 'Share In the Queue', onSelect: () => { dispatch({ type: 'sequence/publish', sequenceId: seq.id }); toast(`${seq.name} is In the Queue.`); } });
      items.push({ label: 'Delete', danger: true, onSelect: async () => {
        if (await confirm({ title: `Delete “${seq.name}”?`, body: 'The Sequence is removed from this device. Points and Techniques you earned with it stay.', confirm: 'Delete Sequence', danger: true })) {
          dispatch({ type: 'sequence/delete', sequenceId: seq.id });
          toast(`${seq.name} deleted.`);
        }
      } });
    }
    openMenu(anchor, seq.name, items);
  };
}

/** Remix someone's Sequence into your own (asking first if it would replace unsaved work). */
export function useRemixSequence() {
  const { state, dispatch } = useStore();
  const { go, setBuilder } = useNav();
  const { confirm } = useOverlays();
  const { toast } = useInput();
  const draft = useDraft();
  return async (seq: Sequence) => {
    if (draft.dirty && !(await confirm({ title: 'Replace the Sequence in progress?', body: `“${state.draftName.trim() || 'Untitled Sequence'}” has changes that aren’t saved. Remixing ${seq.name} replaces them.`, confirm: 'Remix it' }))) return;
    dispatch({ type: 'sequence/remix', sequenceId: seq.id });
    setBuilder({ selectedSlotId: null });
    toast(`Your remix of ${seq.name} is in the builder.`);
    go('repertoire');
  };
}

/** Load a Sequence into the builder, checking first if it would replace unsaved work. */
export function useLoadSequence() {
  const { state, dispatch } = useStore();
  const { go, setBuilder } = useNav();
  const { confirm } = useOverlays();
  const { toast } = useInput();
  const draft = useDraft();
  return async (seq: Sequence) => {
    if (state.draftSourceId === seq.id && !draft.dirty) { go('repertoire'); return; }
    if (draft.dirty && !(await confirm({ title: 'Replace the Sequence in progress?', body: `“${state.draftName.trim() || 'Untitled Sequence'}” has changes that aren’t saved. Opening ${seq.name} replaces them.`, confirm: `Open ${seq.name}` }))) return;
    dispatch({ type: 'draft/load', sequenceId: seq.id });
    setBuilder({ selectedSlotId: null });
    go('repertoire');
    toast(`${seq.name} is in the builder.`);
  };
}

function SeqRow({ seq }: { seq: Sequence }) {
  const { state, content } = useStore();
  const menu = useSequenceMenu();
  const load = useLoadSequence();
  const remix = useRemixSequence();
  const stats = sequenceStats(seq.slots, content);
  const current = state.draftSourceId === seq.id;
  const pinned = state.pinnedSequenceId === seq.id;
  return (
    <li className={`seq-row ${current ? 'is-current' : ''}`} data-x={`sm-${seq.id}`} data-x-label="Sequence options">
      <button type="button" className="seq-row__main" title={seq.name} onClick={() => void (seq.seeded ? remix(seq) : load(seq))}
        aria-label={`${seq.name}, ${stats.totalCards} cards, ${stats.durationLabel}${current ? ', in the builder' : ''}`} data-a={current ? 'In the builder' : seq.seeded ? 'Remix' : 'Open'}>
        <Mosaic cardIds={seq.slots.map((s) => s.cardId)} content={content} className="seq-row__art" />
        <span className="seq-row__text">
          <span className="seq-row__name">{pinned && <span aria-hidden="true">⌂ </span>}{seq.name}</span>
          <span className="seq-row__meta">{seq.seeded ? seq.studio ?? seq.author : `${stats.totalCards} cards · ${stats.durationLabel}`}{seq.published && !seq.seeded ? ' · shared' : ''}</span>
        </span>
      </button>
      <button type="button" id={`sm-${seq.id}`} className="more-btn more-btn--sm" aria-label={`Options for ${seq.name}`} aria-haspopup="menu" onClick={(e) => menu(e.currentTarget, seq)}><MoreIcon /></button>
    </li>
  );
}
