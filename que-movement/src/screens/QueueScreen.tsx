import { useEffect, useRef, useState } from 'react';
import { mixLabel, sequenceStats, unknownCards } from '../game/rules';
import { useStore } from '../game/store';
import type { ReactionKey, Sequence } from '../game/types';
import { useInput, useTriggers } from '../input/InputProvider';
import { useMotionOk } from '../ui/art/CardArt';
import { BigCard, Mosaic } from '../ui/Cards';
import { useNav } from '../ui/nav';
import { useRemixSequence } from './repertoire/Sidebar';

const REACTIONS: { key: ReactionKey; label: string; glyph: string }[] = [
  { key: 'creative', label: 'Creative', glyph: '✧' },
  { key: 'sweaty', label: 'Sweaty', glyph: '☀' },
  { key: 'gentle', label: 'Gentle', glyph: '❀' },
  { key: 'educational', label: 'Teaches well', glyph: '✎' }
];
const TABS = [['for-you', 'For you'], ['new', 'Newest'], ['saved', 'Saved']] as const;
type Tab = typeof TABS[number][0];

function ago(t?: number) {
  if (!t) return '';
  const h = Math.max(0, (Date.now() - t) / 3.6e6);
  if (h < 1) return 'just now';
  if (h < 24) return `${Math.round(h)} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
const HUES = ['--forest', '--dusty-blue', '--aubergine', '--gold', '--sage'];
const hueOf = (name: string) => `var(${HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length]})`;

/** In the Queue: other movers' Sequences, one at a time, playing themselves through. */
export function QueueScreen() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('for-you');
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const shared = state.sequences.filter((s) => s.published);
  const feed = tab === 'saved'
    ? state.savedSequenceIds.map((id) => shared.find((s) => s.id === id)).filter(Boolean) as Sequence[]
    : tab === 'new'
      ? [...shared].sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
      : [...shared].sort((a, b) => ((b.community?.saves ?? 0) + (b.seeded ? 0 : 10000)) - ((a.community?.saves ?? 0) + (a.seeded ? 0 : 10000)));
  const ti = TABS.findIndex(([k]) => k === tab);
  const ai = Math.max(0, feed.findIndex((s) => s.id === active));

  // Which reel is on screen: that one plays, the rest rest.
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      const best = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (best) setActive((best.target as HTMLElement).dataset.reel ?? null);
    }, { root, threshold: [0.55, 0.8] });
    root.querySelectorAll('[data-reel]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [feed.length, tab]);

  const jump = (d: -1 | 1) => {
    const next = feed[ai + d];
    if (next) listRef.current?.querySelector(`[data-reel="${next.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  useTriggers(true, ai > 0 ? 'Previous Sequence' : undefined, ai < feed.length - 1 ? 'Next Sequence' : undefined, jump);

  return (
    <div className="screen qfeed">
      <header className="page-head page-head--tight">
        <div>
          <p className="eyebrow">Share · Discover · Remix</p>
          <h1 className="page-title">In the Queue</h1>
        </div>
        <div className="subtabs" role="tablist" aria-label="Feed">
          {TABS.map(([k, label], i) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={`subtab ${tab === k ? 'is-on' : ''}`} onClick={() => { setTab(k); setActive(null); listRef.current?.scrollTo({ top: 0 }); }}>
              {label}{k === 'saved' && state.savedSequenceIds.length > 0 && <span className="subtab__n">{state.savedSequenceIds.length}</span>}
              {i === ti && <span className="sr-only">, showing</span>}
            </button>
          ))}
        </div>
      </header>
      <div className="reels" ref={listRef}>
        {feed.map((s) => <Reel key={s.id} seq={s} playing={s.id === (active ?? feed[0]?.id)} />)}
        {!feed.length && (
          <div className="empty empty--big">
            <p className="empty__title">{tab === 'saved' ? 'Nothing saved yet' : 'The Queue is quiet'}</p>
            <p className="muted">{tab === 'saved' ? 'Tap Save on a Sequence you like. It also shows up in your Repertoire.' : 'Share one of your own from Repertoire.'}</p>
            {tab === 'saved' && <button type="button" className="btn btn--primary" onClick={() => setTab('for-you')}>Browse For you</button>}
          </div>
        )}
        <p className="reels__note" aria-hidden="true">A sample feed for now. It lives on this device; sharing adds yours with a simulated audience.</p>
      </div>
    </div>
  );
}

