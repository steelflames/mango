import { useState } from 'react';
import { RULES } from '../content/catalog';
import { averageCompletion, sequenceStats } from '../game/rules';
import { useStore } from '../game/store';
import { MY_BUILDS, type Sequence } from '../game/types';
import { useInput, useTriggers } from '../input/InputProvider';
import { Mosaic } from '../ui/Cards';
import { useNav } from '../ui/nav';
import { useOverlays } from '../ui/Overlays';
import { SkinPicker } from '../ui/SkinPicker';
import { MoreIcon } from './builder/Library';
import { useLoadSequence, useSequenceMenu } from './builder/Sidebar';

const TABS = [['progress', 'Progress'], ['builds', 'My builds'], ['packs', 'Packs & skins']] as const;
type Tab = typeof TABS[number][0];

/** My Studio: your progress, badges, saved builds, packs and skins. */
export function StudioScreen() {
  const [tab, setTab] = useState<Tab>('progress');
  const ti = TABS.findIndex(([k]) => k === tab);
  useTriggers(true, TABS[ti - 1]?.[1], TABS[ti + 1]?.[1], (d) => setTab(TABS[Math.max(0, Math.min(TABS.length - 1, ti + d))][0]));
  return (
    <div className="screen studio">
      <header className="page-head">
        <div>
          <p className="eyebrow">Your field guide</p>
          <h1 className="page-title">My Studio</h1>
        </div>
        <div className="subtabs" role="tablist" aria-label="My Studio">
          {TABS.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={`subtab ${tab === k ? 'is-on' : ''}`} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
      </header>
      <div className="studio__body scroll" role="tabpanel" aria-label={TABS[ti][1]}>
        {tab === 'progress' && <Progress />}
        {tab === 'builds' && <Builds />}
        {tab === 'packs' && <Packs />}
      </div>
    </div>
  );
}

function Progress() {
  const { state, content } = useStore();
  const pct = (state.countedPoints / RULES.pointCap) * 100;
  const open = content.movementCards.filter((c) => state.unlockedCardIds.includes(c.id)).length;
  const practised = Object.keys(state.completedCounts).filter((id) => content.cardById[id]).length;
  const tiles: [string, string, string][] = [
    ['Cards open', `${open}`, `of ${content.movementCards.length}`],
    ['Cards practised', `${practised}`, `of ${content.cards.length}`],
    ['Challenges', `${state.completedChallengeIds.filter((id) => content.challenges.some((c) => c.id === id)).length}`, `of ${content.challenges.length}`],
    ['Builds saved', `${state.sequences.filter((s) => !s.seeded).length}`, 'on this device']
  ];
  return (
    <div className="progress">
      <section className="points-card">
        <p className="eyebrow">Points counting toward progression</p>
        <p className="points-card__num"><strong>{state.countedPoints}</strong> / {RULES.pointCap}</p>
        <span className="meter meter--big" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
        <p className="muted">{state.totalPoints > RULES.pointCap
          ? `You’ve earned ${state.totalPoints} in all. Past ${RULES.pointCap}, points are just for joy — nothing more to unlock with them.`
          : 'Points come from completing cards, streaks inside a sequence and challenges. They never expire.'}</p>
      </section>
      <div className="stat-tiles">
        {tiles.map(([k, v, sub]) => <div key={k} className="stat-tile"><span className="stat-tile__k">{k}</span><span className="stat-tile__v">{v}</span><span className="stat-tile__sub">{sub}</span></div>)}
      </div>
      <section aria-label="Badges">
        <h2 className="section-title">Badges</h2>
        <div className="badges">
          {content.badges.map((b) => {
            const has = state.badgeIds.includes(b.id);
            return (
              <div key={b.id} className={`badge ${has ? 'is-earned' : ''}`} tabIndex={0} aria-label={`${b.name}, ${has ? 'earned' : 'not yet'}. ${b.description}`}>
                <span className="medal" aria-hidden="true">{b.glyph}</span>
                <span className="badge__name">{b.name}</span>
                <span className="badge__desc">{b.description}</span>
                {has && <span className="badge__earned">Earned</span>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Builds() {
  const { state, content } = useStore();
  const { go } = useNav();
  const menu = useSequenceMenu();
  const load = useLoadSequence();
  const mine = state.sequences.filter((s) => !s.seeded).sort((a, b) => b.updatedAt - a.updatedAt);
  const folderOf = (s: Sequence) => state.folders.find((f) => f.id !== MY_BUILDS && f.sequenceIds.includes(s.id))?.name ?? 'My builds';
  if (!mine.length) {
    return (
      <div className="empty empty--big">
        <p className="empty__title">No saved builds yet</p>
        <p className="muted">Saving any build completes your first challenge.</p>
        <button type="button" className="btn btn--primary" data-autofocus="" onClick={() => go('builder')}>Open the Builder</button>
      </div>
    );
  }
  return (
    <ul className="build-list">
      {mine.map((s) => {
        const st = sequenceStats(s.slots, content);
        return (
          <li key={s.id} className="build-row" data-x={`bm-${s.id}`} data-x-label="Build options">
            <Mosaic cardIds={s.slots.map((x) => x.cardId)} content={content} className="build-row__art" />
            <div className="build-row__text">
              <p className="build-row__name">{s.name}{s.published && <span className="pill">Published</span>}</p>
              <p className="build-row__meta">{folderOf(s)} · {st.totalCards} cards · {st.durationLabel} · played {s.analytics.plays}× {s.analytics.completionPercents.length ? `· ${averageCompletion(s)}% average finish` : ''}</p>
            </div>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => void load(s)}>Load</button>
            <PlayButton seq={s} />
            <button type="button" id={`bm-${s.id}`} className="more-btn" aria-label={`Options for ${s.name}`} aria-haspopup="menu" onClick={(e) => menu(e.currentTarget, s)}><MoreIcon /></button>
          </li>
        );
      })}
    </ul>
  );
}

function PlayButton({ seq }: { seq: Sequence }) {
  const { dispatch } = useStore();
  return <button type="button" className="btn btn--primary btn--small" onClick={() => dispatch({ type: 'play/start', sequenceId: seq.id })} aria-label={`Play ${seq.name}`}><span aria-hidden="true">▶</span> Play</button>;
}

function Packs() {
  const { state, dispatch, content } = useStore();
  const { confirm } = useOverlays();
  const { toast } = useInput();
  return (
    <div className="packs">
      <section>
        <h2 className="section-title">Expansion packs</h2>
        <p className="muted section-sub">Packs add decks, cards, challenges and skins. The screens stay the same — everything new slots into the library.</p>
        <ul className="pack-list">
          {content.expansions.map((p) => {
            const on = state.installedPackIds.includes(p.id);
            const core = p.id === 'core';
            return (
              <li key={p.id} className={`pack ${on ? 'is-on' : ''} ${p.available ? '' : 'is-later'}`}>
                <div className="pack__text">
                  <p className="pack__name">{p.name}</p>
                  <p className="pack__desc">{p.description}</p>
                </div>
                {core ? <span className="pill">Always on</span>
                  : !p.available ? <span className="pill pill--quiet">Later</span>
                    : on ? (
                      <button type="button" className="btn btn--ghost btn--small" onClick={async () => {
                        if (await confirm({ title: `Remove ${p.name}?`, body: 'Its cards leave the library and your build in progress. Your points, badges and saved builds stay.', confirm: 'Remove pack', danger: true })) {
                          dispatch({ type: 'pack/uninstall', packId: p.id });
                          toast(`${p.name} removed.`);
                        }
                      }}>Remove</button>
                    ) : (
                      <button type="button" className="btn btn--primary btn--small" onClick={() => { dispatch({ type: 'pack/install', packId: p.id }); toast(`${p.name} added. Its decks are in the library.`); }}>Add pack</button>
                    )}
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h2 className="section-title">Seasonal skins</h2>
        <p className="muted section-sub">Cosmetic only. A skin never changes an exercise, its level, or how anything unlocks.</p>
        <SkinPicker />
      </section>
    </div>
  );
}
