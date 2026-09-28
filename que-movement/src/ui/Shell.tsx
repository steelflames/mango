import type { ReactNode } from 'react';
import { nextStep, readNode, type LoopStep } from '../game/rules';
import { useStore } from '../game/store';
import { firstIn, focusEl, useInput, type PadKey } from '../input/InputProvider';
import { JourneyButton } from './Journey';
import { SECTIONS, useNav } from './nav';

export function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.3 3.2h3.4l.5 2.3a7 7 0 0 1 1.9 1.1l2.2-.8 1.7 2.9-1.8 1.6a7 7 0 0 1 0 2.2l1.8 1.6-1.7 2.9-2.2-.8a7 7 0 0 1-1.9 1.1l-.5 2.3h-3.4l-.5-2.3a7 7 0 0 1-1.9-1.1l-2.2.8-1.7-2.9 1.8-1.6a7 7 0 0 1 0-2.2L3.8 8.7l1.7-2.9 2.2.8a7 7 0 0 1 1.9-1.1z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

const LOOP: { step: LoopStep; label: string }[] = [
  { step: 'learn', label: 'Learn' },
  { step: 'collect', label: 'Collect' },
  { step: 'build', label: 'Build' },
  { step: 'play', label: 'Play' },
  { step: 'earn', label: 'Earn' },
  { step: 'unlock', label: 'Unlock' },
  { step: 'share', label: 'Share' }
];

export function TopBar() {
  const { state, content } = useStore();
  const { mode, openSettings, settingsOpen } = useInput();
  const { go, section } = useNav();
  const next = nextStep(state, content);
  const playing = !!state.play && !state.play.finished;
  return (
    <header className="topbar">
      <div className="brand" aria-label="Que Movement">
        <span className="brand__q" aria-hidden="true">Q</span>
        <span className="brand__word" aria-hidden="true">ue Movement</span>
      </div>
      <div className="topbar__spacer" />
      <button type="button" className={`guide guide--${next.step} ${section === next.go ? 'is-here' : ''}`} onClick={() => go(next.go)}
        aria-label={`Next step: ${next.text}`} data-a="Go there" title="Learn · Collect · Build · Play · Earn · Unlock · Share">
        <span className="guide__loop" aria-hidden="true">
          {LOOP.map((l) => <span key={l.step} className={`guide__step ${l.step === next.step ? 'is-on' : ''}`}><i />{l.label}</span>)}
        </span>
        <span className="guide__text"><span className="guide__next">Next</span>{next.text}<span aria-hidden="true" className="guide__arrow">→</span></span>
      </button>
      <div className="topbar__spacer" />
      <JourneyButton />
      <div className="hud" aria-label="Progress">
        <div className="hud__item hud__item--points" title={`${state.lifetimePoints} earned in all. Spend points on Techniques.`}>
          <span className="hud__value"><span className="hud__spark" aria-hidden="true">✦</span>{state.points}</span>
          <span className="hud__label">Points</span>
        </div>
        {playing && (
          <div className={`hud__item ${state.streak > 0 ? 'is-hot' : ''}`} title="Streak inside the current Sequence">
            <span className="hud__value">{state.streak}</span>
            <span className="hud__label">Streak</span>
          </div>
        )}
      </div>
      <button type="button" className="settings-btn" aria-haspopup="dialog" aria-expanded={settingsOpen} title="Settings (Esc)" onClick={openSettings}>
        <GearIcon />
        <span>Settings</span>
        {mode === 'pad' && <span className="keycap" aria-hidden="true">☰</span>}
      </button>
    </header>
  );
}

export function Tabs() {
  const { section, go } = useNav();
  const { state, content } = useStore();
  const { mode } = useInput();
  const ready = content.branch.nodes.some((n) => readNode(n, state, content).status === 'ready');
  /** A on the current tab steps into the page, like entering a menu. */
  const enter = () => { if (mode === 'pad') { const page = document.querySelector('.page'); if (page) focusEl(firstIn(page)); } };
  return (
    <nav className="tabs" aria-label="Sections">
      {SECTIONS.map((s, i) => {
        const current = s.id === section;
        const live = s.id === 'play' && !!state.play && !state.play.finished;
        const dot = s.id === 'technique' && ready;
        return (
          <button
            key={s.id}
            type="button"
            data-tab={s.id}
            className={`tab ${current ? 'is-current' : ''}`}
            aria-current={current ? 'page' : undefined}
            aria-keyshortcuts={String(i + 1)}
            onClick={() => (current ? enter() : go(s.id))}
            data-a={current ? `Into ${s.label}` : `Open ${s.label}`}
          >
            <span className="tab__glyph" aria-hidden="true">{s.glyph}</span>
            <span className="tab__label">{s.label}</span>
            {live && <span className="tab__live" title="A Sequence is in progress"><span className="sr-only">in progress</span></span>}
            {dot && !live && <span className="tab__live" title="A Technique is ready to learn"><span className="sr-only">a Technique is ready</span></span>}
          </button>
        );
      })}
    </nav>
  );
}

