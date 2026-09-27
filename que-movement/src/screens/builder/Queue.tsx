import { Fragment, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { RULES } from '../../content/catalog';
import { POSITION_LABEL } from '../../content/content';
import type { Card } from '../../content/types';
import { clock, mixLabel, readSeams, sequenceStats, transitionsFor, type Seam, type SlotView } from '../../game/rules';
import { useStore } from '../../game/store';
import { MY_BUILDS } from '../../game/types';
import { focusEl, useBack, useDirections, useInput } from '../../input/InputProvider';
import { Art } from '../../ui/Cards';
import { CardDetails } from '../../ui/CardDetails';
import { useNav } from '../../ui/nav';
import { useOverlays, type MenuItem } from '../../ui/Overlays';
import { useDraft } from '../../ui/useDraft';
import { MoreIcon } from './Library';

function GripIcon() {
  return <svg viewBox="0 0 12 18" width="10" height="15" aria-hidden="true" fill="currentColor">{[3, 9, 15].map((y) => [3, 9].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.4" />))}</svg>;
}

interface Drag { slotId: string; from: number; startY: number; dy: number; over: number; active: boolean; pointerId: number }

/** Right column: the build, like a playlist — name it, reorder it, bridge its seams, start it. */
export function Queue() {
  const { state, dispatch, content } = useStore();
  const { builder, setBuilder } = useNav();
  const { openMenu, confirm, ask, openSheet } = useOverlays();
  const { toast, mode } = useInput();
  const draft = useDraft();
  const slots = state.draftSlots;
  const stats = sequenceStats(slots, content);
  const { seams, transitionStatus, openSeams, route } = readSeams(slots, content);
  const listRef = useRef<HTMLOListElement>(null);
  const headMore = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const [moving, setMoving] = useState<{ slotId: string; from: number } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const prevIds = useRef<string[]>(slots.map((s) => s.slotId));

  // New steps scroll into view (the list is a playlist: you should see what you just added).
  useEffect(() => {
    const added = slots.find((s) => !prevIds.current.includes(s.slotId));
    prevIds.current = slots.map((s) => s.slotId);
    if (added) window.setTimeout(() => listRef.current?.querySelector(`[data-slot-row="${added.slotId}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30);
  }, [slots]);

  // Keep the carried step's handle focused while it travels.
  useEffect(() => {
    if (!moving) return;
    const el = document.querySelector<HTMLElement>(`[data-grip="${moving.slotId}"]`);
    if (el && document.activeElement !== el && mode === 'pad') focusEl(el);
    else el?.scrollIntoView({ block: 'nearest' });
  }, [slots, moving, mode]);

  const indexOf = (slotId: string) => slots.findIndex((s) => s.slotId === slotId);
  const moveBy = (slotId: string, d: number) => {
    const i = indexOf(slotId);
    const to = Math.max(0, Math.min(slots.length - 1, i + d));
    if (to !== i) dispatch({ type: 'draft/move', from: i, to });
  };
  const finishMove = () => { if (moving) { const i = indexOf(moving.slotId); if (i !== moving.from) toast(`Moved to step ${i + 1}.`); } setMoving(null); };
  const cancelMove = () => {
    if (!moving) return;
    const i = indexOf(moving.slotId);
    if (i !== moving.from && i >= 0) dispatch({ type: 'draft/move', from: i, to: moving.from });
    setMoving(null);
  };
  useDirections(!!moving, (d) => { if (moving && (d === 'up' || d === 'down')) moveBy(moving.slotId, d === 'up' ? -1 : 1); return true; });
  useBack(!!moving, 'Cancel move', cancelMove);

  // ---------- pointer drag on the step number ----------
  const onGripDown = (e: RPointerEvent<HTMLButtonElement>, slotId: string) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ slotId, from: indexOf(slotId), startY: e.clientY, dy: 0, over: indexOf(slotId), active: false, pointerId: e.pointerId });
  };
  const onGripMove = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dy = e.clientY - drag.startY;
    const active = drag.active || Math.abs(dy) > 6;
    let over = drag.from;
    if (active) {
      const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-slot-row]') ?? []);
      over = 0;
      rows.forEach((r, i) => {
        if (i === drag.from) return;
        const b = r.getBoundingClientRect();
        if (e.clientY > b.top + b.height / 2) over = i < drag.from ? i + 1 : i;
      });
      // keep the list scrolling when dragging near its edges
      const box = listRef.current?.getBoundingClientRect();
      if (box && listRef.current) {
        if (e.clientY < box.top + 30) listRef.current.scrollTop -= 8;
        else if (e.clientY > box.bottom - 30) listRef.current.scrollTop += 8;
      }
    }
    setDrag({ ...drag, dy, active, over });
  };
  const onGripUp = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (drag.active) {
      if (drag.over !== drag.from) { dispatch({ type: 'draft/move', from: drag.from, to: drag.over }); toast(`Moved to step ${drag.over + 1}.`); }
    } else toggleMove(drag.slotId);
    setDrag(null);
  };
  const toggleMove = (slotId: string) => {
    if (moving?.slotId === slotId) finishMove();
    else setMoving({ slotId, from: indexOf(slotId) });
  };

  // ---------- menus ----------
  const rowMenu = (anchor: HTMLElement, v: SlotView, i: number) => {
    const items: MenuItem[] = [
      { label: 'Details', onSelect: () => openSheet({ eyebrow: `Step ${i + 1}`, title: v.card.name, body: <CardDetails card={v.card} /> }) },
      { label: 'Move', hint: mode === 'pad' ? 'Then ↑ ↓, A to drop' : 'Then ▲ ▼, or drag the number', onSelect: () => setMoving({ slotId: v.slot.slotId, from: i }) },
      { label: 'Move to start', disabled: i === 0, onSelect: () => dispatch({ type: 'draft/move', from: i, to: 0 }) },
      { label: 'Move to end', disabled: i === slots.length - 1, onSelect: () => dispatch({ type: 'draft/move', from: i, to: slots.length - 1 }) }
    ];
    if (v.card.kind === 'movement') {
      const progs = content.specialCards.filter((c) => c.kind === 'progression');
      items.push({
        label: 'Add a progression', disabled: v.modifiers.length >= RULES.maxProgressionsPerCard, hint: v.modifiers.length >= RULES.maxProgressionsPerCard ? `Holds ${RULES.maxProgressionsPerCard}` : undefined,
        items: progs.map((p) => ({ label: p.name, checked: v.slot.modifiers.includes(p.id), disabled: v.slot.modifiers.includes(p.id), hint: p.kind === 'progression' ? p.effect : undefined, onSelect: () => draft.attach(p, v.slot) }))
      });
      for (const m of v.modifiers) items.push({ label: `Take off ${m.name}`, onSelect: () => dispatch({ type: 'draft/detach', slotId: v.slot.slotId, cardId: m.id }) });
    }
    items.push({ label: 'Remove from build', danger: true, onSelect: () => { dispatch({ type: 'draft/remove', slotId: v.slot.slotId }); if (builder.selectedSlotId === v.slot.slotId) setBuilder({ selectedSlotId: null }); toast(`${v.card.name} removed.`); } });
    openMenu(anchor, `${i + 1}. ${v.card.name}`, items);
  };

  const newBuild = async () => {
    if (draft.dirty && !(await confirm({ title: 'Start a new build?', body: 'The build in progress has changes that aren’t saved. They’ll be let go.', confirm: 'New build' }))) return;
    dispatch({ type: 'draft/new' });
    setBuilder({ selectedSlotId: null });
  };
  const headMenu = () => openMenu(headMore.current, 'This build', [
    { label: 'New build', onSelect: newBuild },
    { label: 'Clear all steps', disabled: !slots.length, onSelect: async () => { if (await confirm({ title: 'Clear every step?', body: 'The name stays. Saved copies are untouched.', confirm: 'Clear steps', danger: true })) dispatch({ type: 'draft/clear' }); } }
  ]);

  const saveTo = (folderId: string, name: string) => { dispatch({ type: 'sequence/save', folderId }); toast(`Saved to ${name}.`); };
  const saveMenu = () => {
    const current = draft.source ? state.folders.find((f) => f.id !== MY_BUILDS && f.sequenceIds.includes(draft.source!.id))?.id ?? MY_BUILDS : null;
    openMenu(saveRef.current, draft.source ? 'Save changes to…' : 'Save to…', [
      ...state.folders.map((f) => ({ label: f.name, checked: current === f.id, onSelect: () => saveTo(f.id, f.name) })),
      { label: 'New folder…', onSelect: async () => {
        const name = await ask({ title: 'Save to a new folder', label: 'Folder name', placeholder: 'Morning, Clients, Gentle…', confirm: 'Create and save' });
        if (!name) return;
        const id = `f-${Date.now().toString(36)}`;
        dispatch({ type: 'folder/create', folderId: id, name });
        dispatch({ type: 'sequence/save', folderId: id });
        toast(`Saved to ${name}.`);
      } }
    ]);
  };

  const start = () => { if (slots.length) dispatch({ type: 'sequence/saveAndStart' }); };
  const seamBefore = new Map<number, Seam>(seams.filter((s) => s.status === 'open').map((s) => [s.index, s]));
  const pct = (n: number) => `${(n / RULES.maxSteps) * 100}%`;

  return (
    <aside className="queue" aria-label="Your sequence">
      <header className="queue__head">
        <p className="eyebrow">Your sequence</p>
        <button ref={headMore} type="button" className="more-btn" aria-label="Build options" aria-haspopup="menu" onClick={headMenu}><MoreIcon /></button>
      </header>
      <label className="queue__name">
        <span className="sr-only">Name this build</span>
        <input value={state.draftName} maxLength={48} placeholder="Name this build…" onChange={(e) => dispatch({ type: 'draft/name', name: e.target.value })} />
      </label>
      <div className="queue__stats">
        <div className="queue__nums"><span><strong>{slots.length}</strong> of {RULES.maxSteps} steps</span><span><strong>{clock(stats.durationSeconds)}</strong> total</span></div>
        <div className="mixbar" aria-hidden="true">
          <span className="mixbar__f" style={{ width: pct(stats.mix.foundation) }} />
          <span className="mixbar__w" style={{ width: pct(stats.mix.working) }} />
          <span className="mixbar__c" style={{ width: pct(stats.mix.challenge) }} />
          <span className="mixbar__s" style={{ width: pct(stats.transitionCount) }} />
        </div>
        <p className="queue__mix">{mixLabel(stats.mix)}{stats.transitionCount ? ` · ${stats.transitionCount} transition${stats.transitionCount > 1 ? 's' : ''}` : ''}{stats.progressionCount ? ` · ${stats.progressionCount} progression${stats.progressionCount > 1 ? 's' : ''}` : ''}</p>
      </div>

      <ol ref={listRef} className={`queue__list scroll ${drag?.active ? 'is-dragging' : ''}`}>
        {!slots.length && (
          <li className="queue__empty">
            <p className="queue__empty-title">An empty page</p>
            <p>Tap a card to add it. Mix decks, then bridge any change of position with a transition.</p>
            <p className="muted">Five steps with Bridging, Scapula and Core together is a Full Practice.</p>
          </li>
        )}
        {stats.views.map((v, i) => {
          const seam = seamBefore.get(i);
          const id = v.slot.slotId;
          const selected = builder.selectedSlotId === id;
          const isMoving = moving?.slotId === id;
          const isDragged = drag?.active && drag.slotId === id;
          const tStatus = v.card.kind === 'transition' ? transitionStatus[id] : undefined;
          return (
            <Fragment key={id}>
              {drag?.active && drag.over === i && drag.from > i && <li className="drop-line" aria-hidden="true" />}
              {seam && <SeamNote seam={seam} />}
              <li
                data-slot-row={id}
                className={`q-row q-row--${v.card.kind} ${selected ? 'is-selected' : ''} ${isMoving ? 'is-moving' : ''} ${isDragged ? 'is-dragged' : ''} ${tStatus ? `is-${tStatus}` : ''}`}
                style={isDragged ? { transform: `translateY(${drag!.dy}px)` } : undefined}
                data-x={`qm-${id}`} data-x-label="Step options"
              >
                <button type="button" className="q-row__grip" data-grip={id}
                  aria-label={isMoving ? `Step ${i + 1}, moving. Up or down, then press to drop` : `Step ${i + 1}. Move it`}
                  aria-pressed={isMoving}
                  data-a={isMoving ? 'Drop here' : 'Pick up to move'}
                  onPointerDown={(e) => onGripDown(e, id)} onPointerMove={onGripMove} onPointerUp={onGripUp} onPointerCancel={() => setDrag(null)}
                  onClick={(e) => { if (e.detail === 0) toggleMove(id); }}>
                  <span className="q-row__num">{i + 1}</span><GripIcon />
                </button>
                <button type="button" className="q-row__main" aria-pressed={selected} onClick={() => setBuilder({ selectedSlotId: selected ? null : id })}
                  aria-label={`${v.card.name}${v.modifiers.length ? ` with ${v.modifiers.map((m) => m.name).join(' and ')}` : ''}, ${clock(v.duration)}${selected ? ', selected' : ''}`}
                  data-a={selected ? 'Unselect' : 'Select'}>
                  <span className="q-row__art"><Art card={v.card} content={content} /></span>
                  <span className="q-row__text">
                    <span className="q-row__name">{v.card.name}</span>
                    <span className="q-row__meta">{rowMeta(v.card)} · {clock(v.duration)}</span>
                    {v.modifiers.length > 0 && <span className="q-row__mods">+ {v.modifiers.map((m) => m.name).join(' + ')}</span>}
                    {tStatus && <span className="q-row__status">{tStatus === 'matched' ? 'Bridges the change here' : tStatus === 'unneeded' ? 'No change of position here' : 'Doesn’t match the change here'}</span>}
                  </span>
                </button>
                {isMoving ? (
                  <span className="q-row__movers">
                    <button type="button" className="icon-btn icon-btn--sm" aria-label="Move up" disabled={i === 0} onClick={() => moveBy(id, -1)}>▲</button>
                    <button type="button" className="icon-btn icon-btn--sm" aria-label="Move down" disabled={i === slots.length - 1} onClick={() => moveBy(id, 1)}>▼</button>
                    <button type="button" className="icon-btn icon-btn--sm icon-btn--ok" aria-label="Done moving" onClick={finishMove}>✓</button>
                  </span>
                ) : (
                  <button type="button" id={`qm-${id}`} className="more-btn" aria-label={`Options for step ${i + 1}, ${v.card.name}`} aria-haspopup="menu" onClick={(e) => rowMenu(e.currentTarget, v, i)}><MoreIcon /></button>
                )}
              </li>
              {drag?.active && drag.over === i && drag.from < i && <li className="drop-line" aria-hidden="true" />}
            </Fragment>
          );
        })}
      </ol>

      <footer className="queue__foot">
        {route.length > 1 && (
          <p className="queue__route"><span className="eyebrow">Route</span> {route.map((p) => POSITION_LABEL[p]).join(' → ')}</p>
        )}
        {slots.length > 0 && (
          <p className="queue__flow">
            {openSeams === 0
              ? route.length > 1 ? 'Every change of position is bridged. Lovely flow.' : 'One position throughout — no transitions needed.'
              : `${openSeams} position change${openSeams > 1 ? 's' : ''} with no transition — playable as is, smoother with one.`}
          </p>
        )}
        <div className="queue__actions">
          <button ref={saveRef} type="button" className="btn btn--ghost" aria-haspopup="menu" aria-disabled={!slots.length || undefined} onClick={() => slots.length && saveMenu()}
            data-a={draft.dirty ? 'Save' : 'Saved'}>
            {slots.length && !draft.dirty ? 'Saved ✓' : 'Save'} <span aria-hidden="true">▾</span>
          </button>
          <button type="button" className="btn btn--primary btn--grow" aria-disabled={!slots.length || undefined} onClick={start}>
            <span aria-hidden="true">▶</span> Start sequence
          </button>
        </div>
      </footer>
    </aside>
  );
}

function rowMeta(card: Card) {
  if (card.kind === 'movement') return POSITION_LABEL[card.position];
  if (card.kind === 'transition') return `${POSITION_LABEL[card.from[0]]} → ${POSITION_LABEL[card.to[0]]}`;
  return card.effect;
}

/** Between two cards whose positions differ: say so, and offer the transitions that fit. */
function SeamNote({ seam }: { seam: Seam }) {
  const { content } = useStore();
  const draft = useDraft();
  const fits = transitionsFor(seam.from, seam.to, content).slice(0, 2);
  return (
    <li className="seam" aria-label={`${POSITION_LABEL[seam.from]} to ${POSITION_LABEL[seam.to]}: needs a transition`}>
      <span className="seam__text">{POSITION_LABEL[seam.from]} → {POSITION_LABEL[seam.to]} · needs a transition</span>
      {fits.length > 0 && !draft.full && (
        <span className="seam__fits">
          {fits.map((t) => (
            <button key={t.id} type="button" className="seam__add" onClick={() => draft.add(t, seam.index)} data-a={`Add ${t.name}`}>+ {t.name}</button>
          ))}
        </span>
      )}
    </li>
  );
}
