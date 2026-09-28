import { useEffect } from 'react';
import { INTENTIONS, MAX_RANK, RANK_XP, rankGift } from '../content/progress';
import { rankOf, rankRewards } from '../game/rules';
import { useStore } from '../game/store';
import { useCeremony } from './fly';
import { useOverlays } from './Overlays';
import { sfx } from './sound';

/** Practice Rank as a lantern-gold ring, like an adventure rank you can always see. */
export function RankRing({ size = 40 }: { size?: number }) {
  const { state } = useStore();
  const r = rankOf(state.lifetimePoints);
  const R = size / 2 - 3, C = 2 * Math.PI * R;
  const claim = r.rank > state.rankClaimed;
  return (
    <span className={`rank-ring ${claim ? 'is-claim' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={R} className="rank-ring__track" />
        <circle cx={size / 2} cy={size / 2} r={R} className="rank-ring__fill" strokeDasharray={C} strokeDashoffset={C * (1 - r.pct)} />
      </svg>
      <span className="rank-ring__n">{r.rank}</span>
    </span>
  );
}

/** Rank and today's intentions, in the top bar. Opens the Journey. */
export function JourneyButton() {
  const { state } = useStore();
  const { openSheet } = useOverlays();
  const r = rankOf(state.lifetimePoints);
  const ints = state.intentions;
  return (
    <button type="button" className="journey-btn" onClick={() => openSheet({ eyebrow: 'Your journey', title: `Practice Rank ${r.rank}`, body: <JourneySheet /> })}
      aria-label={`Practice Rank ${r.rank}, ${ints.done.length} of 3 intentions today. Open your journey`} data-a="Your journey">
      <RankRing />
      <span className="journey-btn__text">
        <span className="journey-btn__label">Rank</span>
        <span className="journey-btn__dots" aria-hidden="true">{ints.ids.map((id) => <i key={id} className={ints.done.includes(id) ? 'is-done' : ''} />)}</span>
      </span>
    </button>
  );
}

export function JourneySheet() {
  const { state, dispatch } = useStore();
  const r = rankOf(state.lifetimePoints);
  const ints = state.intentions;
  const next = Math.min(MAX_RANK, r.rank + 1);
  useEffect(() => { dispatch({ type: 'intentions/refresh' }); }, [dispatch]);
  return (
    <div className="journey">
      <section className="journey__rank">
        <RankRing size={88} />
        <div>
          <p className="journey__big">Rank {r.rank}{r.max ? ' · the top, for now' : ''}</p>
          {!r.max && <p className="muted">{r.need - r.into} more points to Rank {next}. Every point you earn counts, even the ones you spend.</p>}
          <span className="meter meter--big" aria-hidden="true"><span style={{ width: `${r.pct * 100}%` }} /></span>
        </div>
      </section>
      {r.rank > state.rankClaimed && (
        <button type="button" className="btn btn--primary btn--big journey__claim" onClick={() => { sfx.badge(); dispatch({ type: 'rank/claim' }); }}>Claim Rank {state.rankClaimed + 1} gifts · ✦ {rankGift(state.rankClaimed + 1)}</button>
      )}
      <section>
        <h3 className="arrange__label">Today’s intentions</h3>
        <p className="muted journey__note">Three invitations a day. Missing one costs nothing; tomorrow brings three more.</p>
        <ul className="intentions">
          {ints.ids.map((id) => {
            const def = INTENTIONS.find((x) => x.id === id)!;
            const done = ints.done.includes(id);
            return <li key={id} className={done ? 'is-done' : ''}><span className="intentions__tick" aria-hidden="true">{done ? '✓' : '☾'}</span><span>{def.text}</span><strong>+{def.points}</strong></li>;
          })}
        </ul>
      </section>
      <section>
        <h3 className="arrange__label">The road ahead</h3>
        <ol className="ranks">
          {RANK_XP.map((xp, i) => {
            const n = i + 1;
            if (n === 1) return null;
            const gifts = rankRewards(n);
            const state_ = n <= state.rankClaimed ? 'is-claimed' : n <= r.rank ? 'is-ready' : '';
            return (
              <li key={n} className={state_}>
                <span className="ranks__n">{n}</span>
                <span className="ranks__what">✦ {rankGift(n)}{gifts.map((g) => ` · ${g.name}`).join('')}</span>
                <small>{xp} pts</small>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

/** A moment's ribbon when an intention is met. Never a modal, never in the way. */
export function IntentionRibbon() {
  const { state, dispatch } = useStore();
  const ceremony = useCeremony();
  const flash = state.intentionFlash;
  const modal = state.pendingReveals.length > 0 || state.pendingMilestoneIds.length > 0 || rankOf(state.lifetimePoints).rank > state.rankClaimed;
  const blocked = ceremony || modal || (!!state.play && !state.play.finished);
  useEffect(() => {
    if (!flash || blocked) return;
    sfx.bell();
    const t = window.setTimeout(() => dispatch({ type: 'ui/dismissIntention' }), 3600);
    return () => window.clearTimeout(t);
  }, [flash, blocked, dispatch]);
  if (!flash || blocked) return null;
  const def = INTENTIONS.find((x) => x.id === flash);
  return (
    <div className="ribbon" role="status" key={flash}>
      <span className="ribbon__moon" aria-hidden="true">☾</span>
      <span><small>Intention met</small>{def?.text}</span>
      <strong>+{def?.points}</strong>
    </div>
  );
}
