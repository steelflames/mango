import { useEffect, useState } from 'react';
import { useStore } from '../game/store';
import { BigCard } from './Cards';
import { Layer } from './Layer';

/** After a sequence: each new card variation, then the challenges completed. */
export function Rewards() {
  const { state, dispatch, content } = useStore();
  const [step, setStep] = useState(0);
  const unlocks = state.pendingUnlocks;
  const challenges = state.pendingChallengeIds.map((id) => content.challenges.find((c) => c.id === id)).filter(Boolean) as typeof content.challenges;
  const total = unlocks.length + (challenges.length ? 1 : 0);
  useEffect(() => { setStep(0); }, [unlocks.length, challenges.length]);
  if (!total || (state.play && !state.play.finished)) return null;
  const next = () => (step + 1 < total ? setStep(step + 1) : dispatch({ type: 'ui/dismissRewards' }));
  const u = step < unlocks.length ? unlocks[step] : null;
  const card = u ? content.cardById[u.cardId] : null;
  return (
    <Layer label="Reward" onClose={() => dispatch({ type: 'ui/dismissRewards' })} backLabel="Close" className="reveal" onScrim={next}>
      <div className="reveal__sparks" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i} style={{ ['--i' as string]: i }} />)}</div>
      {u && card ? (
        <div className="reveal__body" key={u.cardId}>
          <p className="eyebrow">{u.deckName} · new variation</p>
          <h2 className="reveal__title">{u.cardName}</h2>
          <div className="reveal__card"><BigCard card={card} content={content} glow deckName={u.deckName} compact /></div>
          <p className="reveal__note">{u.message}</p>
        </div>
      ) : (
        <div className="reveal__body">
          <p className="eyebrow">Challenge complete</p>
          <h2 className="reveal__title">{challenges.length === 1 ? challenges[0].name : `${challenges.length} challenges`}</h2>
          <ul className="reveal__list">
            {challenges.map((c) => {
              const badge = c.reward.badgeId ? content.badges.find((b) => b.id === c.reward.badgeId) : null;
              return (
                <li key={c.id}>
                  <span className="reveal__glyph" aria-hidden="true">{badge?.glyph ?? '◈'}</span>
                  <strong>{challenges.length === 1 ? c.description : c.name}</strong>
                  <span>{[c.reward.points ? `+${c.reward.points} pts` : '', badge ? `Badge · ${badge.name}` : '', c.reward.themeId ? 'new skin' : '', c.reward.unlocksCardId ? `opens ${content.cardById[c.reward.unlocksCardId]?.name ?? 'a card'}` : ''].filter(Boolean).join(' · ')}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={next}>{step + 1 < total ? 'Next' : 'Lovely'}</button>
    </Layer>
  );
}
