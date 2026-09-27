import { useState } from 'react';
import type { Content } from '../../content/types';
import { sequenceStats } from '../../game/rules';
import { useStore } from '../../game/store';
import { MY_BUILDS, type Sequence } from '../../game/types';
import { useInput } from '../../input/InputProvider';
import { CardArt } from '../../ui/art/CardArt';
import { Mosaic } from '../../ui/Cards';
import { useNav } from '../../ui/nav';
import { useOverlays, type MenuItem } from '../../ui/Overlays';
import { useDraft } from '../../ui/useDraft';
import { collectionCards } from './library';
import { MoreIcon } from './Library';

const COMMUNITY = 'community';

function FolderIcon({ plus }: { plus?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      {plus && <path d="M12 11v5M9.5 13.5h5" />}
    </svg>
  );
}

function CollArt({ coll, content }: { coll: string; content: Content }) {
  if (coll === 'all') {
    const ids = content.decks.map((d) => content.movementCards.find((c) => c.deckId === d.id && c.level === 'foundation')?.id).filter(Boolean) as string[];
    return <Mosaic cardIds={ids} content={content} className="coll__art" />;
  }
  if (coll === 'transition') return <span className="coll__art"><CardArt art="transition-roll" kind="transition" /></span>;
  if (coll === 'progression') return <span className="coll__art"><CardArt art="progression-tempo" kind="progression" /></span>;
  const deck = content.deckById[coll];
  const cover = content.movementCards.find((c) => c.deckId === coll && c.level === 'foundation');
  return <span className="coll__art">{cover && <CardArt art={cover.art} kind="movement" deckAccent={deck ? `var(${deck.accentVar})` : undefined} />}</span>;
}

/** Left column: collections like a music library's sidebar, then your saved sequences in folders. */
export function Sidebar() {
  const { state, content } = useStore();
  const { builder, setBuilder } = useNav();
  const packsToAdd = content.expansions.filter((e) => e.available && !state.installedPackIds.includes(e.id) && e.deckIds.length);
  const coll = (id: string, label: string) => {
    const on = builder.coll === id;
    const n = collectionCards(id, content).length;
    return (
      <button key={id} type="button" className={`coll ${on ? 'is-on' : ''}`} aria-current={on || undefined} onClick={() => setBuilder({ coll: id, level: id === 'transition' || id === 'progression' ? 'all' : builder.level })}
        aria-label={`${label}, ${n} cards`} title={label} data-a={on ? 'Showing' : `Show ${label}`}>
        <CollArt coll={id} content={content} />
        <span className="coll__name">{label}</span>
        <span className="coll__count" aria-hidden="true">{n}</span>
      </button>
    );
  };
  return (
    <nav className="lib-side scroll" aria-label="Library">
      <p className="side-label">Library</p>
      {coll('all', 'All movements')}
      <p className="side-label">Decks</p>
      {content.decks.map((d) => coll(d.id, d.name))}
      {packsToAdd.map((p) => <PackRow key={p.id} packId={p.id} />)}
      <p className="side-label">Between cards</p>
      {coll('transition', 'Transitions')}
      {coll('progression', 'Progressions')}
      <Sequences />
    </nav>
  );
}

function PackRow({ packId }: { packId: string }) {
  const { content, dispatch } = useStore();
  const { openSheet, closeSheet } = useOverlays();
  const { toast } = useInput();
  const pack = content.expansions.find((e) => e.id === packId)!;
  const first = content.allMovementCards.find((c) => c.deckId === pack.deckIds[0]);
  const open = () => openSheet({
    eyebrow: 'Expansion pack',
    title: pack.name,
    body: (
      <div className="details details--pack">
        <div className="details__info">
          <p className="details__note">{pack.description}</p>
          <p className="muted">Adds {pack.deckIds.length} decks ({pack.deckIds.map((id) => content.allDecks.find((d) => d.id === id)?.name).join(', ')}), their cards, challenges{pack.themeId ? ' and a seasonal skin' : ''}. Free, and you can remove it again in My Studio.</p>
          <div className="details__actions">
            <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { dispatch({ type: 'pack/install', packId }); closeSheet(); toast(`${pack.name} added. Its decks are in the library.`); }}>Add this pack</button>
            <button type="button" className="btn btn--ghost" onClick={closeSheet}>Not now</button>
          </div>
        </div>
      </div>
    )
  });
  return (
    <button type="button" className="coll coll--pack" onClick={open} aria-label={`${pack.name}, expansion pack, not added yet`} title={`${pack.name} — not added yet`} data-a="About this pack">
      <span className="coll__art">{first && <CardArt art={first.art} kind="movement" dim />}</span>
      <span className="coll__name">{pack.name}<small>Not added yet</small></span>
      <span className="coll__count" aria-hidden="true">+</span>
    </button>
  );
}

