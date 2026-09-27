import { POSITION_LABEL } from '../content/content';
import type { Card } from '../content/types';
import { clock, doseLabel, doseWithSetup, readNode } from '../game/rules';
import { useStore } from '../game/store';
import { useInput } from '../input/InputProvider';
import { BigCard } from './Cards';
import { useNav } from './nav';
import { useOverlays } from './Overlays';
import { useDraft } from './useDraft';

/** The details peek: everything about one Qcard, and what you can do with it. */
export function CardDetails({ card }: { card: Card }) {
  const { state, dispatch, content } = useStore();
  const { go, section } = useNav();
  const { closeSheet } = useOverlays();
  const { toast } = useInput();
  const draft = useDraft();
  const owned = state.ownedCardIds.includes(card.id);
  const archived = state.archivedCardIds.includes(card.id);
  const node = content.nodeByCard[card.id];
  const reading = node && !owned ? readNode(node, state, content) : null;
  const practised = state.completedCounts[card.id] ?? 0;
  const primary = state.decks.find((d) => d.id === state.primaryDeckId)!;
  const inPrimary = primary.cardIds.includes(card.id);
  const target = card.kind === 'progression' ? draft.attachTarget() : undefined;

  const done = (ok: boolean) => { if (ok) { closeSheet(); if (section !== 'repertoire') go('repertoire'); } };

  const facts: [string, string][] = [];
  if (card.kind === 'movement') {
    facts.push(['Path', content.pathById[card.pathId]?.name ?? ''], ['Position', POSITION_LABEL[card.position]], ['Dose', doseLabel(card.dose)], ['About', clock(doseWithSetup(card.dose)) + ' with setup'], ['Points', `${card.points}`]);
  } else if (card.kind === 'transition') {
    facts.push(['Travels', `${card.from.map((p) => POSITION_LABEL[p]).join(' / ')} ↔ ${card.to.map((p) => POSITION_LABEL[p]).join(' / ')}`], ['Time', clock(card.duration)], ['Points', `${card.points}`]);
  } else {
    facts.push(['Effect', card.effect], ['Adds', card.duration ? clock(card.duration) : 'Double time'], ['Points', `+${card.points}`]);
  }
  if (practised) facts.push(['Performed', `${practised}×`]);

  return (
    <div className="details">
      <div className="details__card"><BigCard card={card} content={content} locked={!owned} glow={owned} compact /></div>
      <div className="details__info">
        <dl className="facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        {reading && node && (
          <div className="req">
            <p className="req__title">To learn this Technique</p>
            <ul>{reading.steps.map((s) => <li key={s.label} className={s.done ? 'is-done' : ''}><span aria-hidden="true">{s.done ? '✓' : '○'}</span> {s.label}</li>)}</ul>
          </div>
        )}
        {archived && <p className="muted">Archived. It’s kept safe, just out of the way. Restore it any time.</p>}
        <div className="details__actions">
          {owned && card.kind !== 'progression' && (
            <button type="button" className="btn btn--primary" data-autofocus="" aria-disabled={draft.full || undefined} onClick={() => done(draft.add(card))}>Add to Sequence</button>
          )}
          {owned && card.kind === 'progression' && (
            <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => done(draft.attach(card))}>
              {target ? `Attach to ${content.cardById[target.cardId]?.name}` : 'Attach to a movement'}
            </button>
          )}
          {owned && card.kind !== 'transition' && !inPrimary && (
            <button type="button" className="btn btn--ghost" onClick={() => { dispatch({ type: 'deck/add', deckId: primary.id, cardId: card.id }); toast(`${card.name} added to ${primary.name}.`); }}>Add to {primary.name}</button>
          )}
          {owned && (archived
            ? <button type="button" className="btn btn--ghost" onClick={() => { dispatch({ type: 'card/restore', cardId: card.id }); toast(`${card.name} restored.`); }}>Restore from archive</button>
            : <button type="button" className="btn btn--ghost" onClick={() => { dispatch({ type: 'card/archive', cardId: card.id }); toast(`${card.name} archived. Find it under Archive.`); closeSheet(); }}>Archive</button>)}
          {!owned && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { closeSheet(); go('technique'); }}>See it in Technique</button>}
        </div>
      </div>
    </div>
  );
}
