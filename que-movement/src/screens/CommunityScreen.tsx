import { useState } from 'react';
import { averageCompletion, mixLabel, sequenceStats } from '../game/rules';
import { useStore } from '../game/store';
import type { ReactionKey, Sequence } from '../game/types';
import { useTriggers } from '../input/InputProvider';
import { Mosaic } from '../ui/Cards';
import { useCopySequence } from './builder/Sidebar';

const REACTIONS: { key: ReactionKey; label: string; glyph: string }[] = [
  { key: 'creative', label: 'Creative', glyph: '✧' },
  { key: 'sweaty', label: 'Sweaty', glyph: '☀' },
  { key: 'gentle', label: 'Gentle', glyph: '❀' },
  { key: 'educational', label: 'Educational', glyph: '✎' }
];
const SORTS = [['new', 'Newest'], ['played', 'Most played'], ['loved', 'Most loved']] as const;
type Sort = typeof SORTS[number][0];

function ago(t?: number) {
  if (!t) return '';
  const h = Math.max(0, (Date.now() - t) / 3.6e6);
  if (h < 1) return 'just now';
  if (h < 24) return `${Math.round(h)} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
const plays = (s: Sequence) => (s.community?.plays ?? 0) + s.analytics.plays;
const loves = (s: Sequence) => Object.values(s.reactions).reduce((a, b) => a + b, 0);

/** Community: builds other people have shared, and yours once published. */
export function CommunityScreen() {
  const { state } = useStore();
  const [sort, setSort] = useState<Sort>('new');
  const si = SORTS.findIndex(([k]) => k === sort);
  useTriggers(true, SORTS[si - 1]?.[1], SORTS[si + 1]?.[1], (d) => setSort(SORTS[Math.max(0, Math.min(SORTS.length - 1, si + d))][0]));
  const feed = state.sequences.filter((s) => s.published).sort((a, b) =>
    sort === 'new' ? (b.publishedAt ?? 0) - (a.publishedAt ?? 0) : sort === 'played' ? plays(b) - plays(a) : loves(b) - loves(a));
  return (
    <div className="screen community">
      <header className="page-head">
        <div>
          <p className="eyebrow">Move · Learn · Teach · Belong</p>
          <h1 className="page-title">Community</h1>
          <p className="page-sub">Builds shared by other movers. Play one, react, or copy it into your builder and make it yours.</p>
        </div>
        <p className="honest-note">A sample feed for now — it lives on this device. Publishing adds your build here, with a simulated audience.</p>
      </header>
      <div className="filter-row" role="radiogroup" aria-label="Sort the feed">
        {SORTS.map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={sort === k} className={`chip ${sort === k ? 'is-on' : ''}`} onClick={() => setSort(k)}>{label}</button>
        ))}
      </div>
      <div className="feed scroll">
        {feed.map((s) => <FeedCard key={s.id} seq={s} />)}
      </div>
    </div>
  );
}

function FeedCard({ seq }: { seq: Sequence }) {
  const { dispatch, content } = useStore();
  const copy = useCopySequence();
  const st = sequenceStats(seq.slots, content);
  const completion = seq.community && seq.community.plays ? Math.round((seq.community.completedPlays / seq.community.plays) * 100) : averageCompletion(seq);
  const mine = !seq.seeded;
  return (
    <article className="feed-card" aria-label={seq.name}>
      <Mosaic cardIds={seq.slots.map((s) => s.cardId)} content={content} className="feed-card__art" />
      <div className="feed-card__body">
        <p className="feed-card__by"><span className="avatar" aria-hidden="true">{seq.author.slice(0, 1)}</span>{mine ? 'You' : seq.author} · {ago(seq.publishedAt)}</p>
        <h2 className="feed-card__name">{seq.name}</h2>
        <p className="feed-card__meta">{st.totalCards} cards · {st.durationLabel} · {mixLabel(st.mix)}</p>
        <p className="feed-card__stats">{plays(seq).toLocaleString()} plays · {completion}% finish</p>
        <div className="reactions" role="group" aria-label="React">
          {REACTIONS.map((r) => {
            const on = seq.myReaction === r.key;
            return (
              <button key={r.key} type="button" className={`reaction ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => dispatch({ type: 'sequence/react', sequenceId: seq.id, reaction: r.key })}
                aria-label={`${r.label}, ${seq.reactions[r.key]}`} data-a={on ? `Take back ${r.label}` : r.label}>
                <span aria-hidden="true">{r.glyph}</span> {r.label} <strong>{seq.reactions[r.key]}</strong>
              </button>
            );
          })}
        </div>
        <div className="feed-card__actions">
          <button type="button" className="btn btn--primary btn--small" onClick={() => dispatch({ type: 'play/start', sequenceId: seq.id })}><span aria-hidden="true">▶</span> Play</button>
          {!mine && (
            <button type="button" className="btn btn--ghost btn--small" onClick={() => void copy(seq)}>Copy to my builder</button>
          )}
        </div>
      </div>
    </article>
  );
}
