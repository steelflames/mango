import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { CREATORS, creatorByName } from '../content/community';
import { readHarmonies } from '../game/harmonies';
import { mixLabel, sequenceStats, unknownCards } from '../game/rules';
import { useStore } from '../game/store';
import type { GameState, ReactionKey, Sequence } from '../game/types';
import type { Content } from '../content/types';
import { useInput, useTriggers } from '../input/InputProvider';
import { useMotionOk } from '../ui/art/CardArt';
import { BigCard, Mosaic } from '../ui/Cards';
import { ClassArc } from '../ui/Harmonies';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';
import { SendToClient } from '../ui/SendToClient';
import { useLoadSequence, useRemixSequence } from './repertoire/Sidebar';

const REACTIONS: { key: ReactionKey; label: string; glyph: string }[] = [
  { key: 'creative', label: 'Creative', glyph: '✧' },
  { key: 'sweaty', label: 'Sweaty', glyph: '☀' },
  { key: 'gentle', label: 'Gentle', glyph: '❀' },
  { key: 'educational', label: 'Teaches well', glyph: '✎' }
];
const LANES = [['live', 'Live'], ['feed', 'The Queue'], ['recs', 'For you']] as const;
type Lane = typeof LANES[number][0];
const TABS = [['popular', 'Popular'], ['new', 'Newest'], ['saved', 'Saved'], ['mine', 'Yours']] as const;
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
const hueOf = (name: string) => {
  const c = creatorByName(name);
  return `var(${c?.hue ?? HUES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % HUES.length]})`;
};

/** Picked for your Repertoire: Sequences you could perform tonight, with good bones, from movers you love. */
function recommend(state: GameState, content: Content) {
  return state.sequences.filter((s) => s.published && s.seeded).map((s) => {
    const ids = [...new Set(s.slots.flatMap((x) => [x.cardId, ...x.modifiers]))];
    const known = ids.filter((id) => state.ownedCardIds.includes(id)).length;
    const harmonies = readHarmonies(s.slots, content, state.ownedCardIds).filter((r) => r.status === 'met').length;
    const top8 = state.profile.top8.includes(creatorByName(s.author)?.id ?? '');
    const score = (known / ids.length) * 10 + harmonies * 2 + (top8 ? 5 : 0);
    const why = [
      known === ids.length ? 'You know every card' : `You know ${known} of ${ids.length} cards`,
      `${harmonies} Harmonies`,
      top8 ? 'From your Top 8' : ''
    ].filter(Boolean).join(' · ');
    return { s, score, why };
  }).sort((a, b) => b.score - a.score);
}

