import { useState } from 'react';
import { DECOR } from '../content/studio';
import { decorHint, decorOpen, instructorTitle, pathMastered, sequenceStats, techniquesKnown } from '../game/rules';
import { useStore } from '../game/store';
import type { Card } from '../content/types';
import { useInput, useTriggers } from '../input/InputProvider';
import { LockIcon, Mosaic } from '../ui/Cards';
import { useNav } from '../ui/nav';
import { SkinPicker } from '../ui/SkinPicker';
import { Diorama } from '../ui/studio/Diorama';

const TABS = [['decor', 'Arrange'], ['badges', 'Badges'], ['profile', 'Profile']] as const;
type Tab = typeof TABS[number][0];

/** Studio: your home and your public face. The room grows as you do. */
export function StudioScreen() {
  const { state, content } = useStore();
  const [tab, setTab] = useState<Tab>('decor');
  const ti = TABS.findIndex(([k]) => k === tab);
  useTriggers(true, TABS[ti - 1]?.[1], TABS[ti + 1]?.[1], (d) => setTab(TABS[Math.max(0, Math.min(TABS.length - 1, ti + d))][0]));
  const pinned = state.sequences.find((s) => s.id === state.pinnedSequenceId);
  const known = techniquesKnown(state, content);
  const mastery = content.paths.map((p) => {
    const nodes = content.branch.nodes.filter((n) => n.pathId === p.id);
    return { name: p.name, accent: `var(${p.accentVar})`, pct: nodes.filter((n) => state.ownedCardIds.includes(n.cardId)).length / nodes.length };
  });

  return (
    <div className="screen studio">
      <section className="studio__room" aria-label="Your Studio">
        <div className="studio__sign">
          <p className="eyebrow">{instructorTitle(state, content)} · {known} of {content.branch.nodes.length} Techniques</p>
          <h1 className="page-title">{state.studioName}</h1>
        </div>
        <Diorama decor={state.decor} badges={content.badges} earned={state.badgeIds} studioName={state.studioName} mastery={mastery}
          pinned={pinned ? { name: pinned.name, cards: pinned.slots.map((s) => content.cardById[s.cardId]).filter(Boolean) as Card[] } : null} />
      </section>
      <aside className="studio__panel">
        <div className="subtabs" role="tablist" aria-label="Studio">
          {TABS.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={`subtab ${tab === k ? 'is-on' : ''}`} onClick={() => setTab(k)}>
              {label}{k === 'badges' && <span className="subtab__n">{state.badgeIds.length}</span>}
            </button>
          ))}
        </div>
        <div className="studio__body scroll" role="tabpanel" aria-label={TABS[ti][1]}>
          {tab === 'decor' && <Arrange />}
          {tab === 'badges' && <Badges />}
          {tab === 'profile' && <Profile />}
        </div>
      </aside>
    </div>
  );
}

