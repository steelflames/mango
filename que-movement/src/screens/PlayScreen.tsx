import { useEffect, useMemo, useRef, useState } from 'react';
import { POSITION_LABEL } from '../content/content';
import { clock, doseLabel, mixLabel, readNode, sequenceStats, streakBonus, viewSlot } from '../game/rules';
import { useStore } from '../game/store';
import type { PlayState, Sequence } from '../game/types';
import { focusEl, useBack, useInput, usePrimary, useTriggers } from '../input/InputProvider';
import { accentOf, Art, BigCard, Mosaic } from '../ui/Cards';
import { fly, setCeremony } from '../ui/fly';
import { sfx } from '../ui/sound';
import { VictoryLap, type LapCard } from '../ui/VictoryLap';
import { SendToClient } from '../ui/SendToClient';
import { readHarmonies } from '../game/harmonies';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';
import { useDraft } from '../ui/useDraft';
import { useLoadSequence, useRemixSequence } from './repertoire/Sidebar';

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
  const lastIndex = useRef(index);
  const dir = index >= lastIndex.current ? 'next' : 'prev';
  useEffect(() => { lastIndex.current = index; }, [index]);

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
    sfx.complete(streak);
    fly(document.querySelector('.play__card .big-card'), document.querySelector('.pile__slot'), { duration: 620, rotate: -6, lift: 40 });
    dispatch({ type: 'play/complete' });
    const next = seq.slots.findIndex((s, i) => i > index && !play.completedSlotIds.includes(s.slotId));
    const wrap = next < 0 ? seq.slots.findIndex((s, i) => i !== index && !play.completedSlotIds.includes(s.slotId)) : next;
    if (wrap >= 0) advance.current = window.setTimeout(() => { dispatch({ type: 'play/goto', index: wrap }); window.setTimeout(() => focusEl(completeRef.current), 40); }, 700);
  };
  const leave = async () => {
    const n = play.completedSlotIds.length;
    if (await confirm({ title: 'Leave this Sequence?', body: n ? `You’ve completed ${n} of ${seq.slots.length} cards. The points you earned stay; the streak ends here.` : 'Nothing is lost — you can play it again from the start any time.', confirm: 'Leave Sequence' })) {
      dispatch({ type: 'play/exit' });
    }
  };
  useBack(true, 'Leave Sequence', leave);
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
        <p className="play__by">{seq.seeded ? `by ${seq.author}` : 'Your Sequence'} · {seq.slots.length} cards</p>
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
        <div className="pile" role="img" aria-label={`${play.completedSlotIds.length} of ${seq.slots.length} cards completed`}>
          <span className="pile__slot" aria-hidden="true">
            {views.filter((w, i) => w && done(i)).slice(-5).map((w, k) => w && (
              <span key={w.slot.slotId} className="pile__card" style={{ ['--k' as string]: k, ['--r' as string]: `${((k * 37) % 9) - 4}deg` }}><Art card={w.card} content={content} /></span>
            ))}
            {!play.completedSlotIds.length && <span className="pile__empty">Completed cards land here</span>}
          </span>
          <span className="pile__count"><strong>{play.completedSlotIds.length}</strong>/{seq.slots.length}</span>
        </div>
        <button type="button" className="btn btn--ghost btn--small" onClick={leave}>Leave Sequence</button>
      </aside>

      <section className="play__stage" aria-live="polite">
        <div className="play__count">Card {index + 1} of {seq.slots.length}</div>
        <div className={`play__card deal-${dir}`} key={v.slot.slotId}>
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

type Phase = 'lap' | 'ledger' | 'done';
/** Performances whose ceremony has already played, so coming back to Play doesn't replay it. */
const celebrated = new Set<number>();

