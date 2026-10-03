import { useEffect, useMemo, useRef, useState } from 'react';
import { POSITION_LABEL } from '../content/content';
import { clock, doseLabel, FLAT_RATE, milestoneMet, mixLabel, PEAK_POINTS, readNode, sequenceStats, viewSlot } from '../game/rules';
import { questById } from '../content/quests';
import { useStore } from '../game/store';
import type { PlayState, Sequence } from '../game/types';
import { focusEl, useBack, useInput, usePrimary, useTriggers } from '../input/InputProvider';
import { accentOf, Art, BigCard, Mosaic } from '../ui/Cards';
import { fly, setCeremony } from '../ui/fly';
import { sfx } from '../ui/sound';
import { VictoryLap, type LapCard } from '../ui/VictoryLap';
import { SendToClient } from '../ui/SendToClient';
import { Teaching } from '../ui/CardDetails';
import { SPECIAL_TEACHING, TEACHING } from '../content/teaching';
import { useMotionOk } from '../ui/art/CardArt';
import type { Card } from '../content/types';
import { HARMONIES, peakSlotIds, readHarmonies } from '../game/harmonies';
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
  const { state, dispatch, content } = useStore();
  const { paused, toast } = useInput();
  const { confirm, openSheet } = useOverlays();
  const views = seq.slots.map((s) => viewSlot(s, content));
  const index = play.index;
  const v = views[index];
  const done = (i: number) => play.completedSlotIds.includes(seq.slots[i]?.slotId);
  const peaks = useMemo(() => peakSlotIds(seq.slots, content), [seq.slots, content]);
  const [elapsed, setElapsed] = useState(0);
  const [held, setHeld] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [pop, setPop] = useState<{ text: string; peak: boolean; key: number } | null>(null);
  const completeRef = useRef<HTMLButtonElement>(null);
  const advance = useRef(0);
  const lastIndex = useRef(index);
  const dir = index >= lastIndex.current ? 'next' : 'prev';
  useEffect(() => { lastIndex.current = index; }, [index]);

  const slotId = v?.slot.slotId;
  useEffect(() => { setElapsed(0); setTimerOpen(false); }, [slotId]);
  const running = !paused && !held && !done(index);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, [running]);
  useEffect(() => () => window.clearTimeout(advance.current), []);
  // A gentle note when a step's time has learned from you.
  const learned = play.learned;
  useEffect(() => {
    if (!learned) return;
    const card = content.cardById[seq.slots.find((x) => x.slotId === learned.slotId)?.cardId ?? ''];
    if (card) toast(`${card.name} is now ${clock(learned.seconds)} in ${seq.name}.`);
  }, [learned]); // eslint-disable-line react-hooks/exhaustive-deps

  const goto = (i: number) => { window.clearTimeout(advance.current); if (i >= 0 && i < seq.slots.length) dispatch({ type: 'play/goto', index: i }); };
  const nextOpen = () => {
    const after = seq.slots.findIndex((s, i) => i > index && !play.completedSlotIds.includes(s.slotId));
    return after >= 0 ? after : seq.slots.findIndex((s, i) => i !== index && !play.completedSlotIds.includes(s.slotId));
  };
  /** One button: complete this card and move on. */
  const completeAndNext = () => {
    if (!v) return;
    if (done(index)) { const n = nextOpen(); if (n >= 0) goto(n); return; }
    const peak = peaks.includes(v.slot.slotId);
    setPop({ text: peak ? `+${PEAK_POINTS}` : '✓', peak, key: Date.now() });
    sfx.complete(play.completedSlotIds.length + 1);
    fly(document.querySelector('.play__card .big-card'), document.querySelector('.pile__slot'), { duration: 620, rotate: -6, lift: 40 });
    dispatch({ type: 'play/complete', elapsed });
    const n = nextOpen();
    if (n >= 0) advance.current = window.setTimeout(() => { dispatch({ type: 'play/goto', index: n }); window.setTimeout(() => focusEl(completeRef.current), 40); }, 520);
  };
  const leave = async () => {
    const n = play.completedSlotIds.length;
    if (await confirm({ title: 'Leave this Sequence?', body: n ? `You’ve completed ${n} of ${seq.slots.length} cards. Points for peaks you finished stay.` : 'Nothing is lost. You can perform it again from the start any time.', confirm: 'Leave Sequence' })) {
      dispatch({ type: 'play/exit' });
    }
  };
  const review = () => openSheet({ eyebrow: 'Review', title: seq.name, body: <ReviewSheet seqId={seq.id} onJump={goto} /> });
  const setTime = (seconds: number) => { if (v) dispatch({ type: 'sequence/slotTime', sequenceId: seq.id, slotId: v.slot.slotId, seconds }); };
  useBack(true, 'Leave Sequence', leave);
  usePrimary(true, held ? 'Resume timer' : 'Pause timer', () => setHeld((h) => !h), !done(index));
  useTriggers(true, index > 0 ? 'Back a card' : undefined, undefined, (d) => (d < 0 ? goto(index - 1) : completeAndNext()));

  if (!v) return null;
  const isDone = done(index);
  const total = v.duration;
  const left = total - elapsed;
  const over = left < 0;
  const frac = total ? Math.max(0, left) / total : 0;
  const R = 54, C = 2 * Math.PI * R;
  const doseText = v.card.kind === 'movement' ? doseLabel(v.card.dose) : v.card.kind === 'transition' ? `About ${clock(v.card.duration)}` : v.card.effect;
  const remaining = seq.slots.length - play.completedSlotIds.length;

  return (
    <div className="screen play">
      <aside className="play__side" aria-label="Up next">
        <p className="eyebrow">Now playing</p>
        <h1 className="play__title">{seq.name}</h1>
        <p className="play__by">{seq.seeded ? `by ${seq.author}` : 'Your Sequence'} · {seq.slots.length} cards</p>
        <button type="button" className="play__review" onClick={review} data-a="Review the Sequence"><span aria-hidden="true">☰</span> Review · reorder · times</button>
        <ol className="upnext scroll">
          {views.map((w, i) => w && (
            <li key={w.slot.slotId}>
              <button type="button" className={`upnext__row ${i === index ? 'is-current' : ''} ${done(i) ? 'is-done' : ''}`} aria-current={i === index ? 'step' : undefined}
                onClick={() => goto(i)} aria-label={`Card ${i + 1}: ${w.card.name}${done(i) ? ', done' : ''}`} data-a={i === index ? 'Playing' : 'Go to this card'}>
                <span className="upnext__num">{done(i) ? '✓' : i + 1}</span>
                <span className="upnext__art"><Art card={w.card} content={content} /></span>
                <span className="upnext__name">{w.card.name}<small>{clock(w.duration)}{peaks.includes(w.slot.slotId) ? ' · peak' : ''}</small></span>
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
        <div className="play__count">Card {index + 1} of {seq.slots.length}{peaks.includes(v.slot.slotId) ? ' · Peak' : ''}</div>
        <div className={`play__card deal-${dir}`} key={v.slot.slotId}>
          <BigCard card={v.card} content={content} modifiers={v.modifiers} glow={isDone}
            footer={<><span>{doseText}</span><span>{v.card.kind === 'movement' ? POSITION_LABEL[v.card.position] : ''}</span><span>{peaks.includes(v.slot.slotId) ? `Peak · ${PEAK_POINTS} pts` : clock(total)}</span></>} />
          <CuePeek card={v.card} />
          {pop && <span key={pop.key} className={`points-pop ${pop.peak ? '' : 'is-tick'}`} aria-hidden="true">{pop.text}{pop.peak ? <small>peak</small> : null}</span>}
        </div>
      </section>

      <aside className="play__panel" aria-label="Timer and controls">
        <div className="timer-wrap">
          <div className={`timer ${over && !isDone ? 'is-up' : ''} ${held || paused ? 'is-held' : ''}`} role="timer" aria-label={`${clock(Math.abs(left))} ${over ? 'over' : 'left'}`}>
            <svg viewBox="0 0 128 128" aria-hidden="true">
              <circle cx="64" cy="64" r={R} className="timer__track" />
              <circle cx="64" cy="64" r={R} className="timer__fill" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
            </svg>
            <span className="timer__time">{isDone ? '✓' : over ? `+${clock(-left)}` : clock(left)}</span>
            <span className="timer__label">{isDone ? 'Done' : held ? 'Paused' : paused ? 'Paused while a menu is open' : over ? 'Over · take your time' : `of ${clock(total)}`}</span>
          </div>
          <button type="button" className={`timer-plus ${timerOpen ? 'is-on' : ''}`} onClick={() => setTimerOpen((o) => !o)} aria-expanded={timerOpen} aria-label="Change this card’s time" title="Change this card’s time" data-a="Change time">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="13" r="7" /><path d="M11 9v4l2.5 1.5M9 3h4M19 3v5M16.5 5.5h5" /></svg>
          </button>
        </div>
        {timerOpen && <TimeWheel seconds={total} onChange={setTime} />}
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setHeld((h) => !h)} aria-disabled={isDone || undefined} aria-pressed={held}>
          {held ? '▶ Resume' : '❚❚ Pause'}
        </button>
        <StillToEarn seq={seq} play={play} peaks={peaks} owned={state.ownedCardIds} />
        <button ref={completeRef} type="button" className="btn btn--primary btn--big play__go" data-autofocus="" onClick={completeAndNext}>
          {isDone ? (remaining ? 'Next card ›' : 'Finish ›') : remaining === 1 ? 'Complete & finish' : 'Complete & Next ›'}
        </button>
        <button type="button" className="play__back" onClick={() => goto(index - 1)} aria-disabled={index === 0 || undefined}>‹ Back a card</button>
      </aside>
    </div>
  );
}

const WHEEL = Array.from({ length: 20 }, (_, i) => (i + 1) * 15);

/** −15 s, +15 s and the carnival wheel: a fairground drum you flick to the time you want. */
function TimeWheel({ seconds, onChange }: { seconds: number; onChange: (s: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const ROW = 34;
  const current = Math.max(15, Math.min(300, Math.round(seconds / 15) * 15));
  const last = useRef(current);
  const timer = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el) el.scrollTo({ top: (current / 15 - 1) * ROW, behavior: 'smooth' });
    last.current = current;
  }, [current]);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const v = WHEEL[Math.max(0, Math.min(WHEEL.length - 1, Math.round(el.scrollTop / ROW)))];
    if (v !== last.current) { last.current = v; sfx.tap(); }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { if (v !== current) onChange(v); }, 220);
  };
  return (
    <div className="wheel-box">
      <button type="button" className="wheel-step" onClick={() => onChange(current - 15)} aria-label="Fifteen seconds less">−15s</button>
      <div className="wheel" aria-label="Card time">
        <span className="wheel__awning" aria-hidden="true" />
        <div className="wheel__drum" ref={ref} onScroll={onScroll} tabIndex={0} role="listbox" aria-label="Seconds for this card"
          onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); onChange(current - 15); } if (e.key === 'ArrowDown') { e.preventDefault(); onChange(current + 15); } }}>
          <span className="wheel__pad" />
          {WHEEL.map((v) => <span key={v} role="option" aria-selected={v === current} className={`wheel__item ${v === current ? 'is-on' : ''}`} onClick={() => onChange(v)}>{clock(v)}</span>)}
          <span className="wheel__pad" />
        </div>
        <span className="wheel__window" aria-hidden="true" />
      </div>
      <button type="button" className="wheel-step" onClick={() => onChange(current + 15)} aria-label="Fifteen seconds more">+15s</button>
    </div>
  );
}

