import { RULES } from '../content/catalog';
import type { Card } from '../content/types';
import { signature } from '../game/rules';
import { useStore } from '../game/store';
import type { Slot } from '../game/types';
import { useInput } from '../input/InputProvider';
import { useNav } from './nav';
import { sfx } from './sound';

/** Adding and attaching Qcards to the Sequence in progress, with the same limits and
 *  the same gentle messages wherever it happens (tiles, drag and drop, menus, the details peek). */
export function useDraft() {
  const { state, dispatch, content } = useStore();
  const { builder } = useNav();
  const { toast } = useInput();
  const slots = state.draftSlots;
  const full = slots.length >= RULES.maxSteps;
  const selIndex = slots.findIndex((s) => s.slotId === builder.selectedSlotId);

  const isOpen = (card: Card) => state.ownedCardIds.includes(card.id);

  /** Where a progression goes: the selected step if it is a movement, else the last movement. */
  const attachTarget = (): Slot | undefined => {
    const sel = slots[selIndex];
    if (sel && content.cardById[sel.cardId]?.kind === 'movement') return sel;
    return [...slots].reverse().find((s) => content.cardById[s.cardId]?.kind === 'movement');
  };

  const attach = (card: Card, target: Slot | undefined = attachTarget()) => {
    if (!isOpen(card)) { toast(`${card.name} isn’t in your Repertoire yet. Learn it in Technique.`); return false; }
    if (!target) { toast('A progression needs a movement to change. Add one first.'); return false; }
    const name = content.cardById[target.cardId]?.name ?? 'that card';
    if (target.modifiers.includes(card.id)) { toast(`${card.name} is already on ${name}.`); return false; }
    if (target.modifiers.length >= RULES.maxProgressionsPerCard) { toast(`${name} already carries ${RULES.maxProgressionsPerCard} progressions.`); return false; }
    dispatch({ type: 'draft/attach', slotId: target.slotId, cardId: card.id });
    sfx.add(slots.indexOf(target) + 4);
    toast(`${card.name} added to ${name}.`);
    return true;
  };

  const add = (card: Card, index?: number) => {
    if (card.kind === 'progression') {
      const t = index !== undefined ? [...slots.slice(0, index)].reverse().find((s) => content.cardById[s.cardId]?.kind === 'movement') : undefined;
      return attach(card, t);
    }
    if (!isOpen(card)) { toast(`${card.name} isn’t in your Repertoire yet. Learn it in Technique.`); return false; }
    if (full) { toast(`A Sequence holds up to ${RULES.maxSteps} steps.`); return false; }
    // With a step selected, new cards slot in just above it.
    if (index === undefined && selIndex >= 0) index = selIndex;
    dispatch({ type: 'draft/add', cardId: card.id, index });
    sfx.add(slots.length);
    const where = index === 0 && slots.length ? ' at the start' : index !== undefined && index < slots.length ? ` as step ${index + 1}` : '';
    toast(`${card.name} added${where} · ${slots.length + 1} of ${RULES.maxSteps}`);
    return true;
  };

  const source = state.sequences.find((s) => s.id === state.draftSourceId);
  const dirty = slots.length > 0 && (!source
    || signature(source.slots).join('|') !== signature(slots).join('|')
    || source.name !== (state.draftName.trim() || 'Untitled Sequence'));

  return { slots, full, selIndex, isOpen, attachTarget, attach, add, dirty, source };
}