function Sequences() {
  const { state, dispatch, content } = useStore();
  const { ask, confirm, openMenu } = useOverlays();
  const { toast } = useInput();
  const [closed, setClosed] = useState<string[]>([]);
  const mine = state.sequences.filter((s) => !s.seeded);
  const inFolder = new Set(state.folders.flatMap((f) => (f.id === MY_BUILDS ? [] : f.sequenceIds)));
  const groups = [
    ...state.folders.map((f) => ({
      id: f.id, name: f.name, user: f.id !== MY_BUILDS,
      seqs: f.id === MY_BUILDS ? mine.filter((s) => !inFolder.has(s.id)) : f.sequenceIds.map((id) => mine.find((s) => s.id === id)).filter(Boolean) as Sequence[]
    })),
    { id: COMMUNITY, name: 'From Community', user: false, seqs: state.sequences.filter((s) => s.seeded) }
  ];
  const newFolder = async () => {
    const name = await ask({ title: 'New folder', label: 'Folder name', placeholder: 'Morning, Clients, Gentle…', confirm: 'Create folder' });
    if (name) { dispatch({ type: 'folder/create', folderId: `f-${Date.now().toString(36)}`, name }); toast(`Folder “${name}” made.`); }
  };
  const folderMenu = (anchor: HTMLElement, g: typeof groups[number]) => openMenu(anchor, g.name, [
    { label: closed.includes(g.id) ? 'Open folder' : 'Fold away', onSelect: () => setClosed((c) => (c.includes(g.id) ? c.filter((x) => x !== g.id) : [...c, g.id])) },
    { label: 'Delete folder', danger: true, hint: 'Builds inside move to My builds', onSelect: async () => {
      if (await confirm({ title: `Delete “${g.name}”?`, body: 'The folder goes; the builds inside it move to My builds.', confirm: 'Delete folder', danger: true })) dispatch({ type: 'folder/delete', folderId: g.id });
    } }
  ]);
  return (
    <>
      <div className="side-label side-label--row">
        <span>Your sequences</span>
        <button type="button" className="icon-btn icon-btn--sm" aria-label="New folder" title="New folder" onClick={newFolder}><FolderIcon plus /></button>
      </div>
      {groups.map((g) => {
        const isClosed = closed.includes(g.id);
        return (
          <div key={g.id} className="folder" data-x={g.user ? `fm-${g.id}` : undefined} data-x-label="Folder options">
            <div className="folder__head">
              <button type="button" className="folder__toggle" title={g.name} aria-expanded={!isClosed} onClick={() => setClosed((c) => (isClosed ? c.filter((x) => x !== g.id) : [...c, g.id]))}
                aria-label={`${g.name}, ${g.seqs.length} builds, ${isClosed ? 'folded' : 'open'}`} data-a={isClosed ? 'Open folder' : 'Fold away'}>
                <span className="folder__icon"><FolderIcon /></span>
                <span className="folder__name">{g.name}</span>
                <span className="folder__count" aria-hidden="true">{g.seqs.length} <span className={`caret ${isClosed ? '' : 'is-open'}`}>▾</span></span>
              </button>
              {g.user && <button type="button" id={`fm-${g.id}`} className="more-btn more-btn--sm" aria-label={`Options for ${g.name}`} onClick={(e) => folderMenu(e.currentTarget, g)}><MoreIcon /></button>}
            </div>
            {!isClosed && (
              <ul className="folder__list">
                {g.seqs.map((s) => <SeqRow key={s.id} seq={s} />)}
                {!g.seqs.length && <li className="folder__empty">{g.id === MY_BUILDS ? 'Saved builds land here.' : 'Empty — use Move to folder.'}</li>}
              </ul>
            )}
          </div>
        );
      })}
      <p className="side-foot" aria-hidden="true">{content.decks.length} decks · {content.cards.length} cards</p>
    </>
  );
}

/** Moving a build into a folder: every folder, plus "New folder…". Shared with My Studio. */
export function useFolderMenu() {
  const { state, dispatch } = useStore();
  const { ask } = useOverlays();
  const { toast } = useInput();
  return (seq: Sequence): MenuItem[] => {
    const current = state.folders.find((f) => f.id !== MY_BUILDS && f.sequenceIds.includes(seq.id))?.id ?? MY_BUILDS;
    return [
      ...state.folders.map((f) => ({ label: f.name, checked: f.id === current, onSelect: () => { dispatch({ type: 'folder/move', sequenceId: seq.id, folderId: f.id }); toast(`Moved to ${f.name}.`); } })),
      { label: 'New folder…', onSelect: async () => {
        const name = await ask({ title: 'New folder', label: 'Folder name', placeholder: 'Morning, Clients, Gentle…', confirm: 'Create and move' });
        if (name) { dispatch({ type: 'folder/create', folderId: `f-${Date.now().toString(36)}`, name, sequenceId: seq.id }); toast(`Moved to ${name}.`); }
      } }
    ];
  };
}

