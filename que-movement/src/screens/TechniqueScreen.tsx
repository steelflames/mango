import { useState } from 'react';
import type { TechniqueNode } from '../content/types';
import { readNode, techniquesKnown, type NodeReading } from '../game/rules';
import { useStore } from '../game/store';
import { usePrimary } from '../input/InputProvider';
import { Art, BigCard, LockIcon } from '../ui/Cards';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';

const STATUS_WORD: Record<NodeReading['status'], string> = {
  known: 'Known',
  ready: 'Ready to learn',
  saving: 'Saving up',
  practise: 'Perform what it grows from',
  locked: 'Not yet'
};

/** Technique: the skill tree. Spend points to learn; each Technique learned becomes a Qcard. */
export function TechniqueScreen() {
  const { state, dispatch, content } = useStore();
  const { openSheet, closeSheet } = useOverlays();
  const [fresh, setFresh] = useState<string | null>(null);
  const { branch } = content;
  const readings = Object.fromEntries(branch.nodes.map((n) => [n.id, readNode(n, state, content)]));
  const known = techniquesKnown(state, content);
  const ready = branch.nodes.filter((n) => readings[n.id].status === 'ready').sort((a, b) => a.cost - b.cost);

  const learn = (node: TechniqueNode) => {
    dispatch({ type: 'technique/unlock', nodeId: node.id });
    setFresh(node.id);
    closeSheet();
  };
  const open = (node: TechniqueNode) => openSheet({
    eyebrow: `${content.pathById[node.pathId]?.name} path · ${branch.name}`,
    title: content.cardById[node.cardId].name,
    body: <NodeSheet node={node} onLearn={() => learn(node)} />
  });
  usePrimary(ready.length > 0, ready[0] ? `Learn ${content.cardById[ready[0].cardId].name}` : '', () => ready[0] && learn(ready[0]));

  const lit = (a: string, b: string) => readings[a].status === 'known' && readings[b].status === 'known';
  const opening = (a: string, b: string) => readings[a].status === 'known' && (readings[b].status === 'ready' || readings[b].status === 'saving');

  return (
    <div className="screen technique">
      <header className="page-head page-head--tight">
        <div>
          <p className="eyebrow">Technique · {branch.name}</p>
          <h1 className="page-title">Technique</h1>
          <p className="page-sub">{branch.subtitle} Perform a Technique, then spend points on what grows from it.</p>
        </div>
        <div className="tech-meter" aria-label={`${state.points} points to spend, ${known} of ${branch.nodes.length} Techniques known`}>
          <p className="tech-meter__points"><span aria-hidden="true">✦</span> {state.points}<small>to spend</small></p>
          <p className="tech-meter__known"><strong>{known}</strong> of {branch.nodes.length} known</p>
          <span className="meter" aria-hidden="true"><span style={{ width: `${(known / branch.nodes.length) * 100}%` }} /></span>
        </div>
      </header>

      <div className="tree scroll" role="group" aria-label={`${branch.name} Technique tree`}>
        <div className="tree__stage">
        <div className="tree__washes" aria-hidden="true">
          {content.paths.map((p, i) => <span key={p.id} className={`tree__wash tree__wash--${i}`} style={{ ['--accent' as string]: `var(${p.accentVar})` }} />)}
        </div>
        <div className="tree__inner">
          <svg className="tree__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {branch.nodes.flatMap((n) => n.requires.map((r) => {
              const a = content.nodeById[r];
              return (
                <line key={r + n.id} x1={a.x} y1={a.y} x2={n.x} y2={n.y} vectorEffect="non-scaling-stroke"
                  className={lit(r, n.id) ? 'is-lit' : opening(r, n.id) ? 'is-opening' : ''} style={{ ['--accent' as string]: `var(${content.pathById[n.pathId]?.accentVar})` }} />
              );
            }))}
          </svg>
          {content.paths.map((p) => {
            const first = branch.nodes.filter((n) => n.pathId === p.id && n.requires.includes('n-breath'))[0] ?? branch.nodes.find((n) => n.pathId === p.id)!;
            return <span key={p.id} className="tree__path" style={{ left: `${first.x}%`, top: `${first.y}%`, ['--accent' as string]: `var(${p.accentVar})` }}>{p.name}</span>;
          })}
          {branch.nodes.map((n) => {
            const card = content.cardById[n.cardId];
            const r = readings[n.id];
            const prog = card.kind === 'progression';
            return (
              <button key={n.id} type="button" className={`tnode is-${r.status} ${prog ? 'is-prog' : ''} ${fresh === n.id ? 'is-fresh' : ''}`}
                style={{ left: `${n.x}%`, top: `${n.y}%`, ['--accent' as string]: `var(${content.pathById[n.pathId]?.accentVar})` }}
                onClick={() => open(n)} aria-label={`${card.name}, ${STATUS_WORD[r.status]}${r.status !== 'known' ? `, ${n.cost} points` : ''}`}
                data-a={r.status === 'ready' ? `Learn ${card.name}` : 'Details'}>
                <span className="tnode__card">
                  <Art card={card} content={content} dim={r.status === 'locked'} live={r.status === 'ready'} />
                  {r.status === 'locked' && <span className="lock-badge lock-badge--sm" aria-hidden="true"><LockIcon /></span>}
                  <span className="tnode__state" aria-hidden="true">{r.status === 'known' ? '✓' : `✦${n.cost}`}</span>
                </span>
                <span className="tnode__name">{card.name}</span>
              </button>
            );
          })}
        </div>
        <p className="tree__legend" aria-hidden="true">
          <span className="is-known">✓ Known</span><span className="is-ready">Ready to learn</span><span className="is-saving">Saving up</span><span className="is-practise">Perform its parent first</span><span className="is-locked">Not yet</span>
        </p>
        </div>
      </div>
    </div>
  );
}

