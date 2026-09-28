import { useEffect, useRef, useState } from 'react';
import { CREATORS, MOODS, VISITOR_LINES, VISITOR_NAMES, VISITS_PER_DAY } from '../content/community';
import { todayKey } from '../content/progress';
import { DECOR } from '../content/studio';
import type { Card } from '../content/types';
import { readHarmonies } from '../game/harmonies';
import { decorHint, decorOpen, instructorTitle, pathMastered, rankOf, sequenceStats, teacherStanding, techniquesKnown } from '../game/rules';
import { useStore } from '../game/store';
import { useInput, usePrimary, useTriggers } from '../input/InputProvider';
import { LockIcon, Mosaic } from '../ui/Cards';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';
import { SkinPicker } from '../ui/SkinPicker';
import { sfx } from '../ui/sound';
import { Diorama, type Visitor } from '../ui/studio/Diorama';

const TABS = [['profile', 'Profile'], ['decor', 'Arrange'], ['guestbook', 'Guestbook'], ['badges', 'Badges']] as const;
type Tab = typeof TABS[number][0];

const COATS = ['#7C4B6C', '#4E6A94', '#2E5A4E', '#C27B57', '#8FAA93', '#B48A3E'];
const HAIRS = ['#2B2233', '#6B4A32', '#C9A46A', '#8E3B2E', '#D9D2C5', '#3E2C22'];
const SKINS = ['#F2D6BF', '#E3B894', '#C68E66', '#8D5A3B', '#F5E0CF', '#A86E4A'];
const TOTES = ['#E8D8B8', '#F2C97A', '#D9A0A0', '#B7C9B5'];
const VISIT_MS = 13000;

