import { useEffect, useRef, useState } from 'react';
import { RULES } from '../content/catalog';
import { POSITION_LABEL } from '../content/content';
import { clock, doseLabel, mixLabel, sequenceStats, streakBonus, viewSlot } from '../game/rules';
import { useStore } from '../game/store';
import type { PlayState, Sequence } from '../game/types';
import { focusEl, useBack, useInput, usePrimary, useTriggers } from '../input/InputProvider';
import { Art, BigCard, Mosaic } from '../ui/Cards';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';
import { useDraft } from '../ui/useDraft';
import { useLoadSequence } from './builder/Sidebar';

export function PlayScreen() {
  const { state } = useStore();
  const play = state.play;
  const seq = play ? state.sequences.find((s) => s.id === play.sequenceId) : undefined;
  if (!play || !seq) return <PlayEmpty />;
  if (play.finished) return <PlayComplete seq={seq} play={play} />;
  return <Playing key={play.startedAt} seq={seq} play={play} />;
}

// ---------------------------------------------------------------- playing

function Playing({ seq, play }: { seq: Sequence; play: PlayState }) {
  const { dispatch, content } = useStore();
  const { paused } = useInput();
  const { confirm } = useOverlays();
  const views = seq.slots.map((s) => viewSlot(s, content));
  const index = play.index;
  const v = views[index];
  const done = (i: number) => play.completedSlotIds.includes(seq.slots[i]?.slotId);
  const [left, setLeft] = useState(v?.duration ?? 0);
  const [held, setHeld] = useState(false);
  const [pop, setPop] = useState<{ n: number; bonus: number; key: number } | null>(null);
  const completeRef = useRef<HTMLButtonElement>(null);
  const advance = useRef(0);

  const firstDuration = views[index]?.duration ?? 0;
  useEffect(() => { setLeft(firstDuration); }, [index, firstDuration]);
  const running = !paused && !held && !done(index) && left > 0;
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(t);
  }, [running]);
  useEffect(() => () => window.clearTimeout(advance.current), []);

  const goto = (i: number) => { window.clearTimeout(advance.current); if (i >= 0 && i < seq.slots.length) dispatch({ type: 'play/goto', index: i }); };
  const complete = () => {
    if (!v || done(index)) return;
    const streak = play.streak + 1;
    const bonus = streakBonus(streak);
    setPop({ n: v.points + bonus, bonus, key: Date.now() });
    dispatch({ type: 'play/complete' });
    const next = seq.slots.findIndex((s, i) => i > index && !play.completedSlotIds.includes(s.slotId));
    const wrap = next < 0 ? seq.slots.findIndex((s, i) => i !== index && !play.completedSlotIds.includes(s.slotId)) : next;
    if (wrap >= 0) advance.current = window.setTimeout(() => { dispatch({ type: 'play/goto', index: wrap }); window.setTimeout(() => focusEl(completeRef.current), 40); }, 700);
  };
  const leave = async () => {
    const n = play.completedSlotIds.length;
    if (await confirm({ title: 'Leave this sequence?', body: n ? `You’ve completed ${n} of ${seq.slots.length} cards. The points you earned stay; the streak ends here.` : 'Nothing is lost — you can play it again from the start any time.', confirm: 'Leave sequence' })) {
      dispatch({ type: 'play/exit' });
    }
  };
  useBack(true, 'Leave sequence', leave);
  usePrimary(true, held ? 'Resume timer' : 'Pause timer', () => setHeld((h) => !h), !done(index));
  useTriggers(true, index > 0 ? 'Previous card' : undefined, index < seq.slots.length - 1 ? 'Next card' : undefined, (d) => goto(index + d));

  if (!v) return null;
  const isDone = done(index);
  const total = v.duration;
  const frac = total ? left / total : 0;
  const R = 54, C = 2 * Math.PI * R;
  const nextBonus = streakBonus(play.streak + 1);
  const doseText = v.card.kind === 'movement' ? doseLabel(v.card.dose) : v.card.kind === 'transition' ? `About ${clock(v.card.duration)}` : v.card.effect;

  return (
    <div className="screen play">
      <aside className="play__side" aria-label="Up next">
        <p className="eyebrow">Now playing</p>
        <h1 className="play__title">{seq.name}</h1>
        <p className="play__by">{seq.seeded ? `by ${seq.author}` : 'Your build'} · {seq.slots.length} cards</p>
        <ol className="upnext scroll">
          {views.map((w, i) => w && (
            <li key={w.slot.slotId}>
              <button type="button" className={`upnext__row ${i === index ? 'is-current' : ''} ${done(i) ? 'is-done' : ''}`} aria-current={i === index ? 'step' : undefined}
                onClick={() => goto(i)} aria-label={`Card ${i + 1}: ${w.card.name}${done(i) ? ', done' : ''}`} data-a={i === index ? 'Playing' : 'Go to this card'}>
                <span className="upnext__num">{done(i) ? '✓' : i + 1}</span>
                <span className="upnext__art"><Art card={w.card} content={content} /></span>
                <span className="upnext__name">{w.card.name}<small>{clock(w.duration)}</small></span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="btn btn--ghost btn--small" onClick={leave}>Leave sequence</button>
      </aside>

      <section className="play__stage" aria-live="polite">
        <div className="play__count">Card {index + 1} of {seq.slots.length}</div>
        <div className="play__card" key={v.slot.slotId}>
          <BigCard card={v.card} content={content} modifiers={v.modifiers} glow={isDone}
            footer={<><span>{doseText}</span><span>{v.card.kind === 'movement' ? POSITION_LABEL[v.card.position] : ''}</span><span>{v.points} pts</span></>} />
          {pop && <span key={pop.key} className="points-pop" aria-hidden="true">+{pop.n}{pop.bonus ? <small>streak +{pop.bonus}</small> : null}</span>}
        </div>
      </section>

      <aside className="play__panel" aria-label="Timer and controls">
        <div className={`timer ${left === 0 && !isDone ? 'is-up' : ''} ${held || paused ? 'is-held' : ''}`} role="timer" aria-label={`${clock(left)} left`}>
          <svg viewBox="0 0 128 128" aria-hidden="true">
            <circle cx="64" cy="64" r={R} className="timer__track" />
            <circle cx="64" cy="64" r={R} className="timer__fill" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
          </svg>
          <span className="timer__time">{isDone ? '✓' : clock(left)}</span>
          <span className="timer__label">{isDone ? 'Done' : held ? 'Paused' : paused ? 'Paused while a menu is open' : left === 0 ? 'Complete when ready' : 'with setup'}</span>
        </div>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setHeld((h) => !h)} aria-disabled={isDone || undefined} aria-pressed={held}>
          {held ? '▶ Resume' : '❚❚ Pause'}
        </button>
        <dl className="play__stats">
          <div><dt>Streak</dt><dd>{play.streak}{nextBonus > 0 && !isDone ? <small> · next +{nextBonus}</small> : null}</dd></div>
          <div><dt>This run</dt><dd>+{play.pointsEarned}</dd></div>
        </dl>
        <button ref={completeRef} type="button" className={`btn btn--primary btn--big ${isDone ? 'is-done' : ''}`} data-autofocus="" onClick={complete} aria-disabled={isDone || undefined}>
          {isDone ? 'Completed ✓' : 'Complete card'}
        </button>
        <div className="play__nav">
          <button type="button" className="btn btn--ghost" onClick={() => goto(index - 1)} aria-disabled={index === 0 || undefined}>‹ Previous</button>
          <button type="button" className="btn btn--ghost" onClick={() => goto(index + 1)} aria-disabled={index === seq.slots.length - 1 || undefined}>Next ›</button>
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- finished

function PlayComplete({ seq, play }: { seq: Sequence; play: PlayState }) {
  const { state, dispatch, content } = useStore();
  const { go } = useNav();
  const { toast } = useInput();
  const load = useLoadSequence();
  const stats = sequenceStats(seq.slots, content);
  const minutes = Math.max(1, Math.round((Date.now() - play.startedAt) / 60000));
  const mine = !seq.seeded;
  const done = () => dispatch({ type: 'play/exit' });
  usePrimary(true, 'Play again', () => dispatch({ type: 'play/start', sequenceId: seq.id }));
  useBack(true, 'Done', done);
  const full = stats.deckIds.length >= 3 && seq.slots.length >= RULES.fullPractice;

  return (
    <div className="screen play-done">
      <div className="play-done__art"><Mosaic cardIds={seq.slots.map((s) => s.cardId)} content={content} /></div>
      <div className="play-done__body">
        <p className="eyebrow">Sequence complete</p>
        <h1 className="page-title">{seq.name}</h1>
        <p className="page-sub">Movement changes people, people change the world. Thank you for practising.</p>
        <dl className="done-stats">
          <div><dt>Cards</dt><dd>{seq.slots.length}</dd></div>
          <div><dt>Points this run</dt><dd>+{play.pointsEarned}</dd></div>
          <div><dt>Best streak</dt><dd>{play.bestStreak}</dd></div>
          <div><dt>Time</dt><dd>{minutes} min</dd></div>
        </dl>
        <p className="muted">{mixLabel(stats.mix)}{full ? ' · a Full Practice' : ''} · {state.countedPoints}/{RULES.pointCap} points counted</p>
        <div className="play-done__actions">
          {mine && !seq.published && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { dispatch({ type: 'sequence/publish', sequenceId: seq.id }); toast(`${seq.name} is in the community feed.`); }}>Publish to community</button>}
          {mine && seq.published && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { done(); go('community'); }}>See it in Community</button>}
          <button type="button" className={`btn ${mine ? 'btn--ghost' : 'btn--primary'}`} data-autofocus={mine ? undefined : ''} onClick={() => dispatch({ type: 'play/start', sequenceId: seq.id })}>Play again</button>
          <button type="button" className="btn btn--ghost" onClick={() => { done(); void load(seq); }}>Remix in the builder</button>
          <button type="button" className="btn btn--ghost" onClick={done}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- nothing playing

function PlayEmpty() {
  const { state, dispatch, content } = useStore();
  const { go } = useNav();
  const draft = useDraft();
  const dstats = sequenceStats(state.draftSlots, content);
  const mine = state.sequences.filter((s) => !s.seeded).sort((a, b) => b.updatedAt - a.updatedAt);
  const community = state.sequences.filter((s) => s.seeded);
  usePrimary(state.draftSlots.length > 0, 'Start your build', () => dispatch({ type: 'sequence/saveAndStart' }));
  return (
    <div className="screen play-empty">
      <header className="page-head">
        <div>
          <p className="eyebrow">Play</p>
          <h1 className="page-title">Ready when you are</h1>
          <p className="page-sub">Play a build card by card. Complete each one in your own time — the timer is a guide, never a judge.</p>
        </div>
      </header>
      <div className="play-empty__body scroll">
        {state.draftSlots.length > 0 ? (
          <section className="now-card">
            <Mosaic cardIds={state.draftSlots.map((s) => s.cardId)} content={content} className="now-card__art" />
            <div>
              <p className="eyebrow">In the builder</p>
              <h2>{state.draftName.trim() || 'Untitled Build'}</h2>
              <p className="muted">{dstats.totalCards} cards · {dstats.durationLabel} · {mixLabel(dstats.mix)}{draft.dirty ? ' · not saved yet' : ''}</p>
            </div>
            <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={() => dispatch({ type: 'sequence/saveAndStart' })}><span aria-hidden="true">▶</span> Start</button>
          </section>
        ) : (
          <section className="now-card now-card--empty">
            <div>
              <p className="eyebrow">Nothing in the builder</p>
              <h2>Build something first — or play one below</h2>
            </div>
            <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => go('builder')}>Open the Builder</button>
          </section>
        )}
        {mine.length > 0 && <Shelf title="Your builds" seqs={mine} />}
        <Shelf title="From the community" seqs={community} />
      </div>
    </div>
  );
}

function Shelf({ title, seqs }: { title: string; seqs: Sequence[] }) {
  const { dispatch, content } = useStore();
  return (
    <section className="shelf" aria-label={title}>
      <h2 className="shelf__title">{title}</h2>
      <div className="shelf__row">
        {seqs.map((s) => {
          const st = sequenceStats(s.slots, content);
          return (
            <button key={s.id} type="button" className="album" onClick={() => dispatch({ type: 'play/start', sequenceId: s.id })}
              aria-label={`Play ${s.name}, ${st.totalCards} cards, ${st.durationLabel}`} data-a={`Play ${s.name}`}>
              <span className="album__art"><Mosaic cardIds={s.slots.map((x) => x.cardId)} content={content} /><span className="album__play" aria-hidden="true">▶</span></span>
              <span className="album__name">{s.name}</span>
              <span className="album__meta">{s.seeded ? s.author : `${st.totalCards} cards`} · {st.durationLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