/** In place of a streak: what this Sequence can still give you that you haven't had from it. */
function StillToEarn({ seq, play, peaks, owned }: { seq: Sequence; play: PlayState; peaks: string[]; owned: string[] }) {
  const { state, content } = useStore();
  const items: { glyph: string; text: string; pts?: number }[] = [];
  const readings = readHarmonies(seq.slots, content, owned).filter((r) => r.status === 'met');
  for (const r of readings) if (!(seq.harmoniesEarned ?? []).includes(r.def.id)) items.push({ glyph: r.def.glyph, text: `${r.def.name}, first time here`, pts: r.def.points });
  const peaksLeft = peaks.filter((id) => !play.completedSlotIds.includes(id));
  if (peaksLeft.length) items.push({ glyph: '⌃', text: `${peaksLeft.length} peak${peaksLeft.length > 1 ? 's' : ''} still to go`, pts: peaksLeft.length * PEAK_POINTS });
  const ids = seq.slots.flatMap((s) => [s.cardId, ...s.modifiers]);
  for (const m of content.milestones) {
    if (m.trigger !== 'sequence-complete' || state.completedMilestoneIds.includes(m.id)) continue;
    if (milestoneMet(m, { trigger: 'sequence-complete', completedCardIds: ids, harmonies: readings.length }, state, content)) {
      const b = content.badges.find((x) => x.id === m.reward.badgeId);
      items.push({ glyph: b?.glyph ?? '◈', text: `${b?.name ?? m.name} badge`, pts: m.reward.points });
    }
  }
  for (const n of content.branch.nodes) {
    if (readNode(n, state, content).status !== 'practise') continue;
    const parent = n.requires.map((r) => content.nodeById[r]).find((p) => p && ids.includes(p.cardId));
    if (parent) items.push({ glyph: '✧', text: `Opens ${content.cardById[n.cardId].name} in Technique` });
  }
  const quest = state.quests.active.map((id) => questById(id)).find((q) => q?.event === 'perform' || (q?.event === 'bridge' && ids.some((x) => x.includes('bridge'))));
  if (quest) items.push({ glyph: '☾', text: quest.text.replace(/\.$/, ''), pts: quest.points });
  return (
    <section className="still" aria-label="Still to earn">
      <p className="still__title"><span>Still to earn</span><small>+{FLAT_RATE} for finishing</small></p>
      {items.length ? (
        <ul>{items.slice(0, 5).map((it) => <li key={it.text}><span aria-hidden="true">{it.glyph}</span>{it.text}{it.pts ? <strong>+{it.pts}</strong> : null}</li>)}</ul>
      ) : <p className="still__none">Nothing new here this time. Change it up in Repertoire to find more.</p>}
    </section>
  );
}