const Chevron = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

function PadButton({ k, label, cls, children, dim }: { k: PadKey; label: string; cls: string; children: ReactNode; dim?: boolean }) {
  const { press } = useInput();
  return (
    <button type="button" data-sim="" className={`pad-btn ${cls}`} aria-label={label} aria-disabled={dim || undefined} onClick={() => press(k)}>
      {children}
    </button>
  );
}

/** Along the bottom: what every button does right now (controller), or the field-guide footer. */
export function PromptBar() {
  const { mode, prefs, prompts } = useInput();
  if (mode !== 'pad') {
    return (
      <footer className="bar bar--quiet">
        <span>Que Movement</span>
        <span className="bar__moons" aria-hidden="true">☾ · ☽ · ☾ · ☽</span>
        <span>Build your vocabulary. Shape it into something worth performing.</span>
      </footer>
    );
  }
  if (!prefs.prompts) return <footer className="bar bar--quiet" aria-hidden="true" />;
  const p = prompts;
  return (
    <footer className="bar" aria-label="Controller buttons">
      <div className="prompt">
        <div className="dpad">
          <PadButton k="left" label="D-pad left" cls="pad-dir"><Chevron d="M15 5l-7 7 7 7" /></PadButton>
          <PadButton k="up" label="D-pad up" cls="pad-dir"><Chevron d="M5 15l7-7 7 7" /></PadButton>
          <PadButton k="down" label="D-pad down" cls="pad-dir"><Chevron d="M5 9l7 7 7-7" /></PadButton>
          <PadButton k="right" label="D-pad right" cls="pad-dir"><Chevron d="M9 5l7 7-7 7" /></PadButton>
        </div>
        <span className="prompt__label">Move</span>
      </div>
      <div className={`prompt ${p.b ? '' : 'is-dim'}`}><PadButton k="b" label="B button" cls="pad-b">B</PadButton><span className="prompt__label">{p.b ?? 'Back'}</span></div>
      <div className={`prompt ${p.a ? '' : 'is-dim'}`}><PadButton k="a" label="A button" cls="pad-a" dim={!p.a}>A</PadButton><span className="prompt__label prompt__label--wide">{p.a ?? 'Select'}</span></div>
      {p.x && <div className="prompt"><PadButton k="x" label="X button" cls="pad-x">X</PadButton><span className="prompt__label">{p.x}</span></div>}
      {p.y && <div className="prompt"><PadButton k="y" label="Y button" cls="pad-y">Y</PadButton><span className="prompt__label">{p.y}</span></div>}
      <span className="bar__rule" aria-hidden="true" />
      {(p.lt || p.rt) && (
        <div className="prompt">
          <PadButton k="lt" label="Left trigger" cls="pad-shoulder" dim={!p.lt}>LT</PadButton>
          <PadButton k="rt" label="Right trigger" cls="pad-shoulder" dim={!p.rt}>RT</PadButton>
          <span className="prompt__label">{[p.lt, p.rt].filter(Boolean).join(' · ')}</span>
        </div>
      )}
      <div className={`prompt ${p.lb ? '' : 'is-dim'}`}><PadButton k="lb" label="Left bumper" cls="pad-shoulder" dim={!p.lb}>LB</PadButton><span className="prompt__label">{p.lb ?? '—'}</span></div>
      <div className={`prompt ${p.rb ? '' : 'is-dim'}`}><PadButton k="rb" label="Right bumper" cls="pad-shoulder" dim={!p.rb}>RB</PadButton><span className="prompt__label">{p.rb ?? '—'}</span></div>
    </footer>
  );
}

export function Toast() {
  const { toastMsg } = useInput();
  if (!toastMsg) return null;
  return <div key={toastMsg.id} className="toast" role="status">{toastMsg.msg}</div>;
}

export function PortraitGuard() {
  return (
    <div className="portrait-guard" role="alert">
      <div className="portrait-guard__turn">
        <span className="portrait-guard__icon" aria-hidden="true">⟲</span>
        <p className="portrait-guard__title">Turn your tablet sideways</p>
        <p>Que Movement is played in landscape.</p>
      </div>
      <div className="portrait-guard__small">
        <span className="portrait-guard__icon portrait-guard__icon--still" aria-hidden="true">☾</span>
        <p className="portrait-guard__title">Made for a bigger page</p>
        <p>Que Movement is laid out for tablets and computers in landscape. Open it on one of those to play.</p>
      </div>
    </div>
  );
}
