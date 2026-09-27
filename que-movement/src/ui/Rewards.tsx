import { useStore } from '../game/store';
import { useInput } from '../input/InputProvider';
import { BigCard } from './Cards';
import { Layer } from './Layer';

/** A Technique just learned turns over into its Qcard; then any badges earned. */
export function Rewards() {
  const { state, dispatch, content } = useStore();
  const { toast } = useInput();
  if (state.play && !state.play.finished) return null;
  const reveal = state.pendingReveals[0];
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
          <p className="reveal__note">{node?.note} Add it to your Repertoire to build with it.</p>
        </div>
        <div className="reveal__actions">
          <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={add}>Add to {primary.name}</button>
          <button type="button" className="btn btn--ghost" onClick={keep}>Keep in collection</button>
        </div>
      </Layer>
    );
  }
  const ms = state.pendingMilestoneIds.map((id) => content.milestones.find((m) => m.id === id)).filter(Boolean) as typeof content.milestones;
  if (!ms.length) return null;
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