/** Music-app style list: reorder steps, set each step's time, jump to one. */
function ReviewSheet({ seqId, onJump }: { seqId: string; onJump: (i: number) => void }) {
  const { state, dispatch, content } = useStore();
  const { closeSheet } = useOverlays();
  const seq = state.sequences.find((s) => s.id === seqId);
  if (!seq) return null;
  const play = state.play;
  const move = (from: number, to: number) => dispatch({ type: 'sequence/reorder', sequenceId: seq.id, from, to });
  return (
    <div className="review">
      <p className="muted">Changes save to the Sequence. Times move in 15-second steps.</p>
      <ol className="review__list">
        {seq.slots.map((slot, i) => {
          const v = viewSlot(slot, content);
          if (!v) return null;
          const doneHere = play?.completedSlotIds.includes(slot.slotId);
          const current = play?.index === i;
          return (
            <li key={slot.slotId} className={`${current ? 'is-current' : ''} ${doneHere ? 'is-done' : ''}`}>
              <span className="review__n">{doneHere ? '✓' : i + 1}</span>
              <button type="button" className="review__name" onClick={() => { onJump(i); closeSheet(); }} data-a="Go to this card">{v.card.name}{slot.durationOverride ? <small>your time</small> : null}</button>
              <span className="review__time">
                <button type="button" onClick={() => dispatch({ type: 'sequence/slotTime', sequenceId: seq.id, slotId: slot.slotId, seconds: v.duration - 15 })} aria-label={`Less time for ${v.card.name}`}>−</button>
                <span>{clock(v.duration)}</span>
                <button type="button" onClick={() => dispatch({ type: 'sequence/slotTime', sequenceId: seq.id, slotId: slot.slotId, seconds: v.duration + 15 })} aria-label={`More time for ${v.card.name}`}>+</button>
              </span>
              <span className="review__move">
                <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${v.card.name} up`}>▲</button>
                <button type="button" disabled={i === seq.slots.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${v.card.name} down`}>▼</button>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** The teacher at your shoulder: one cue at a time, the breath, and the way to make it easier. */
function CuePeek({ card }: { card: Card }) {
  const { openSheet } = useOverlays();
  const motion = useMotionOk();
  const t = card.kind === 'movement' ? TEACHING[card.id] : undefined;
  const cues = t?.cues ?? SPECIAL_TEACHING[card.id]?.cues ?? [];
  const [k, setK] = useState(0);
  useEffect(() => { setK(0); }, [card.id]);
  useEffect(() => {
    if (!motion || cues.length < 2) return;
    const id = window.setInterval(() => setK((x) => (x + 1) % cues.length), 7000);
    return () => window.clearInterval(id);
  }, [motion, cues.length, card.id]);
  if (!cues.length) return null;
  return (
    <div className="cue-peek">
      <p className="cue-peek__cue" key={k}><span className="eyebrow">Teacher’s cue</span>{cues[k % cues.length]}</p>
      {t && <p className="cue-peek__breath"><strong>Breath</strong> {t.breath}</p>}
      <div className="cue-peek__foot">
        {t && <span><strong>Easier:</strong> {t.easier.name}</span>}
        <button type="button" className="cue-peek__more" onClick={() => openSheet({ eyebrow: 'The Pilates Council', title: card.name, body: <Teaching card={card} /> })} data-a="All the notes">All the notes</button>
      </div>
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
  const fresh = play.newHarmonyIds ?? [];
  const pay = (id: string) => (fresh.includes(id) ? HARMONIES.find((h) => h.id === id)?.points ?? 0 : 0);
  const base = (play.flatPoints ?? 0) + (play.peakPoints ?? 0);
  const total = base + met.slice(0, shown).reduce((a, r) => a + pay(r.def.id), 0);

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
          <div className="ledger__row"><span>Performed all the way through</span><strong>+{play.flatPoints ?? 0}</strong></div>
          {(play.peakPoints ?? 0) > 0 && <div className="ledger__row"><span>Peaks completed</span><strong>+{play.peakPoints}</strong></div>}
          {met.map((r, i) => (
            <div key={r.def.id} className={`ledger__row ledger__row--harmony ${i < shown ? 'is-in' : ''}`}>
              <span><span className="ledger__glyph" aria-hidden="true">{r.def.glyph}</span>{r.def.name}<small>{r.def.says}</small></span>
              <strong className={pay(r.def.id) ? '' : 'is-old'}>{pay(r.def.id) ? `+${r.def.points}` : 'earned before'}</strong>
            </div>
          ))}
          {!met.length && <p className="muted ledger__none">No Harmonies this time. The teachers left notes below.</p>}
          <div className="ledger__total"><span>{met.length} of 7 Harmonies</span><strong>✦ {total}</strong></div>
        </div>
        {phase === 'done' && (
          <div className="play-done__after">
            <dl className="done-stats">
              <div><dt>To spend</dt><dd>{state.points}</dd></div>
              <div><dt>Harmonies</dt><dd>{met.length}/7</dd></div>
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

