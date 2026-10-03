import { useEffect, useState } from 'react';
import { MAX_RANK, RANK_XP, rankGift } from '../content/progress';
import { PAID_CLEARS_PER_DAY, PRESETS, QUEST_TYPES, questById } from '../content/quests';
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

/** Rank and today's quests, in the top bar. Opens the Journey. */
export function JourneyButton() {
  const { state } = useStore();
  const { openSheet } = useOverlays();
  const r = rankOf(state.lifetimePoints);
  const q = state.quests;
  return (
    <button type="button" className="journey-btn" onClick={() => openSheet({ eyebrow: 'Your journey', title: `Practice Rank ${r.rank}`, body: <JourneySheet /> })}
      aria-label={`Practice Rank ${r.rank}, ${q.active.length} quests waiting. Open your journey`} data-a="Your journey">
      <RankRing />
      <span className="journey-btn__text">
        <span className="journey-btn__label">Rank · Quests</span>
        <span className="journey-btn__dots" aria-hidden="true">{q.active.map((id) => <i key={id} />)}{Array.from({ length: Math.min(q.cleared, PAID_CLEARS_PER_DAY) }, (_, i) => <i key={`c${i}`} className="is-done" />)}</span>
      </span>
    </button>
  );
}

export function JourneySheet() {
  const { state, dispatch } = useStore();
  const r = rankOf(state.lifetimePoints);
  const next = Math.min(MAX_RANK, r.rank + 1);
  useEffect(() => { dispatch({ type: 'quests/refresh' }); }, [dispatch]);
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
      <Quests />
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

/** Daily Quests: on the mat and off it. Clear one and another arrives. */
function Quests() {
  const { state, dispatch } = useStore();
  const [tuning, setTuning] = useState(false);
  const q = state.quests;
  const paidLeft = Math.max(0, PAID_CLEARS_PER_DAY - q.cleared);
  return (
    <section className="quests">
      <div className="quests__head">
        <h3 className="arrange__label">Daily quests</h3>
        <button type="button" className="chip chip--small" aria-expanded={tuning} onClick={() => setTuning((t) => !t)}>{tuning ? 'Close settings' : 'Customise'} <span aria-hidden="true">{tuning ? '▴' : '▾'}</span></button>
      </div>
      <p className="muted journey__note">{paidLeft ? `Clear one and another arrives. ${paidLeft} more paid today; after that they keep coming, just for you.` : 'Today’s paid quests are done. These are just for you now.'} Skipping costs nothing.</p>
      {tuning && <QuestSettings />}
      <ul className="intentions">
        {q.active.map((id) => {
          const t = questById(id);
          if (!t) return null;
          const type = QUEST_TYPES.find((x) => x.id === t.type);
          return (
            <li key={id}>
              <span className="intentions__tick" aria-hidden="true">{type?.glyph}</span>
              <span>{t.text}<small className="quests__auto">{t.event ? 'Clears itself when you do it in the game' : `${type?.label ?? 'Off the mat'} · tick it when it’s done`}</small></span>
              <span className="quests__actions">
                <strong>+{paidLeft ? t.points : 0}</strong>
                {!t.event && <button type="button" className="quests__done" onClick={() => { sfx.harmony(2); dispatch({ type: 'quest/done', id }); }} aria-label={`Done: ${t.text}`} title="I did it"><span aria-hidden="true">✓</span></button>}
                <button type="button" className="quests__skip" onClick={() => dispatch({ type: 'quest/skip', id })} aria-label={`Skip: ${t.text}`}>Skip</button>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function QuestSettings() {
  const { state, dispatch } = useStore();
  const q = state.quests;
  return (
    <div className="quest-settings">
      <p className="field__label">Presets</p>
      <div className="arrange__opts">
        {PRESETS.map((p) => <button key={p.id} type="button" title={p.about} className={`chip ${q.preset === p.id ? 'is-on' : ''}`} aria-pressed={q.preset === p.id} onClick={() => dispatch({ type: 'quests/settings', preset: p.id })}>{p.label}</button>)}
      </div>
      <p className="muted quest-settings__about">{PRESETS.find((p) => p.id === q.preset)?.about} Presets choose the kinds of quest and their wording. They aren’t medical advice.</p>
      <p className="field__label">Kinds of quest</p>
      <div className="arrange__opts">
        {QUEST_TYPES.map((t) => {
          const on = q.types.includes(t.id);
          return <button key={t.id} type="button" className={`chip ${on ? 'is-on' : ''}`} aria-pressed={on}
            onClick={() => dispatch({ type: 'quests/settings', types: on ? q.types.filter((x) => x !== t.id) : [...q.types, t.id] })}>{t.glyph} {t.label}</button>;
        })}
      </div>
      <p className="field__label">How many at once</p>
      <div className="arrange__opts">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={`chip ${q.count === n ? 'is-on' : ''}`} aria-pressed={q.count === n} onClick={() => dispatch({ type: 'quests/settings', count: n })}>{n}</button>)}
      </div>
    </div>
  );
}

/** A moment's ribbon when a quest is cleared. Never a modal, never in the way. */
export function QuestRibbon() {
  const { state, dispatch } = useStore();
  const ceremony = useCeremony();
  const flash = state.questFlash;
  const modal = state.pendingReveals.length > 0 || state.pendingMilestoneIds.length > 0 || rankOf(state.lifetimePoints).rank > state.rankClaimed;
  const blocked = ceremony || modal || (!!state.play && !state.play.finished);
  useEffect(() => {
    if (!flash || blocked) return;
    sfx.bell();
    const t = window.setTimeout(() => dispatch({ type: 'ui/dismissQuest' }), 3600);
    return () => window.clearTimeout(t);
  }, [flash, blocked, dispatch]);
  if (!flash || blocked) return null;
  const def = questById(flash.id);
  return (
    <div className="ribbon" role="status" key={flash.id + state.quests.cleared}>
      <span className="ribbon__moon" aria-hidden="true">☾</span>
      <span><small>Quest cleared</small>{def?.text}</span>
      <strong>{flash.points ? `+${flash.points}` : '✓'}</strong>
    </div>
  );
}
