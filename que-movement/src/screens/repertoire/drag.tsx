import { createContext, useCallback, useContext, useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import type { Card } from '../../content/types';
import { useStore } from '../../game/store';
import { useInput } from '../../input/InputProvider';
import { Art } from '../../ui/Cards';
import { useDraft } from '../../ui/useDraft';

// Drag a Qcard from the library onto the Sequence (to place it), onto a step (to attach a
// progression) or onto a deck in the sidebar. Mouse drags after a small move; touch after a
// short press, so scrolling the library still works. A plain tap still adds the card.

export type DropTarget = { kind: 'deck'; deckId: string } | { kind: 'queue'; index: number } | { kind: 'slot'; slotId: string } | null;
interface DragState { card: Card; x: number; y: number; target: DropTarget }
interface Pending { card: Card; pointerId: number; type: string; x0: number; y0: number; el: HTMLElement; timer: number; active: boolean }

interface DragApi {
  drag: DragState | null;
  bind: (card: Card) => {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLElement>) => void;
    onPointerCancel: () => void;
    onClickCapture: (e: MouseEvent<HTMLElement>) => void;
  };
}

const Ctx = createContext<DragApi | null>(null);

function findTarget(card: Card, x: number, y: number): DropTarget {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const deck = el.closest<HTMLElement>('[data-drop-deck]');
  if (deck) return { kind: 'deck', deckId: deck.dataset.dropDeck! };
  const queue = el.closest<HTMLElement>('[data-drop-queue]');
  if (!queue) return null;
  if (card.kind === 'progression') {
    const row = el.closest<HTMLElement>('[data-slot-row]');
    return row && row.dataset.kind === 'movement' ? { kind: 'slot', slotId: row.dataset.slotRow! } : null;
  }
  const rows = Array.from(queue.querySelectorAll<HTMLElement>('[data-slot-row]'));
  const index = rows.filter((r) => { const b = r.getBoundingClientRect(); return y > b.top + b.height / 2; }).length;
  return { kind: 'queue', index };
}

const stopScroll = (e: TouchEvent) => e.preventDefault();

export function DragProvider({ children }: { children: ReactNode }) {
  const { state, dispatch, content } = useStore();
  const { toast } = useInput();
  const draft = useDraft();
  const [drag, setDrag] = useState<DragState | null>(null);
  const pending = useRef<Pending | null>(null);
  const suppress = useRef(false);
  const dropRef = useRef<(card: Card, t: DropTarget) => void>(() => undefined);

  dropRef.current = (card, t) => {
    if (!t) return;
    if (t.kind === 'deck') {
      const deck = state.decks.find((d) => d.id === t.deckId);
      if (!deck) return;
      if (deck.cardIds.includes(card.id)) toast(`${card.name} is already in ${deck.name}.`);
      else { dispatch({ type: 'deck/add', deckId: deck.id, cardId: card.id }); toast(`${card.name} added to ${deck.name}.`); }
    } else if (t.kind === 'queue') draft.add(card, t.index);
    else {
      const slot = state.draftSlots.find((s) => s.slotId === t.slotId);
      if (slot) draft.attach(card, slot);
    }
  };

  const end = useCallback(() => {
    const p = pending.current;
    if (p) window.clearTimeout(p.timer);
    pending.current = null;
    document.removeEventListener('touchmove', stopScroll);
    document.documentElement.classList.remove('is-card-dragging');
    setDrag(null);
  }, []);
  useEffect(() => end, [end]);

  const begin = (p: Pending, x: number, y: number) => {
    p.active = true;
    try { p.el.setPointerCapture(p.pointerId); } catch { /* the pointer is already gone */ }
    document.addEventListener('touchmove', stopScroll, { passive: false });
    document.documentElement.classList.add('is-card-dragging');
    navigator.vibrate?.(8);
    setDrag({ card: p.card, x, y, target: findTarget(p.card, x, y) });
  };

  const bind = (card: Card) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || !state.ownedCardIds.includes(card.id)) return;
      const p: Pending = { card, pointerId: e.pointerId, type: e.pointerType, x0: e.clientX, y0: e.clientY, el: e.currentTarget, timer: 0, active: false };
      if (e.pointerType === 'touch') {
        const { clientX, clientY } = e;
        p.timer = window.setTimeout(() => { if (pending.current === p) begin(p, clientX, clientY); }, 320);
      }
      pending.current = p;
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const p = pending.current;
      if (!p || e.pointerId !== p.pointerId) return;
      if (!p.active) {
        const moved = Math.hypot(e.clientX - p.x0, e.clientY - p.y0);
        if (moved < 6) return;
        if (p.type === 'touch') { end(); return; }
        begin(p, e.clientX, e.clientY);
        return;
      }
      setDrag({ card: p.card, x: e.clientX, y: e.clientY, target: findTarget(p.card, e.clientX, e.clientY) });
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const p = pending.current;
      if (!p || e.pointerId !== p.pointerId) return;
      if (p.active) {
        suppress.current = true;
        dropRef.current(p.card, findTarget(p.card, e.clientX, e.clientY));
      }
      end();
    },
    onPointerCancel: () => end(),
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (suppress.current) { suppress.current = false; e.preventDefault(); e.stopPropagation(); }
    }
  });

  return (
    <Ctx.Provider value={{ drag, bind }}>
      {children}
      {drag && (
        <div className={`drag-ghost ${drag.target ? 'is-over' : ''}`} style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <span className="drag-ghost__art"><Art card={drag.card} content={content} /></span>
          <span className="drag-ghost__name">{drag.card.name}</span>
          <span className="drag-ghost__hint">{!drag.target ? (drag.card.kind === 'progression' ? 'Drop on a movement' : 'Drop on the Sequence or a deck') : drag.target.kind === 'deck' ? 'Add to deck' : drag.target.kind === 'slot' ? 'Attach here' : `Place as step ${drag.target.index + 1}`}</span>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useCardDrag(): DragApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCardDrag must be used inside DragProvider');
  return c;
}
