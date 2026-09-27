import type { PointerEvent, ReactNode } from 'react';
import { LEVEL_LABEL, POSITION_LABEL } from '../content/content';
import type { Card, Content } from '../content/types';
import { doseLabel } from '../game/rules';
import { CardArt } from './art/CardArt';

export function tagOf(card: Card): { label: string; cls: string } {
  if (card.kind === 'movement') return { label: LEVEL_LABEL[card.level], cls: `tag--${card.level}` };
  return card.kind === 'transition' ? { label: 'Transition', cls: 'tag--transition' } : { label: 'Progression', cls: 'tag--progression' };
}

export function accentOf(card: Card, content: Content): string | undefined {
  if (card.kind === 'transition') return undefined;
  const path = content.pathById[card.pathId];
  return path ? `var(${path.accentVar})` : undefined;
}

export function familyOf(card: Card, content: Content): string {
  if (card.kind === 'transition') return 'Transition';
  return content.pathById[card.pathId]?.name ?? '';
}

export function metaOf(card: Card): string {
  if (card.kind === 'movement') return `${POSITION_LABEL[card.position]} · ${doseLabel(card.dose)}`;
  if (card.kind === 'transition') return `${POSITION_LABEL[card.from[0]]} → ${POSITION_LABEL[card.to[0]]}`;
  return card.effect;
}

export function Tag({ card, className = '' }: { card: Card; className?: string }) {
  const t = tagOf(card);
  return <span className={`tag ${t.cls} ${className}`}>{t.label}</span>;
}

export function Art({ card, content, dim, live, className }: { card: Card; content: Content; dim?: boolean; live?: boolean; className?: string }) {
  return <CardArt art={card.art} kind={card.kind} accent={accentOf(card, content)} dim={dim} live={live} className={className} />;
}

/** A 2×2 cover made from a Sequence's first cards, like a playlist cover. */
export function Mosaic({ cardIds, content, className = '' }: { cardIds: string[]; content: Content; className?: string }) {
  const cards = cardIds.map((id) => content.cardById[id]).filter(Boolean).slice(0, 4) as Card[];
  return (
    <span className={`mosaic mosaic--${Math.max(1, cards.length)} ${className}`} aria-hidden="true">
      {cards.map((c, i) => <CardArt key={i} art={c.art} kind={c.kind} accent={accentOf(c, content)} />)}
    </span>
  );
}

/** Tilt toward the pointer, with the drawing floating a little above the paper. */
function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
  el.style.setProperty('--px', `${(x * 8).toFixed(1)}px`);
  el.style.setProperty('--py', `${(y * 6).toFixed(1)}px`);
}
function untilt(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  for (const k of ['--rx', '--ry', '--px', '--py']) el.style.removeProperty(k);
}

/** The full Qcard: Play, the details peek, the Technique tree and the reveal. Alive unless told otherwise. */
export function BigCard({ card, content, modifiers = [], footer, locked, glow, compact, still }: {
  card: Card;
  content: Content;
  modifiers?: Card[];
  footer?: ReactNode;
  locked?: boolean;
  glow?: boolean;
  compact?: boolean;
  still?: boolean;
}) {
  return (
    <div className="big-card-wrap" onPointerMove={tilt} onPointerLeave={untilt}>
      <article className={`big-card big-card--${card.kind} ${glow ? 'is-glowing' : ''} ${locked ? 'is-locked' : ''} ${compact ? 'is-compact' : ''}`} style={{ ['--accent' as string]: accentOf(card, content) ?? 'var(--dusty-blue)' }}>
        <span className="big-card__frame" aria-hidden="true" />
        <header className="big-card__head">
          <Tag card={card} />
          <span className="big-card__family"><span className="big-card__q" aria-hidden="true">Q</span>{familyOf(card, content)}</span>
        </header>
        <div className="big-card__art">
          <Art card={card} content={content} dim={locked} live={!still && !locked} />
          {locked && <span className="lock-badge" aria-hidden="true"><LockIcon /></span>}
        </div>
        <h3 className="big-card__name">{card.name}</h3>
        <p className="big-card__cue">{card.shortCue}</p>
        <p className="big-card__goal">{card.movementGoal}</p>
        {modifiers.length > 0 && (
          <ul className="big-card__mods" aria-label="Progressions on this card">
            {modifiers.map((m) => <li key={m.id}><span aria-hidden="true">+</span> {m.name}<em>{m.kind === 'progression' ? m.effect : ''}</em></li>)}
          </ul>
        )}
        {footer && <footer className="big-card__foot">{footer}</footer>}
      </article>
    </div>
  );
}

export function LockIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>;
}

export function cardAria(card: Card): string {
  return `${card.name}, ${tagOf(card).label}, ${metaOf(card)}`;
}