/** The ⋯ menu for a saved build — the same everywhere it appears. */
export function useSequenceMenu() {
  const { dispatch } = useStore();
  const { confirm, openMenu } = useOverlays();
  const { toast } = useInput();
  const folderItems = useFolderMenu();
  const load = useLoadSequence();
  const copy = useCopySequence();
  return (anchor: HTMLElement | null, seq: Sequence) => {
    const items: MenuItem[] = [
      { label: 'Load into the builder', onSelect: () => load(seq) },
      { label: 'Play it now', onSelect: () => dispatch({ type: 'play/start', sequenceId: seq.id }) }
    ];
    if (seq.seeded) items.push({ label: 'Copy to my builds', onSelect: () => void copy(seq) });
    else {
      items.push({ label: 'Move to folder', items: folderItems(seq) });
      items.push(seq.published
        ? { label: 'Published', disabled: true, hint: 'In the community feed' }
        : { label: 'Publish to community', onSelect: () => { dispatch({ type: 'sequence/publish', sequenceId: seq.id }); toast(`${seq.name} is in the community feed.`); } });
      items.push({ label: 'Delete', danger: true, onSelect: async () => {
        if (await confirm({ title: `Delete “${seq.name}”?`, body: 'The build is removed from this device. Points and unlocks you earned with it stay.', confirm: 'Delete build', danger: true })) {
          dispatch({ type: 'sequence/delete', sequenceId: seq.id });
          toast(`${seq.name} deleted.`);
        }
      } });
    }
    openMenu(anchor, seq.name, items);
  };
}

/** Copy someone's build into My builds and the builder (asking first if it would replace unsaved work). */
export function useCopySequence() {
  const { state, dispatch } = useStore();
  const { go } = useNav();
  const { confirm } = useOverlays();
  const { toast } = useInput();
  const draft = useDraft();
  return async (seq: Sequence) => {
    if (draft.dirty && !(await confirm({ title: 'Replace the build in progress?', body: `“${state.draftName.trim() || 'Untitled Build'}” has changes that aren’t saved. Copying ${seq.name} replaces them in the builder.`, confirm: 'Copy it' }))) return;
    dispatch({ type: 'sequence/copy', sequenceId: seq.id });
    toast(`A copy of ${seq.name} is in My builds and the builder.`);
    go('builder');
  };
}

/** Load a build, checking first if it would replace unsaved work. */
export function useLoadSequence() {
  const { state, dispatch } = useStore();
  const { go, setBuilder } = useNav();
  const { confirm } = useOverlays();
  const { toast } = useInput();
  const draft = useDraft();
  return async (seq: Sequence) => {
    if (state.draftSourceId === seq.id && !draft.dirty) { go('builder'); return; }
    if (draft.dirty && !(await confirm({ title: 'Replace the build in progress?', body: `“${state.draftName.trim() || 'Untitled Build'}” has changes that aren’t saved. Loading ${seq.name} replaces them.`, confirm: `Load ${seq.name}` }))) return;
    dispatch({ type: 'draft/load', sequenceId: seq.id });
    setBuilder({ selectedSlotId: null });
    go('builder');
    toast(seq.seeded ? `${seq.name} loaded — saving makes it yours.` : `${seq.name} loaded.`);
  };
}

function SeqRow({ seq }: { seq: Sequence }) {
  const { state, content } = useStore();
  const menu = useSequenceMenu();
  const load = useLoadSequence();
  const stats = sequenceStats(seq.slots, content);
  const current = state.draftSourceId === seq.id;
  return (
    <li className={`seq-row ${current ? 'is-current' : ''}`} data-x={`sm-${seq.id}`} data-x-label="Build options">
      <button type="button" className="seq-row__main" title={seq.name} onClick={() => load(seq)} aria-label={`${seq.name}, ${stats.totalCards} cards, ${stats.durationLabel}${current ? ', in the builder' : ''}`} data-a={current ? 'In the builder' : 'Load'}>
        <Mosaic cardIds={seq.slots.map((s) => s.cardId)} content={content} className="seq-row__art" />
        <span className="seq-row__text">
          <span className="seq-row__name">{seq.name}</span>
          <span className="seq-row__meta">{seq.seeded ? seq.author : `${stats.totalCards} cards · ${stats.durationLabel}`}{seq.published && !seq.seeded ? ' · published' : ''}</span>
        </span>
      </button>
      <button type="button" id={`sm-${seq.id}`} className="more-btn more-btn--sm" aria-label={`Options for ${seq.name}`} aria-haspopup="menu" onClick={(e) => menu(e.currentTarget, seq)}><MoreIcon /></button>
    </li>
  );
}