function NodeSheet({ node, onLearn }: { node: TechniqueNode; onLearn: () => void }) {
  const { state, content } = useStore();
  const { go } = useNav();
  const { closeSheet } = useOverlays();
  const card = content.cardById[node.cardId];
  const r = readNode(node, state, content);
  const grows = content.branch.nodes.filter((n) => n.requires.includes(node.id)).map((n) => content.cardById[n.cardId].name);
  return (
    <div className="details">
      <div className="details__card"><BigCard card={card} content={content} glow={r.status === 'known' || r.status === 'ready'} locked={r.status === 'locked'} compact /></div>
      <div className="details__info">
        <p className="details__note">{node.note}</p>
        {r.status === 'known' ? (
          <p className="muted">Known. Its Qcard is in your Repertoire{(state.completedCounts[card.id] ?? 0) > 0 ? `, performed ${state.completedCounts[card.id]}×` : ''}.</p>
        ) : (
          <div className="req">
            <p className="req__title">To learn it</p>
            <ul>{r.steps.map((s) => <li key={s.label} className={s.done ? 'is-done' : ''}><span aria-hidden="true">{s.done ? '✓' : '○'}</span> {s.label}</li>)}</ul>
          </div>
        )}
        {grows.length > 0 && <p className="muted">Opens the way to {grows.join(' and ')}.</p>}
        <div className="details__actions">
          {r.status === 'ready' && <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={onLearn}>Learn it · ✦ {node.cost}</button>}
          {r.status === 'saving' && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { closeSheet(); go('repertoire'); }}>Earn {r.missingPoints} more in Play →</button>}
          {r.status === 'practise' && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { closeSheet(); go('repertoire'); }}>Build a Sequence to perform it →</button>}
          {r.status === 'known' && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { closeSheet(); go('repertoire'); }}>Build with it →</button>}
          {r.status === 'locked' && <button type="button" className="btn btn--ghost" data-autofocus="" onClick={closeSheet}>Close</button>}
        </div>
      </div>
    </div>
  );
}