function Arrange() {
  const { state, dispatch, content } = useStore();
  const { toast } = useInput();
  return (
    <div className="arrange">
      <p className="muted">Everything here is earned by playing: badges, Techniques and points open new pieces.</p>
      {DECOR.map((slot) => (
        <section key={slot.slot} className="arrange__slot" aria-label={slot.label}>
          <h3 className="arrange__label">{slot.label}</h3>
          <div className="arrange__opts" role="radiogroup" aria-label={slot.label}>
            {slot.variants.map((v) => {
              const open = decorOpen(v.unlock, state, content);
              const on = state.decor[slot.slot] === v.id;
              return (
                <button key={v.id} type="button" role="radio" aria-checked={on} aria-disabled={!open || undefined}
                  className={`chip ${on ? 'is-on' : ''} ${open ? '' : 'is-locked'}`} title={open ? v.name : decorHint(v.unlock, content)}
                  onClick={() => (open ? dispatch({ type: 'studio/decor', slot: slot.slot, variant: v.id }) : toast(`${v.name}: ${decorHint(v.unlock, content)}.`))}
                  data-a={open ? `Use ${v.name}` : 'How to earn it'}>
                  {!open && <LockIcon />}{on && <span aria-hidden="true">✓</span>}{v.name}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Badges() {
  const { state, content } = useStore();
  return (
    <div className="badges badges--list">
      {content.badges.map((b) => {
        const has = state.badgeIds.includes(b.id);
        const m = content.milestones.find((x) => x.reward.badgeId === b.id);
        return (
          <div key={b.id} className={`badge ${has ? 'is-earned' : ''}`} tabIndex={0} aria-label={`${b.name}, ${has ? 'earned' : 'not yet'}. ${has ? b.description : m?.description}`}>
            <span className={`medal ${has ? 'is-done' : ''}`} aria-hidden="true">{b.glyph}</span>
            <span className="badge__name">{b.name}</span>
            <span className="badge__desc">{has ? b.description : m?.description}</span>
            {has && <span className="badge__earned">On your shelf</span>}
          </div>
        );
      })}
    </div>
  );
}

function Profile() {
  const { state, dispatch, content } = useStore();
  const { go } = useNav();
  const mine = state.sequences.filter((s) => !s.seeded);
  const pinned = mine.find((s) => s.id === state.pinnedSequenceId);
  const performed = mine.reduce((a, s) => a + s.analytics.completedPlays, 0);
  const tiles: [string, string][] = [
    ['Techniques', `${techniquesKnown(state, content)} / ${content.branch.nodes.length}`],
    ['Sequences', `${mine.length}`],
    ['Performed', `${performed}×`],
    ['Points earned', `${state.lifetimePoints}`]
  ];
  return (
    <div className="profile">
      <label className="field">
        <span className="field__label">Studio name</span>
        <input className="field__input" value={state.studioName} maxLength={32} onChange={(e) => dispatch({ type: 'studio/name', name: e.target.value })} />
      </label>
      <div className="stat-tiles stat-tiles--2">
        {tiles.map(([k, v]) => <div key={k} className="stat-tile"><span className="stat-tile__k">{k}</span><span className="stat-tile__v">{v}</span></div>)}
      </div>
      <section>
        <h3 className="arrange__label">Path mastery</h3>
        <ul className="mastery">
          {content.paths.map((p) => {
            const nodes = content.branch.nodes.filter((n) => n.pathId === p.id);
            const k = nodes.filter((n) => state.ownedCardIds.includes(n.cardId)).length;
            return (
              <li key={p.id} style={{ ['--accent' as string]: `var(${p.accentVar})` }}>
                <span>{p.name}{pathMastered(p.id, state, content) && <em> · mastered</em>}</span>
                <span className="meter" aria-hidden="true"><span style={{ width: `${(k / nodes.length) * 100}%` }} /></span>
                <small>{k}/{nodes.length}</small>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h3 className="arrange__label">On the class board</h3>
        {pinned ? (
          <div className="pinned">
            <Mosaic cardIds={pinned.slots.map((s) => s.cardId)} content={content} className="pinned__art" />
            <div><strong>{pinned.name}</strong><small>{sequenceStats(pinned.slots, content).durationLabel}</small></div>
            <button type="button" className="btn btn--primary btn--small" onClick={() => dispatch({ type: 'play/start', sequenceId: pinned.id })}>▶ Perform</button>
          </div>
        ) : mine.length ? (
          <div className="arrange__opts">
            {mine.slice(0, 6).map((s) => <button key={s.id} type="button" className="chip" onClick={() => dispatch({ type: 'sequence/pin', sequenceId: s.id })}>Pin {s.name}</button>)}
          </div>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={() => go('repertoire')}>Build a Sequence to pin →</button>
        )}
        {pinned && <button type="button" className="btn btn--ghost btn--small" onClick={() => dispatch({ type: 'sequence/pin', sequenceId: null })}>Unpin</button>}
      </section>
      <section>
        <h3 className="arrange__label">Studio palette</h3>
        <SkinPicker />
      </section>
    </div>
  );
}
