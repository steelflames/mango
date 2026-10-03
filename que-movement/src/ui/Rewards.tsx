import { useEffect } from 'react';
import { useStore } from '../game/store';
import { useCeremony } from './fly';
import { sfx } from './sound';
import { rankGift } from '../content/progress';
import { rankOf, rankRewards } from '../game/rules';
import { useInput } from '../input/InputProvider';
import { BigCard } from './Cards';
import { Layer } from './Layer';

/** A Technique just learned turns over into its Qcard; then any badges earned. */
export function Rewards() {
  const { state, dispatch, content } = useStore();
  const { toast } = useInput();
  const ceremony = useCeremony();
  const reveal = state.pendingReveals[0];
  const badgeCount = state.pendingMilestoneIds.length;
  const rankUp = rankOf(state.lifetimePoints).rank > state.rankClaimed;
  const blocked = ceremony || (!!state.play && !state.play.finished);
  const revealId = reveal?.cardId;
  useEffect(() => { if (blocked) return; if (revealId) sfx.learn(); else if (badgeCount || rankUp) sfx.badge(); }, [revealId, badgeCount, rankUp, blocked]);
  if (blocked) return null;
  if (reveal) {
    const card = content.cardById[reveal.cardId];
    const primary = state.decks.find((d) => d.id === state.primaryDeckId)!;
    const node = content.nodeByCard[card.id];
    const path = content.pathById[node?.pathId ?? ''];
    const keep = () => dispatch({ type: 'ui/dismissReveal' });
    const add = () => { dispatch({ type: 'deck/add', deckId: primary.id, cardId: card.id }); dispatch({ type: 'ui/dismissReveal' }); toast(`${card.name} is in ${primary.name}. Build with it in Repertoire.`); };
    return (
      <Layer label={`New Qcard: ${card.name}`} onClose={keep} backLabel="Keep in collection" className="reveal">
        <div className="reveal__sparks" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ['--i' as string]: i }} />)}</div>
        <div className="reveal__body" key={card.id}>
          <p className="eyebrow">{path ? `${path.name} path · ` : ''}Technique learned</p>
          <h2 className="reveal__title">A new Qcard</h2>
          <div className="reveal__card flip">
            <div className="flip__back" aria-hidden="true"><span>Q</span></div>
            <div className="flip__front"><BigCard card={card} content={content} glow compact /></div>
          </div>
          <p className="reveal__note">{node?.note} It’s yours either way.</p>
        </div>
        <div className="reveal__actions">
          <button type="button" className="btn btn--primary btn--big btn--explain" data-autofocus="" onClick={add}>
            <span>Add to {primary.name}</span>
            <small>Your primary deck: it’s there first when you build.</small>
          </button>
          <button type="button" className="btn btn--ghost btn--explain" onClick={keep}>
            <span>Keep in collection</span>
            <small>It stays in All Qcards. Add it to any deck later.</small>
          </button>
        </div>
      </Layer>
    );
  }
  const ms = state.pendingMilestoneIds.map((id) => content.milestones.find((m) => m.id === id)).filter(Boolean) as typeof content.milestones;
  if (!ms.length) {
    const r = rankOf(state.lifetimePoints);
    if (r.rank <= state.rankClaimed) return null;
    const n = state.rankClaimed + 1;
    const gifts = rankRewards(n);
    const claim = () => { sfx.badge(); dispatch({ type: 'rank/claim' }); };
    return (
      <Layer label={`Practice Rank ${n}`} onClose={claim} backLabel="Claim" className="reveal reveal--rank">
        <div className="reveal__sparks" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ ['--i' as string]: i }} />)}</div>
        <div className="reveal__body">
          <p className="eyebrow">Practice Rank</p>
          <div className="rank-burst" aria-hidden="true"><span>{n}</span></div>
          <h2 className="reveal__title">Rank {n}</h2>
          <ul className="reveal__list">
            <li><span className="reveal__glyph medal is-done" aria-hidden="true">✦</span><strong>{rankGift(n)} points</strong><span>To spend on Techniques</span></li>
            {gifts.map((g) => <li key={g.name}><span className="reveal__glyph medal is-done" aria-hidden="true">⌂</span><strong>{g.name}</strong><span>New for your Studio · {g.slot}</span></li>)}
          </ul>
        </div>
        <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={claim}>Claim</button>
      </Layer>
    );
  }
  const close = () => dispatch({ type: 'ui/dismissMilestones' });
  return (
    <Layer label="Badge earned" onClose={close} backLabel="Close" className="reveal" onScrim={close}>
      <div className="reveal__sparks" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i} style={{ ['--i' as string]: i }} />)}</div>
      <div className="reveal__body">
        <p className="eyebrow">For your Studio shelf</p>
        <h2 className="reveal__title">{ms.length === 1 ? `${ms[0].name} badge` : `${ms.length} new badges`}</h2>
        <ul className="reveal__list">
          {ms.map((m) => {
            const badge = content.badges.find((b) => b.id === m.reward.badgeId);
            return (
              <li key={m.id}>
                <span className="reveal__glyph medal is-done" aria-hidden="true">{badge?.glyph ?? '◈'}</span>
                <strong>{badge?.name ?? m.name}</strong>
                <span>{[badge?.description, m.reward.points ? `+${m.reward.points} pts` : '', m.reward.themeId ? 'new skin in Settings' : ''].filter(Boolean).join(' · ')}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={close}>Lovely</button>
    </Layer>
  );
}
