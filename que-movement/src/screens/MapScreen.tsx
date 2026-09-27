import type { Region, RegionNode } from '../content/types';
import { useStore } from '../game/store';
import { usePrimary } from '../input/InputProvider';
import { BigCard } from '../ui/Cards';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';

/** The Q Map: three regions of the body, with each card as a place on the path. */
export function MapScreen() {
  const { state, content } = useStore();
  const { go } = useNav();
  const { openSheet } = useOverlays();
  usePrimary(true, 'Open the decks', () => go('library'));
  const lit = (n: RegionNode) => n.concept || (!!n.cardId && !!content.cardById[n.cardId] && state.unlockedCardIds.includes(n.cardId));

  const open = (node: RegionNode, region: Region) => openSheet({ eyebrow: region.name, title: node.label, body: <NodeDetails node={node} /> });

  return (
    <div className="screen map">
      <header className="page-head">
        <div>
          <p className="eyebrow">Move · Learn · Teach · Belong</p>
          <h1 className="page-title">The Q Map</h1>
          <p className="page-sub">Different paths, same you. Foundation is a place to stay, not a step to leave behind.</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => go('library')}>Open the decks</button>
      </header>
      <div className="map__regions">
        {content.regions.map((r) => (
          <section key={r.id} className="region" style={{ ['--accent' as string]: `var(${r.accentVar})` }} aria-label={r.name}>
            <header className="region__head">
              <h2>{r.name}</h2>
              <p>{r.subtitle}</p>
            </header>
            <div className="region__canvas">
              <svg className="region__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {r.links.map(([a, b]) => {
                  const na = r.nodes.find((n) => n.id === a), nb = r.nodes.find((n) => n.id === b);
                  if (!na || !nb) return null;
                  return <line key={a + b} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} className={lit(na) && lit(nb) ? 'is-lit' : ''} vectorEffect="non-scaling-stroke" />;
                })}
              </svg>
              {r.nodes.map((n) => (
                <button key={n.id} type="button" className={`node ${lit(n) ? 'is-lit' : 'is-muted'} ${n.concept ? 'is-concept' : ''}`} style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  onClick={() => open(n, r)} aria-label={`${n.label}${n.concept ? ', concept' : lit(n) ? ', open' : ', not open yet'}`} data-a={`About ${n.label}`}>
                  <span className="node__dot" aria-hidden="true" />
                  <span className="node__label">{n.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function NodeDetails({ node }: { node: RegionNode }) {
  const { state, content } = useStore();
  const { go, setDeckFocus } = useNav();
  const { closeSheet } = useOverlays();
  const card = node.cardId ? content.cardById[node.cardId] ?? content.allMovementCards.find((c) => c.id === node.cardId) : undefined;
  const installed = !!(node.cardId && content.cardById[node.cardId]);
  const deck = node.deckId ? content.deckById[node.deckId] ?? content.allDecks.find((d) => d.id === node.deckId) : undefined;
  const unlocked = !!node.cardId && state.unlockedCardIds.includes(node.cardId);
  return (
    <div className="details">
      {card && <div className="details__card"><BigCard card={card} content={content} locked={!unlocked} glow={unlocked} compact /></div>}
      <div className="details__info">
        <p className="details__note">{node.note}</p>
        {deck && <p><strong>{deck.name}</strong> — {deck.tagline}</p>}
        {card && !installed && <p className="muted">This place belongs to a pack that isn’t installed yet. Add it in My Studio.</p>}
        {node.concept && <p className="muted">A concept — an idea the decks keep returning to, rather than a card to unlock.</p>}
        <div className="details__actions">
          {deck && installed && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { setDeckFocus(deck.id); closeSheet(); go('library'); }}>Open {deck.name}</button>}
          {!installed && !node.concept && <button type="button" className="btn btn--ghost" data-autofocus="" onClick={() => { closeSheet(); go('studio'); }}>See expansion packs</button>}
          {node.concept && <button type="button" className="btn btn--ghost" data-autofocus="" onClick={closeSheet}>Close</button>}
        </div>
      </div>
    </div>
  );
}