/** In the Queue: Live to the left, the feed in the middle, picks for you to the right. */
export function QueueScreen() {
  const { state, content } = useStore();
  const [lane, setLane] = useState<Lane>('feed');
  const [tab, setTab] = useState<Tab>('popular');
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const shared = state.sequences.filter((s) => s.published);
  const top8 = new Set(state.profile.top8);
  const boost = (s: Sequence) => (s.seeded ? 0 : 10000) + (top8.has(creatorByName(s.author)?.id ?? '') ? 1000 : 0);
  const recs = recommend(state, content);
  const why = new Map(recs.map((r) => [r.s.id, r.why]));
  const feed: Sequence[] = lane === 'recs' ? recs.map((r) => r.s)
    : tab === 'saved' ? state.savedSequenceIds.map((id) => shared.find((s) => s.id === id)).filter(Boolean) as Sequence[]
      : tab === 'mine' ? state.sequences.filter((s) => !s.seeded).sort((a, b) => b.updatedAt - a.updatedAt)
        : tab === 'new' ? [...shared].sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
          : [...shared].sort((a, b) => ((b.community?.saves ?? 0) + boost(b)) - ((a.community?.saves ?? 0) + boost(a)));
  const ai = Math.max(0, feed.findIndex((s) => s.id === active));
  const li = LANES.findIndex(([k]) => k === lane);

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
  }, [feed.length, tab, lane]);

  const jump = (d: -1 | 1) => {
    const next = feed[ai + d];
    if (next) listRef.current?.querySelector(`[data-reel="${next.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  useTriggers(lane !== 'live', ai > 0 ? 'Previous Sequence' : undefined, ai < feed.length - 1 ? 'Next Sequence' : undefined, jump);

  const goLane = (l: Lane) => { setLane(l); setActive(null); listRef.current?.scrollTo({ top: 0 }); };
  const down = (e: PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY }; };
  const up = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) < 90 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const next = LANES[li + (dx < 0 ? 1 : -1)];
    if (next) goLane(next[0]);
  };

  return (
    <div className="screen qfeed">
      <header className="page-head page-head--tight">
        <div>
          <p className="eyebrow">Share · Discover · Remix · Send</p>
          <h1 className="page-title">In the Queue</h1>
        </div>
        <div className="lanes" role="tablist" aria-label="Lanes">
          {LANES.map(([k, label], i) => (
            <button key={k} type="button" role="tab" aria-selected={lane === k} className={`lane ${lane === k ? 'is-on' : ''}`} onClick={() => goLane(k)}>
              {i === 0 && <span aria-hidden="true">‹ </span>}{label}{i === 2 && <span aria-hidden="true"> ›</span>}
              {k === 'live' && <em>soon</em>}
            </button>
          ))}
        </div>
        {lane === 'feed' ? (
          <div className="subtabs" role="tablist" aria-label="Feed">
            {TABS.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={`subtab ${tab === k ? 'is-on' : ''}`} onClick={() => { setTab(k); setActive(null); listRef.current?.scrollTo({ top: 0 }); }}>
                {label}{k === 'saved' && state.savedSequenceIds.length > 0 && <span className="subtab__n">{state.savedSequenceIds.length}</span>}
              </button>
            ))}
          </div>
        ) : <p className="lanes__hint">{lane === 'recs' ? 'Picked for your Repertoire. Swipe right for the Queue.' : 'Live demonstrations are coming. Swipe left for the Queue.'}</p>}
      </header>
      <div className={`reels lane-${lane}`} ref={listRef} onPointerDown={down} onPointerUp={up} key={lane}>
        {lane === 'live' ? <LiveLane /> : feed.map((s) => <Reel key={s.id} seq={s} why={lane === 'recs' ? why.get(s.id) : undefined} playing={s.id === (active ?? feed[0]?.id)} />)}
        {lane !== 'live' && !feed.length && (
          <div className="empty empty--big">
            <p className="empty__title">{tab === 'saved' ? 'Nothing saved yet' : tab === 'mine' ? 'Nothing of yours yet' : 'The Queue is quiet'}</p>
            <p className="muted">{tab === 'saved' ? 'Tap Save on a Sequence you like. It also shows up in your Repertoire.' : 'Build a Sequence in Repertoire, perform it, then share it here.'}</p>
            <button type="button" className="btn btn--primary" onClick={() => setTab('popular')}>Browse Popular</button>
          </div>
        )}
        {lane !== 'live' && <p className="reels__note" aria-hidden="true">A sample feed for now. It lives on this device; sharing adds yours with a simulated audience.</p>}
      </div>
    </div>
  );
}

const LIVE = [
  { creator: 'ada', when: 'Tonight · 7:30 pm', title: 'The classical order, cued slowly', about: 'Thirty minutes through the mat order with every cue explained. Bring a towel.' },
  { creator: 'kemi', when: 'Thursday · 6:00 pm', title: 'Breath and the pelvic floor, after baby', about: 'Gentle, practical, and full of questions from the chat.' },
  { creator: 'wren', when: 'Sunday · 9:00 am', title: 'Wind-down in the Lantern Room', about: 'Side-lying and supine work to end the week softly.' }
];

function LiveLane() {
  const { toast } = useInput();
  const [asked, setAsked] = useState<string[]>([]);
  return (
    <div className="live">
      <p className="live__lead">Watch a teacher move through a Sequence live, ask questions, then save what they taught into your Repertoire.</p>
      <ul className="live__list">
        {LIVE.map((l) => {
          const c = CREATORS.find((x) => x.id === l.creator)!;
          const on = asked.includes(l.creator);
          return (
            <li key={l.creator} className="live__card">
              <span className="live__tag"><i aria-hidden="true" /> Preview</span>
              <span className="avatar" style={{ background: `var(${c.hue})` }} aria-hidden="true">{c.name.slice(0, 1)}</span>
              <div>
                <p className="live__when">{l.when}</p>
                <h3 className="live__title">{l.title}</h3>
                <p className="live__who">{c.name} · {c.studio}</p>
                <p className="muted">{l.about}</p>
              </div>
              <button type="button" className={`btn btn--small ${on ? 'btn--primary' : 'btn--ghost'}`} aria-pressed={on}
                onClick={() => { setAsked((a) => (on ? a.filter((x) => x !== l.creator) : [...a, l.creator])); if (!on) toast(`We’ll remind you when live sessions open. ${c.name} will be glad.`); }}>
                {on ? '✓ Remind me' : 'Remind me'}
              </button>
            </li>
          );
        })}
      </ul>
      <section className="live__support">
        <p className="eyebrow">Coming later</p>
        <h3>Support the teachers you learn from</h3>
        <p>Supporters get replays, cue notes and first look at new Sequences. Creators keep most of what they earn. Everything in the game stays earnable by playing: support is a thank-you, never a shortcut.</p>
      </section>
    </div>
  );
}

function Reel({ seq, playing, why }: { seq: Sequence; playing: boolean; why?: string }) {
  const { state, dispatch, content } = useStore();
  const { go } = useNav();
  const { toast } = useInput();
  const { openSheet } = useOverlays();
  const remix = useRemixSequence();
  const load = useLoadSequence();
  const motion = useMotionOk();
  const [i, setI] = useState(0);
  const st = sequenceStats(seq.slots, content);
  const n = st.views.length;
  const mine = !seq.seeded;
  const saved = state.savedSequenceIds.includes(seq.id);
  const unknown = unknownCards(seq, state, content);
  const plays = (seq.community?.plays ?? 0) + seq.analytics.plays;
  const met = readHarmonies(seq.slots, content, state.ownedCardIds).filter((r) => r.status === 'met');
  const creator = creatorByName(seq.author);
  const inTop8 = !!creator && state.profile.top8.includes(creator.id);

  useEffect(() => {
    if (!playing || !motion || n < 2) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 2600);
    return () => window.clearInterval(t);
  }, [playing, motion, n]);
  useEffect(() => { if (!playing) setI(0); }, [playing]);

  const send = () => openSheet({ eyebrow: 'Send to a client', title: seq.name, body: <SendToClient seq={seq} /> });
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
        {why && <p className="reel__why"><span aria-hidden="true">✧</span> {why}</p>}
        <p className="reel__by">
          <span className="avatar" style={{ background: hueOf(seq.author) }} aria-hidden="true">{(mine ? state.studioName : seq.author).slice(0, 1)}</span>
          <span><strong>{mine ? 'You' : seq.author}</strong><small>{mine ? state.studioName : seq.studio} · {seq.published ? ago(seq.publishedAt) : 'not shared yet'}</small></span>
          {creator && (
            <button type="button" className={`reel__top8 ${inTop8 ? 'is-on' : ''}`} aria-pressed={inTop8} onClick={() => { dispatch({ type: 'profile/top8', creatorId: creator.id }); toast(inTop8 ? `${creator.name} left your Top 8.` : `${creator.name} is in your Top 8.`); }}>
              {inTop8 ? '♥ Top 8' : '♡ Top 8'}
            </button>
          )}
        </p>
        <h2 className="reel__name">{seq.name}</h2>
        {seq.note && <p className="reel__note">“{seq.note}”</p>}
        <ClassArc slots={seq.slots} className="reel__arc" compact />
        <p className="reel__meta"><strong className="reel__harmonies">✺ {met.length} of 7 Harmonies</strong> · {st.totalCards} cards · {st.durationLabel} · {mixLabel(st.mix)}</p>
        {seq.published && <p className="reel__meta">{plays.toLocaleString()} plays · {(seq.community?.saves ?? 0).toLocaleString()} saves</p>}
        {unknown.length > 0 && (
          <button type="button" className="reel__unknown" onClick={() => go('technique')} data-a="See them in Technique">
            <span aria-hidden="true">✧</span> Uses {unknown.length === 1 ? unknown[0].name : `${unknown.length} Techniques`} you haven’t learned yet
          </button>
        )}
        {seq.published && (
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
        )}
        <div className="reel__actions">
          <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: 'play/start', sequenceId: seq.id })}><span aria-hidden="true">▶</span> {mine ? 'Perform' : 'Try it'}</button>
          {!mine && (
            <button type="button" className={`btn btn--ghost ${saved ? 'is-saved' : ''}`} aria-pressed={saved} onClick={() => { dispatch({ type: 'sequence/toggleSaved', sequenceId: seq.id }); toast(saved ? `${seq.name} taken out of Saved.` : `${seq.name} saved. It’s in your Repertoire too.`); }}>
              <span aria-hidden="true">{saved ? '★' : '☆'}</span> {saved ? 'Saved' : 'Save'}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={() => void (mine ? load(seq) : remix(seq))}><span aria-hidden="true">↻</span> {mine ? 'Improve' : 'Remix'}</button>
          <button type="button" className="btn btn--ghost" onClick={send}><span aria-hidden="true">✉</span> Send</button>
        </div>
      </div>
    </article>
  );
}
