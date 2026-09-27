import { useState } from 'react';
import { RULES } from '../content/catalog';
import type { Challenge } from '../content/types';
import { useStore } from '../game/store';
import { usePrimary, useTriggers } from '../input/InputProvider';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';

const FILTERS = [['all', 'All'], ['open', 'Still open'], ['done', 'Complete']] as const;
type Filter = typeof FILTERS[number][0];

const TRIGGER_WORD: Record<Challenge['trigger'], string> = {
  'sequence-saved': 'Counts when you save',
  'sequence-complete': 'Counts when you finish a sequence',
  remix: 'Counts when you change a finished build and play it again'
};

function rewardText(c: Challenge, badges: { id: string; name: string }[], cardName: (id: string) => string | undefined, themeName: (id: string) => string | undefined) {
  const out: string[] = [];
  if (c.reward.points) out.push(`+${c.reward.points} points`);
  if (c.reward.badgeId) out.push(`${badges.find((b) => b.id === c.reward.badgeId)?.name ?? 'A'} badge`);
  if (c.reward.themeId) out.push(`${themeName(c.reward.themeId) ?? 'A new'} skin`);
  if (c.reward.unlocksCardId) out.push(`Opens ${cardName(c.reward.unlocksCardId) ?? 'a card'}`);
  return out;
}

/** Challenges: gentle goals, each with a clear reward. No daily chores, no streak pressure. */
export function ChallengesScreen() {
  const { state, content } = useStore();
  const { go } = useNav();
  const { openSheet } = useOverlays();
  const [filter, setFilter] = useState<Filter>('all');
  const fi = FILTERS.findIndex(([k]) => k === filter);
  useTriggers(true, FILTERS[fi - 1]?.[1], FILTERS[fi + 1]?.[1], (d) => setFilter(FILTERS[Math.max(0, Math.min(FILTERS.length - 1, fi + d))][0]));
  usePrimary(true, 'Open the Builder', () => go('builder'));
  const doneIds = state.completedChallengeIds;
  const list = content.challenges.filter((c) => filter === 'all' || (filter === 'done') === doneIds.includes(c.id));
  const doneCount = content.challenges.filter((c) => doneIds.includes(c.id)).length;
  const pct = (state.countedPoints / RULES.pointCap) * 100;
  const cardName = (id: string) => content.cardById[id]?.name;
  const themeName = (id: string) => content.themes.find((t) => t.id === id)?.name;

  const open = (c: Challenge) => {
    const done = doneIds.includes(c.id);
    const badge = c.reward.badgeId ? content.badges.find((b) => b.id === c.reward.badgeId) : undefined;
    openSheet({
      eyebrow: done ? 'Challenge complete' : 'Challenge',
      title: c.name,
      body: (
        <div className="details details--challenge">
          <div className={`medal ${done ? 'is-done' : ''}`} aria-hidden="true">{badge?.glyph ?? '◈'}</div>
          <div className="details__info">
            <p className="details__note">{c.description}</p>
            <p>{c.detail}</p>
            <p className="muted">{TRIGGER_WORD[c.trigger]}.</p>
            <ul className="reward-list">{rewardText(c, content.badges, cardName, themeName).map((r) => <li key={r}>{r}</li>)}</ul>
            <div className="details__actions">
              <ChallengeGo done={done} />
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="screen challenges">
      <header className="page-head">
        <div>
          <p className="eyebrow">Gentle goals · clear rewards</p>
          <h1 className="page-title">Challenges</h1>
          <p className="page-sub">Each one asks for a kind of build, not a number of days. Nothing expires.</p>
        </div>
        <div className="meter-card" aria-label={`${state.countedPoints} of ${RULES.pointCap} points counted, ${doneCount} of ${content.challenges.length} challenges complete`}>
          <div className="meter-card__row"><strong>{state.countedPoints}</strong><span>/ {RULES.pointCap} points</span></div>
          <span className="meter" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
          <p className="muted">{doneCount} of {content.challenges.length} challenges complete</p>
        </div>
      </header>
      <div className="filter-row" role="radiogroup" aria-label="Show">
        {FILTERS.map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={filter === k} className={`chip ${filter === k ? 'is-on' : ''}`} onClick={() => setFilter(k)}>{label}</button>
        ))}
      </div>
      <div className="ch-grid scroll">
        {list.map((c) => {
          const done = doneIds.includes(c.id);
          const badge = c.reward.badgeId ? content.badges.find((b) => b.id === c.reward.badgeId) : undefined;
          return (
            <button key={c.id} type="button" className={`ch-card ${done ? 'is-done' : ''}`} onClick={() => open(c)} aria-label={`${c.name}, ${done ? 'complete' : 'open'}. ${c.description}`} data-a="Details">
              <span className={`medal ${done ? 'is-done' : ''}`} aria-hidden="true">{badge?.glyph ?? '◈'}</span>
              <span className="ch-card__text">
                <span className="ch-card__name">{c.name}</span>
                <span className="ch-card__desc">{c.description}</span>
                <span className="ch-card__reward">{rewardText(c, content.badges, cardName, themeName).join(' · ')}</span>
              </span>
              <span className={`ch-card__status ${done ? 'is-done' : ''}`}>{done ? '✓ Complete' : 'Open'}</span>
            </button>
          );
        })}
        {!list.length && <p className="empty muted">{filter === 'done' ? 'None complete yet — the first one is saving any build.' : 'Every challenge is complete. Lovely work.'}</p>}
      </div>
    </div>
  );
}

function ChallengeGo({ done }: { done: boolean }) {
  const { go } = useNav();
  const { closeSheet } = useOverlays();
  return done
    ? <button type="button" className="btn btn--ghost" data-autofocus="" onClick={closeSheet}>Close</button>
    : <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { closeSheet(); go('builder'); }}>Build for it →</button>;
}