function Reel({ seq, playing }: { seq: Sequence; playing: boolean }) {
  const { state, dispatch, content } = useStore();
  const { go } = useNav();
  const { toast } = useInput();
  const remix = useRemixSequence();
  const motion = useMotionOk();
  const [i, setI] = useState(0);
  const st = sequenceStats(seq.slots, content);
  const n = st.views.length;
  const mine = !seq.seeded;
  const saved = state.savedSequenceIds.includes(seq.id);
  const unknown = unknownCards(seq, state, content);
  const plays = (seq.community?.plays ?? 0) + seq.analytics.plays;

  useEffect(() => {
    if (!playing || !motion || n < 2) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 2600);
    return () => window.clearInterval(t);
  }, [playing, motion, n]);
  useEffect(() => { if (!playing) setI(0); }, [playing]);

  const v = st.views[i];
  const nextA = st.views[(i + 1) % n];
  const nextB = st.views[(i + 2) % n];
  return (
    <article className={`reel ${playing ? 'is-playing' : ''}`} data-reel={seq.id} aria-label={`${seq.name} by ${mine ? 'you' : seq.author}`}>
      <div className="reel__stage">
        <div className="reel__stack" aria-hidden="true">
          {n > 2 && nextB && <div className="reel__ghost reel__ghost--2"><Mosaic cardIds={[nextB.card.id]} content={content} /></div>}
          {n > 1 && nextA && <div className="reel__ghost reel__ghost--1"><Mosaic cardIds={[nextA.card.id]} content={content} /></div>}
          {v && <div className="reel__card" key={`${v.slot.slotId}${playing}`}><BigCard card={v.card} content={content} modifiers={v.modifiers} compact still={!playing} /></div>}
        </div>
        <ol className="reel__steps" aria-label="Steps">
          {st.views.map((w, k) => (
            <li key={w.slot.slotId}>
              <button type="button" className={`reel__step ${k === i ? 'is-on' : ''} ${w.card.kind === 'transition' ? 'is-transition' : ''}`} onClick={() => setI(k)} aria-label={`Step ${k + 1}: ${w.card.name}`} aria-current={k === i ? 'step' : undefined} data-a={w.card.name} />
            </li>
          ))}
        </ol>
      </div>
      <div className="reel__info">
        <p className="reel__by">
          <span className="avatar" style={{ background: hueOf(seq.studio ?? seq.author) }} aria-hidden="true">{(seq.studio ?? seq.author).slice(0, 1)}</span>
          <span><strong>{mine ? 'You' : seq.author}</strong><small>{mine ? state.studioName : seq.studio} · {ago(seq.publishedAt)}</small></span>
        </p>
        <h2 className="reel__name">{seq.name}</h2>
        {seq.note && <p className="reel__note">“{seq.note}”</p>}
        <p className="reel__meta">{st.totalCards} cards · {st.durationLabel} · {mixLabel(st.mix)}</p>
        <p className="reel__meta">{plays.toLocaleString()} plays · {(seq.community?.saves ?? 0).toLocaleString()} saves</p>
        {unknown.length > 0 && (
          <button type="button" className="reel__unknown" onClick={() => go('technique')} data-a="See them in Technique">
            <span aria-hidden="true">✧</span> Uses {unknown.length === 1 ? unknown[0].name : `${unknown.length} Techniques`} you haven’t learned yet
          </button>
        )}
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
        <div className="reel__actions">
          <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: 'play/start', sequenceId: seq.id })}><span aria-hidden="true">▶</span> Try it</button>
          {!mine && (
            <button type="button" className={`btn btn--ghost ${saved ? 'is-saved' : ''}`} aria-pressed={saved} onClick={() => { dispatch({ type: 'sequence/toggleSaved', sequenceId: seq.id }); toast(saved ? `${seq.name} taken out of Saved.` : `${seq.name} saved. It’s in your Repertoire too.`); }}>
              <span aria-hidden="true">{saved ? '★' : '☆'}</span> {saved ? 'Saved' : 'Save'}
            </button>
          )}
          {!mine && <button type="button" className="btn btn--ghost" onClick={() => void remix(seq)}><span aria-hidden="true">↻</span> Remix</button>}
        </div>
      </div>
    </article>
  );
}
