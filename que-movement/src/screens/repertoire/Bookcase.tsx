import type { Card } from '../../content/types';
import { sequenceStats } from '../../game/rules';
import { useStore } from '../../game/store';
import type { Sequence } from '../../game/types';
import { Art, Mosaic } from '../../ui/Cards';
import { CardDetails } from '../../ui/CardDetails';
import { useNav } from '../../ui/nav';
import { useOverlays } from '../../ui/Overlays';
import { useDraft } from '../../ui/useDraft';
import { useLoadSequence, useRemixSequence } from './Sidebar';

function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="shelf">
      <header className="shelf__head"><h3>{title}</h3>{sub && <p>{sub}</p>}</header>
      <div className="shelf__row scroll-x">{children}</div>
    </section>
  );
}

/** Bookcase: the top of the Collection, browsed in rows like a streaming shelf. */
export function Bookcase() {
  const { state, content } = useStore();
  const { setBuilder, go } = useNav();
  const { openSheet } = useOverlays();
  const draft = useDraft();
  const load = useLoadSequence();
  const remix = useRemixSequence();
  const owned = content.cards.filter((c) => c.kind === 'movement' && state.ownedCardIds.includes(c.id) && !state.archivedCardIds.includes(c.id));
  const used = new Set(state.sequences.filter((s) => !s.seeded).flatMap((s) => s.slots.map((x) => x.cardId)));
  const toLearn = content.branch.nodes.filter((n) => !state.ownedCardIds.includes(n.cardId)).map((n) => content.cardById[n.cardId]).filter(Boolean) as Card[];
  const unused = owned.filter((c) => !used.has(c.id));
  const saved = state.savedSequenceIds.map((id) => state.sequences.find((s) => s.id === id)).filter(Boolean) as Sequence[];
  const community = state.sequences.filter((s) => s.seeded && !state.savedSequenceIds.includes(s.id));
  const unfinished = state.sequences.filter((s) => s.analytics.completionPercents.some((p) => p < 100) && !s.analytics.completedPlays);
  const featured = community[0];

  const cardTile = (c: Card, hint: string) => (
    <button key={c.id} type="button" className="shelf-card" onClick={() => openSheet({ eyebrow: 'Qcard', title: c.name, body: <CardDetails card={c} /> })}
      onDoubleClick={() => draft.add(c)} title={`${c.name}. ${hint}`} data-a="Look closer">
      <Art card={c} content={content} className="shelf-card__art" />
      <span className="shelf-card__name">{c.name}</span>
      <span className="shelf-card__hint">{hint}</span>
    </button>
  );
  const seqTile = (s: Sequence, hint?: string) => {
    const st = sequenceStats(s.slots, content);
    return (
      <button key={s.id} type="button" className="shelf-card shelf-card--seq" onClick={() => void (s.seeded ? remix(s) : load(s))} data-a={s.seeded ? 'Remix' : 'Open'}>
        <Mosaic cardIds={s.slots.map((x) => x.cardId)} content={content} className="shelf-card__art" />
        <span className="shelf-card__name">{s.name}</span>
        <span className="shelf-card__hint">{hint ?? `${s.seeded ? s.studio ?? s.author : 'Yours'} · ${st.durationLabel}`}</span>
      </button>
    );
  };

  return (
    <div className="bookcase scroll">
      {featured && (
        <section className="feature">
          <Mosaic cardIds={featured.slots.map((x) => x.cardId)} content={content} className="feature__art" />
          <div className="feature__text">
            <p className="eyebrow">Featured from In the Queue</p>
            <h3>{featured.name}</h3>
            {featured.note && <p>“{featured.note}”</p>}
            <div className="feature__actions">
              <button type="button" className="btn btn--primary" onClick={() => void remix(featured)}>Remix it</button>
              <button type="button" className="btn btn--ghost" onClick={() => go('queue')}>See In the Queue</button>
            </div>
          </div>
        </section>
      )}
      {toLearn.length > 0 && <Row title="Techniques you might love" sub="Learn them in Techniques.">{toLearn.slice(0, 10).map((c) => cardTile(c, 'Not learned yet'))}</Row>}
      <Row title="Challenge Decks" sub="Builds with rules. The first, Two Peaks, arrives with Swan Dive and Corkscrew.">
        <div className="shelf-card shelf-card--soon" aria-label="Coming soon"><span className="shelf-card__art shelf-soon">✦ ✦</span><span className="shelf-card__name">Two Peaks</span><span className="shelf-card__hint">Coming with the Council’s Swan Dive &amp; Corkscrew</span></div>
      </Row>
      {saved.length > 0 && <Row title="Saved from the Queue">{saved.map((s) => seqTile(s))}</Row>}
      {community.length > 0 && <Row title="For you" sub="From In the Queue, picked for the Qcards you know.">{community.slice(0, 10).map((s) => seqTile(s))}</Row>}
      {unfinished.length > 0 && <Row title="Continue" sub="Started, not finished.">{unfinished.map((s) => seqTile(s, `${Math.max(...s.analytics.completionPercents)}% through`))}</Row>}
      <Row title="Collections">
        {content.paths.map((p) => {
          const cards = owned.filter((c) => c.kind === 'movement' && c.pathId === p.id);
          return (
            <button key={p.id} type="button" className="shelf-card shelf-card--seq" onClick={() => setBuilder({ coll: 'all', query: p.name })} data-a="Show">
              <Mosaic cardIds={cards.map((c) => c.id)} content={content} className="shelf-card__art" />
              <span className="shelf-card__name">{p.name}</span>
              <span className="shelf-card__hint">{cards.length} Qcards</span>
            </button>
          );
        })}
      </Row>
      {unused.length > 0 && <Row title="Inspiration" sub="Learned, never built with. Double-tap to add.">{unused.slice(0, 10).map((c) => cardTile(c, 'Not in a Sequence yet'))}</Row>}
    </div>
  );
}