function PlayComplete({ seq, play }: { seq: Sequence; play: PlayState }) {
  const { state, dispatch, content } = useStore();
  const { go } = useNav();
  const { toast } = useInput();
  const { openSheet } = useOverlays();
  const load = useLoadSequence();
  const remix = useRemixSequence();
  const stats = sequenceStats(seq.slots, content);
  const minutes = Math.max(1, Math.round((Date.now() - play.startedAt) / 60000));
  const mine = !seq.seeded;
  const done = () => dispatch({ type: 'play/exit' });
  const ready = content.branch.nodes.filter((n) => readNode(n, state, content).status === 'ready');
  const readings = useMemo(() => readHarmonies(seq.slots, content, state.ownedCardIds), [seq.slots, content, state.ownedCardIds]);
  const met = readings.filter((r) => r.status === 'met');
  const notes = readings.filter((r) => r.status === 'open' && r.hint);
  const lapCards = useMemo<LapCard[]>(() => seq.slots.map((s) => content.cardById[s.cardId]).filter(Boolean).map((c) => ({ name: c.name, accent: accentOf(c, content) ?? 'var(--dusty-blue)' })), [seq.slots, content]);
  const seen = celebrated.has(play.startedAt);
  const [phase, setPhase] = useState<Phase>(seen ? 'done' : 'lap');
  const [shown, setShown] = useState(seen ? met.length : 0);
  const cardPoints = play.pointsEarned - (play.harmonyPoints ?? 0);
  const total = cardPoints + met.slice(0, shown).reduce((a, r) => a + r.def.points, 0);

  // Hold badges back until the ceremony has played.
  useEffect(() => {
    if (celebrated.has(play.startedAt)) return;
    celebrated.add(play.startedAt);
    setCeremony(true);
    return () => setCeremony(false);
  }, [play.startedAt]);
  useEffect(() => {
    if (phase !== 'ledger') return;
    if (shown >= met.length) { const t = window.setTimeout(() => { setPhase('done'); setCeremony(false); }, 500); return () => window.clearTimeout(t); }
    const t = window.setTimeout(() => { sfx.harmony(shown); setShown((n) => n + 1); }, shown === 0 ? 350 : 520);
    return () => window.clearTimeout(t);
  }, [phase, shown, met.length]);
  const skip = () => { setShown(met.length); setPhase('done'); setCeremony(false); };
  usePrimary(true, ready.length ? 'Spend points in Technique' : 'Perform again', () => { if (ready.length) { done(); go('technique'); } else dispatch({ type: 'play/start', sequenceId: seq.id }); });
  useBack(true, 'Done', done);
  const improve = () => { done(); void (mine ? load(seq) : remix(seq)); };

  return (
    <div className="screen play-done" onClick={phase === 'ledger' ? skip : undefined}>
      {phase === 'lap' && <VictoryLap cards={lapCards} onDone={() => setPhase('ledger')} />}
      <div className="play-done__art"><Mosaic cardIds={seq.slots.map((s) => s.cardId)} content={content} /></div>
      <div className="play-done__body">
        <p className="eyebrow">Sequence performed</p>
        <h1 className="page-title">{seq.name}</h1>
        <div className={`ledger ${phase === 'done' ? 'is-settled' : ''}`} aria-live="polite">
          <div className="ledger__row"><span>Cards and streak</span><strong>+{cardPoints}</strong></div>
          {met.map((r, i) => (
            <div key={r.def.id} className={`ledger__row ledger__row--harmony ${i < shown ? 'is-in' : ''}`}>
              <span><span className="ledger__glyph" aria-hidden="true">{r.def.glyph}</span>{r.def.name}<small>{r.def.says}</small></span>
              <strong>+{r.def.points}</strong>
            </div>
          ))}
          {!met.length && <p className="muted ledger__none">No Harmonies this time. The teachers left notes below.</p>}
          <div className="ledger__total"><span>{met.length} of 7 Harmonies</span><strong>✦ {total}</strong></div>
        </div>
        {phase === 'done' && (
          <div className="play-done__after">
            <dl className="done-stats">
              <div><dt>To spend</dt><dd>{state.points}</dd></div>
              <div><dt>Best streak</dt><dd>{play.bestStreak}</dd></div>
              <div><dt>Time</dt><dd>{minutes} min</dd></div>
              <div><dt>Cards</dt><dd>{stats.totalCards}</dd></div>
            </dl>
            {notes.length > 0 && (
              <p className="tnote"><span className="tnote__who">Teacher’s note for next time · {notes[0].def.name}</span>{notes[0].hint}</p>
            )}
            {ready.length > 0 && (
              <div className="within-reach">
                <p className="eyebrow">Within reach</p>
                <ul>{ready.map((n) => <li key={n.id}><Art card={content.cardById[n.cardId]} content={content} live /><span>{content.cardById[n.cardId].name}<small>✦ {n.cost}</small></span></li>)}</ul>
              </div>
            )}
            <div className="play-done__actions">
              {ready.length > 0 && <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => { done(); go('technique'); }}>Learn a Technique →</button>}
              {notes.length > 0 && <button type="button" className={`btn ${ready.length ? 'btn--ghost' : 'btn--primary'}`} data-autofocus={ready.length ? undefined : ''} onClick={improve}>Improve it</button>}
              {mine && !seq.published && <button type="button" className="btn btn--ghost" onClick={() => { dispatch({ type: 'sequence/publish', sequenceId: seq.id }); toast(`${seq.name} is In the Queue.`); }}>Share In the Queue</button>}
              <button type="button" className="btn btn--ghost" onClick={() => openSheet({ eyebrow: 'Send to a client', title: seq.name, body: <SendToClient seq={seq} /> })}>Send to a client</button>
              <button type="button" className="btn btn--ghost" data-autofocus={!ready.length && !notes.length ? '' : undefined} onClick={() => dispatch({ type: 'play/start', sequenceId: seq.id })}>Perform again</button>
              {!notes.length && <button type="button" className="btn btn--ghost" onClick={improve}>{mine ? 'Refine in Repertoire' : 'Remix it'}</button>}
              <button type="button" className="btn btn--ghost" onClick={done}>Done</button>
            </div>
            <p className="muted play-done__mix">{mixLabel(stats.mix)}</p>
          </div>
        )}
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
  const saved = state.savedSequenceIds.map((id) => state.sequences.find((s) => s.id === id)).filter(Boolean) as Sequence[];
  const community = state.sequences.filter((s) => s.seeded && !state.savedSequenceIds.includes(s.id));
  usePrimary(state.draftSlots.length > 0, 'Perform your Sequence', () => dispatch({ type: 'sequence/saveAndStart' }));
  return (
    <div className="screen play-empty">
      <header className="page-head">
        <div>
          <p className="eyebrow">Play</p>
          <h1 className="page-title">Ready when you are</h1>
          <p className="page-sub">Perform a Sequence card by card. Complete each one in your own time: the timer is a guide, never a judge.</p>
        </div>
      </header>
      <div className="play-empty__body scroll">
        {state.draftSlots.length > 0 ? (
          <section className="now-card">
            <Mosaic cardIds={state.draftSlots.map((s) => s.cardId)} content={content} className="now-card__art" />
            <div>
              <p className="eyebrow">In the builder</p>
              <h2>{state.draftName.trim() || 'Untitled Sequence'}</h2>
              <p className="muted">{dstats.totalCards} cards · {dstats.durationLabel} · {mixLabel(dstats.mix)}{draft.dirty ? ' · not saved yet' : ''}</p>
            </div>
            <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={() => dispatch({ type: 'sequence/saveAndStart' })}><span aria-hidden="true">▶</span> Perform</button>
          </section>
        ) : (
          <section className="now-card now-card--empty">
            <div>
              <p className="eyebrow">Nothing in the builder</p>
              <h2>Build a Sequence first, or try one below</h2>
            </div>
            <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => go('repertoire')}>Open Repertoire</button>
          </section>
        )}
        {mine.length > 0 && <Shelf title="Your Sequences" seqs={mine} />}
        {saved.length > 0 && <Shelf title="Saved from the Queue" seqs={saved} />}
        <Shelf title="In the Queue" seqs={community} />
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
              <span className="album__meta">{s.seeded ? s.studio ?? s.author : `${st.totalCards} cards`} · {st.durationLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

