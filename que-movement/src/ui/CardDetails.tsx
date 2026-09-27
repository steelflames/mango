import { POSITION_LABEL } from '../content/content';
import type { Card, MovementCard } from '../content/types';
import { clock, doseLabel, doseWithSetup, requirementProgress } from '../game/rules';
import { useStore } from '../game/store';
import { BigCard } from './Cards';
import { useNav } from './nav';
import { useOverlays } from './Overlays';
import { useDraft } from './useDraft';

/** The details peek: everything about one card, like Genshin's item details. */
export function CardDetails({ card }: { card: Card }) {
  const { state, content } = useStore();
  const { go, setBuilder, section } = useNav();
  const { closeSheet } = useOverlays();
  const draft = useDraft();
  const installed = !!content.cardById[card.id];
  const locked = card.kind === 'movement' && !state.unlockedCardIds.includes(card.id);
  const progress = card.kind === 'movement' && locked ? requirementProgress(state, content, card) : [];
  const practised = state.completedCounts[card.id] ?? 0;
  const target = card.kind === 'progression' ? draft.attachTarget() : undefined;

  const done = (ok: boolean) => { if (ok) { closeSheet(); if (section !== 'builder') go('builder'); } };

  const facts: [string, string][] = [];
  if (card.kind === 'movement') {
    facts.push(['Position', POSITION_LABEL[card.position]], ['Dose', doseLabel(card.dose)], ['About', clock(doseWithSetup(card.dose)) + ' with setup'], ['Points', `${card.points}`]);
    if (practised) facts.push(['Practised', `${practised}×`]);
  } else if (card.kind === 'transition') {
    facts.push(['Travels', `${card.from.map((p) => POSITION_LABEL[p]).join(' / ')} ↔ ${card.to.map((p) => POSITION_LABEL[p]).join(' / ')}`], ['Time', clock(card.duration)], ['Points', `${card.points}`]);
  } else {
    facts.push(['Effect', card.effect], ['Adds', clock(card.duration)], ['Points', `+${card.points}`]);
  }

  return (
    <div className="details">
      <div className="details__card"><BigCard card={card} content={content} locked={locked} glow={!locked && installed} compact /></div>
      <div className="details__info">
        <dl className="facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        {!installed && <p className="muted">This card belongs to a pack that isn’t added yet. Packs live in My Studio.</p>}
        {locked && card.kind === 'movement' && (
          <div className="req">
            <p className="req__title">To open it</p>
            <ul>
              {(card as MovementCard).requirements.map((r, i) => (
                <li key={r} className={progress[i] ? 'is-done' : ''}><span aria-hidden="true">{progress[i] ? '✓' : '○'}</span> {r}</li>
              ))}
            </ul>
            <p className="muted">Foundation is complete on its own. This is another way in, not a better one.</p>
          </div>
        )}
        <div className="details__actions">
          {installed && !locked && card.kind !== 'progression' && (
            <button type="button" className="btn btn--primary" data-autofocus="" aria-disabled={draft.full || undefined} onClick={() => done(draft.add(card))}>Add to sequence</button>
          )}
          {installed && card.kind === 'progression' && (
            <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => done(draft.attach(card))}>
              {target ? `Attach to ${content.cardById[target.cardId]?.name}` : 'Attach to a movement'}
            </button>
          )}
          {card.kind === 'movement' && installed && (
            <button type="button" className="btn btn--ghost" data-autofocus={locked ? '' : undefined} onClick={() => { setBuilder({ coll: card.deckId, level: 'all', query: '' }); closeSheet(); go('builder'); }}>
              All of {content.deckById[card.deckId]?.name}
            </button>
          )}
          {!installed && <button type="button" className="btn btn--ghost" data-autofocus="" onClick={() => { closeSheet(); go('studio'); }}>Open My Studio</button>}
        </div>
      </div>
    </div>
  );
}
