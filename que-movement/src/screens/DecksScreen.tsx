import { useEffect } from 'react';
import { LEVEL_ORDER } from '../content/content';
import type { MovementCard } from '../content/types';
import { requirementProgress } from '../game/rules';
import { useStore } from '../game/store';
import { usePrimary } from '../input/InputProvider';
import { CardArt } from '../ui/art/CardArt';
import { Art, LockIcon, Tag } from '../ui/Cards';
import { CardDetails } from '../ui/CardDetails';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';

const TILT = [-8, -3, 3, 8, 11];

/** Decks: your decks as a fanned hand; the chosen one opens beside it. */
export function DecksScreen() {
  const { state, content } = useStore();
  const { go, setBuilder, deckFocus, setDeckFocus } = useNav();
  const { openSheet } = useOverlays();
  const packsToAdd = content.expansions.filter((e) => e.available && !state.installedPackIds.includes(e.id) && e.deckIds.length);
  const hand = [
    ...content.decks.map((d) => ({ kind: 'deck' as const, id: d.id })),
    ...packsToAdd.map((p) => ({ kind: 'pack' as const, id: p.id }))
  ];
  const selId = hand.some((h) => h.id === deckFocus) ? deckFocus! : hand[0]?.id;
  useEffect(() => { if (selId && selId !== deckFocus) setDeckFocus(selId); }, [selId, deckFocus, setDeckFocus]);
  const sel = hand.find((h) => h.id === selId);
  const deck = sel?.kind === 'deck' ? content.deckById[sel.id] : null;
  const pack = sel?.kind === 'pack' ? content.expansions.find((e) => e.id === sel.id) : null;
  const cards = deck ? content.movementCards.filter((c) => c.deckId === deck.id).sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]) : [];
  const buildWith = () => { if (deck) { setBuilder({ coll: deck.id, level: 'all', query: '' }); go('builder'); } };
  usePrimary(!!deck, deck ? `Build with ${deck.name}` : '', buildWith);

  return (
    <div className="screen decks">
      <header className="page-head">
        <div>
          <p className="eyebrow">Beautiful decks · Meaningful movement</p>
          <h1 className="page-title">Decks</h1>
          <p className="page-sub">Every deck holds the same movement at three depths. Foundation is complete on its own.</p>
        </div>
      </header>

      <div className="decks__body">
        <div className="hand" role="group" aria-label="Your decks">
          {hand.map((h, i) => {
            const on = h.id === selId;
            if (h.kind === 'pack') {
              const p = content.expansions.find((e) => e.id === h.id)!;
              const firstCard = content.allMovementCards.find((c) => c.deckId === p.deckIds[0]);
              return (
                <button key={h.id} type="button" className={`hand-card is-pack ${on ? 'is-on' : ''}`} style={{ ['--tilt' as string]: `${on ? 0 : TILT[i] ?? 0}deg`, zIndex: i + 1 }}
                  aria-pressed={on} aria-label={`${p.name}, expansion pack, not added yet`} onClick={() => setDeckFocus(h.id)} data-a={on ? 'Chosen' : `Choose ${p.name}`}>
                  <span className="hand-card__art">{firstCard && <CardArt art={firstCard.art} kind="movement" deckAccent="var(--sage)" />}</span>
                  <span className="hand-card__eyebrow">Expansion pack</span>
                  <span className="hand-card__name">{p.name}</span>
                  <span className="hand-card__sub">Not added yet</span>
                </button>
              );
            }
            const d = content.deckById[h.id];
            const dc = content.movementCards.filter((c) => c.deckId === d.id);
            const open = dc.filter((c) => state.unlockedCardIds.includes(c.id)).length;
            const cover = dc.find((c) => c.level === 'foundation') ?? dc[0];
            return (
              <button key={h.id} type="button" className={`hand-card ${on ? 'is-on' : ''}`} style={{ ['--tilt' as string]: `${on ? 0 : TILT[i] ?? 0}deg`, ['--accent' as string]: `var(${d.accentVar})`, zIndex: i + 1 }}
                aria-pressed={on} aria-label={`${d.name} deck, ${open} of ${dc.length} open`} onClick={() => setDeckFocus(h.id)} data-a={on ? 'Chosen' : `Choose ${d.name}`}>
                <span className="hand-card__art">{cover && <CardArt art={cover.art} kind="movement" deckAccent={`var(${d.accentVar})`} />}</span>
                <span className="hand-card__eyebrow">Deck · {open}/{dc.length} open</span>
                <span className="hand-card__name">{d.name}</span>
                <span className="hand-card__sub">{d.tagline}</span>
              </button>
            );
          })}
        </div>

        <section className="deck-detail" aria-live="polite">
          {deck && (
            <>
              <p className="eyebrow">{deck.tagline}</p>
              <h2 className="deck-detail__name">{deck.name}</h2>
              <p className="deck-detail__desc">{deck.description}</p>
              <ul className="deck-detail__cards">
                {cards.map((c) => <DeckCardRow key={c.id} card={c} onOpen={() => openSheet({ eyebrow: `${deck.name} deck`, title: c.name, body: <CardDetails card={c} /> })} />)}
              </ul>
              <div className="deck-detail__actions">
                <button type="button" className="btn btn--primary btn--big" onClick={buildWith}>Build with {deck.name} →</button>
              </div>
            </>
          )}
          {pack && (
            <>
              <p className="eyebrow">Expansion pack</p>
              <h2 className="deck-detail__name">{pack.name}</h2>
              <p className="deck-detail__desc">{pack.description}</p>
              <p className="muted">Packs are added from My Studio. They bring decks, cards, challenges and a skin — nothing about the screens changes.</p>
              <div className="deck-detail__actions">
                <button type="button" className="btn btn--primary btn--big" onClick={() => go('studio')}>Open My Studio →</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function DeckCardRow({ card, onOpen }: { card: MovementCard; onOpen: () => void }) {
  const { state, content } = useStore();
  const open = state.unlockedCardIds.includes(card.id);
  const done = open ? 0 : requirementProgress(state, content, card).filter(Boolean).length;
  const practised = state.completedCounts[card.id] ?? 0;
  const status = open ? (practised ? `Practised ×${practised}` : 'Open · not played yet') : `Locked · ${done} of ${card.requirements.length} steps`;
  return (
    <li>
      <button type="button" className="deck-row" onClick={onOpen} aria-label={`${card.name}, ${status}. Details`} data-a="Details">
        <span className="deck-row__art"><Art card={card} content={content} dim={!open} />{!open && <span className="lock-badge lock-badge--sm" aria-hidden="true"><LockIcon /></span>}</span>
        <span className="deck-row__text">
          <span className="deck-row__name">{card.name}</span>
          <span className="deck-row__status">{status}</span>
        </span>
        <Tag card={card} />
      </button>
    </li>
  );
}