/** Studio: your page (MySpace) and your shop (Moonlighter). Open for the evening and the market visits. */
export function StudioScreen() {
  const { state, dispatch, content } = useStore();
  const { toast } = useInput();
  const [tab, setTab] = useState<Tab>('profile');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [open, setOpen] = useState(false);
  const timers = useRef<number[]>([]);
  const ti = TABS.findIndex(([k]) => k === tab);
  useTriggers(true, TABS[ti - 1]?.[1], TABS[ti + 1]?.[1], (d) => setTab(TABS[Math.max(0, Math.min(TABS.length - 1, ti + d))][0]));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const pinned = state.sequences.find((s) => s.id === state.pinnedSequenceId);
  const known = techniquesKnown(state, content);
  const mastery = content.paths.map((p) => {
    const nodes = content.branch.nodes.filter((n) => n.pathId === p.id);
    return { name: p.name, accent: `var(${p.accentVar})`, pct: nodes.filter((n) => state.ownedCardIds.includes(n.cardId)).length / nodes.length };
  });
  const mood = MOODS.find((m) => m.id === state.profile.mood) ?? MOODS[0];
  const visitsLeft = state.studioHours.day === todayKey() ? Math.max(0, VISITS_PER_DAY - state.studioHours.visits) : VISITS_PER_DAY;
  const night = state.themeId !== 'watercolor-botanical';

  const openUp = () => {
    if (open) return;
    setOpen(true);
    const met = pinned ? readHarmonies(pinned.slots, content, state.ownedCardIds).filter((r) => r.status === 'met').map((r) => r.def.id) : [];
    const pool = met.length ? met : ['none'];
    const seed = Date.now();
    const guests = [0, 1, 2].map((i) => {
      const k = Math.floor(Math.random() * 997) + i * 7;
      const key = pool[k % pool.length];
      const lines = VISITOR_LINES[key] ?? VISITOR_LINES.none;
      const creator = CREATORS[(k + i) % CREATORS.length];
      const name = i === 1 ? creator.name : VISITOR_NAMES[k % VISITOR_NAMES.length];
      const studio = i === 1 ? creator.studio : CREATORS[(k + 3) % CREATORS.length].studio;
      const v: Visitor = { id: `${seed}-${i}`, jitter: (i * 0.37 + (k % 5) * 0.11) % 1, coat: COATS[k % COATS.length], hair: HAIRS[(k + i) % HAIRS.length], skin: SKINS[(k * 3 + i) % SKINS.length], tote: TOTES[k % TOTES.length], says: pinned ? lines[k % lines.length] : 'Nothing on the board yet. Pin a Sequence!' };
      return { v, name, studio };
    });
    guests.forEach(({ v, name, studio }, i) => {
      const start = i * 4200;
      timers.current.push(window.setTimeout(() => { setVisitors((vs) => [...vs, v]); sfx.bell(); }, start));
      timers.current.push(window.setTimeout(() => {
        if (pinned) dispatch({ type: 'studio/visit', from: name, studio, text: v.says });
      }, start + VISIT_MS * 0.35));
      timers.current.push(window.setTimeout(() => setVisitors((vs) => vs.filter((x) => x.id !== v.id)), start + VISIT_MS));
    });
    timers.current.push(window.setTimeout(() => { setOpen(false); toast(pinned ? 'The evening’s visitors have gone home. Their notes are in your Guestbook.' : 'Pin a Sequence to your class board so visitors have something to try.'); }, 2 * 4200 + VISIT_MS));
  };
  usePrimary(!open, 'Open for the evening', openUp);

  return (
    <div className="screen studio">
      <section className={`studio__room ${night ? 'is-night' : ''}`} aria-label="Your Studio">
        <div className="studio__sign">
          <p className="eyebrow">{instructorTitle(state, content)} · Rank {rankOf(state.lifetimePoints).rank} · {known} of {content.branch.nodes.length} Techniques</p>
          <h1 className="page-title">{state.studioName}</h1>
          <p className="studio__mood">Mood: <span aria-hidden="true">{mood.glyph}</span> {mood.label}</p>
        </div>
        <Diorama decor={state.decor} badges={content.badges} earned={state.badgeIds} studioName={state.studioName} mastery={mastery} night={night} open={open} visitors={visitors}
          pinned={pinned ? { name: pinned.name, cards: pinned.slots.map((s) => content.cardById[s.cardId]).filter(Boolean) as Card[] } : null} />
        <div className="studio__counter">
          <span className="studio__kudos" title="Kudos from visitors: your standing as a teacher"><span aria-hidden="true">✿</span> {state.kudos} kudos</span>
          <span className="studio__left">{visitsLeft ? `${visitsLeft} visitor${visitsLeft === 1 ? '' : 's'} with notes left tonight` : 'Tonight’s notes are in. Visitors still welcome.'}</span>
          <button type="button" className="btn btn--primary" onClick={openUp} aria-disabled={open || undefined}>{open ? 'Open…' : pinned ? 'Open for the evening' : 'Open anyway'}</button>
        </div>
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
          {tab === 'guestbook' && <Guestbook />}
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
      <p className="muted">Everything here is earned by playing: Practice Rank, badges and Techniques open new pieces.</p>
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
      <section>
        <h3 className="arrange__label">Market palette</h3>
        <SkinPicker />
      </section>
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
  const { openSheet } = useOverlays();
  const mine = state.sequences.filter((s) => !s.seeded);
  const pinned = mine.find((s) => s.id === state.pinnedSequenceId);
  const rank = rankOf(state.lifetimePoints);
  const teacher = teacherStanding(state);
  const top8 = state.profile.top8.map((id) => CREATORS.find((c) => c.id === id)).filter(Boolean) as typeof CREATORS;
  return (
    <div className="profile">
      <label className="field">
        <span className="field__label">Studio name</span>
        <input className="field__input" value={state.studioName} maxLength={32} onChange={(e) => dispatch({ type: 'studio/name', name: e.target.value })} />
      </label>
      <section>
        <h3 className="arrange__label">Mood</h3>
        <div className="arrange__opts" role="radiogroup" aria-label="Mood">
          {MOODS.map((m) => <button key={m.id} type="button" role="radio" aria-checked={state.profile.mood === m.id} className={`chip ${state.profile.mood === m.id ? 'is-on' : ''}`} onClick={() => dispatch({ type: 'profile/mood', mood: m.id })}><span aria-hidden="true">{m.glyph}</span>{m.label}</button>)}
        </div>
      </section>
      <label className="field">
        <span className="field__label">About me</span>
        <textarea className="field__input field__input--area" value={state.profile.bio} maxLength={220} rows={3} placeholder="Who you teach, what you love, the cue you can’t stop saying…" onChange={(e) => dispatch({ type: 'profile/bio', bio: e.target.value })} />
      </label>
      <section>
        <h3 className="arrange__label">Now performing</h3>
        {pinned ? (
          <div className="pinned">
            <Mosaic cardIds={pinned.slots.map((s) => s.cardId)} content={content} className="pinned__art" />
            <div><strong>{pinned.name}</strong><small>{sequenceStats(pinned.slots, content).durationLabel} · on your class board</small></div>
            <button type="button" className="btn btn--primary btn--small" onClick={() => dispatch({ type: 'play/start', sequenceId: pinned.id })}>▶</button>
          </div>
        ) : null}
        {mine.length ? (
          <div className="arrange__opts">
            {mine.filter((s) => s.id !== pinned?.id).slice(0, 5).map((s) => <button key={s.id} type="button" className="chip" onClick={() => dispatch({ type: 'sequence/pin', sequenceId: s.id })}>Pin {s.name}</button>)}
          </div>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={() => go('repertoire')}>Build a Sequence to pin →</button>
        )}
      </section>
      <section>
        <h3 className="arrange__label">Top 8</h3>
        <div className="top8">
          {Array.from({ length: 8 }, (_, i) => {
            const c = top8[i];
            return c ? (
              <button key={c.id} type="button" className="top8__slot" onClick={() => openSheet({ eyebrow: 'Your Top 8', title: 'Movers you love', body: <TopEight /> })} aria-label={`${c.name}, ${c.studio}`} data-a="Edit Top 8">
                <span className="avatar" style={{ background: `var(${c.hue})` }} aria-hidden="true">{c.name.slice(0, 1)}</span>
                <span className="top8__name">{c.name}</span>
              </button>
            ) : (
              <button key={`e${i}`} type="button" className="top8__slot is-empty" onClick={() => openSheet({ eyebrow: 'Your Top 8', title: 'Movers you love', body: <TopEight /> })} aria-label="Add to your Top 8" data-a="Add a mover">+</button>
            );
          })}
        </div>
      </section>
      <section>
        <h3 className="arrange__label">Two ways to grow</h3>
        <ul className="mastery tracks">
          <li style={{ ['--accent' as string]: 'var(--gold)' }}>
            <span>Student<em> · Rank {rank.rank}</em></span>
            <span className="meter" aria-hidden="true"><span style={{ width: `${rank.pct * 100}%` }} /></span>
            <small>{techniquesKnown(state, content)}/{content.branch.nodes.length}</small>
          </li>
          <li style={{ ['--accent' as string]: 'var(--forest)' }}>
            <span>Teacher<em> · {teacher.title}</em></span>
            <span className="meter" aria-hidden="true"><span style={{ width: `${teacher.pct * 100}%` }} /></span>
            <small>{teacher.score}</small>
          </li>
        </ul>
        <p className="muted tracks__note">Learning raises your Rank. Sharing raises your standing: kudos from visitors, saves on what you share, plans sent to clients.</p>
      </section>
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
    </div>
  );
}

function TopEight() {
  const { state, dispatch } = useStore();
  const top = state.profile.top8;
  return (
    <div className="top8-pick">
      <p className="muted">Up to eight movers whose work you love. They show on your Studio page, and their new Sequences come first in your Queue.</p>
      <ul>
        {CREATORS.map((c) => {
          const on = top.includes(c.id);
          return (
            <li key={c.id}>
              <span className="avatar" style={{ background: `var(${c.hue})` }} aria-hidden="true">{c.name.slice(0, 1)}</span>
              <span><strong>{c.name}</strong><small>{c.studio} · {c.specialty}</small></span>
              <button type="button" className={`btn btn--small ${on ? 'btn--primary' : 'btn--ghost'}`} aria-pressed={on} aria-disabled={!on && top.length >= 8 || undefined}
                onClick={() => dispatch({ type: 'profile/top8', creatorId: c.id })}>{on ? `#${top.indexOf(c.id) + 1}` : 'Add'}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ago(t: number) {
  if (!t) return 'when you opened';
  const m = Math.max(0, (Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${Math.round(m)} min ago`;
  const h = m / 60;
  return h < 24 ? `${Math.round(h)} h ago` : `${Math.round(h / 24)} d ago`;
}

function Guestbook() {
  const { state } = useStore();
  return (
    <div className="guestbook">
      <p className="muted">Notes from visitors to your Studio. Pin a Sequence to your class board, open for the evening, and they’ll tell you what they thought.</p>
      <ul>
        {state.guestbook.map((g) => {
          const c = CREATORS.find((x) => x.name === g.from);
          return (
            <li key={g.id}>
              <span className="avatar" style={{ background: c ? `var(${c.hue})` : 'var(--sage)' }} aria-hidden="true">{g.from.slice(0, 1)}</span>
              <div>
                <p className="guestbook__who"><strong>{g.from}</strong> · {g.studio} · <span>{ago(g.at)}</span></p>
                <p className="guestbook__text">{g.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
