import type { ReactNode } from 'react';
import { LEVEL_LABEL, POSITION_LABEL } from '../content/content';
import type { Card, Content } from '../content/types';
import { doseLabel } from '../game/rules';
import { CardArt } from './art/CardArt';

export function tagOf(card: Card): { label: string; cls: string } {
  if (card.kind === 'movement') return { label: LEVEL_LABEL[card.level], cls: `tag--${card.level}` };
  return card.kind === 'transition' ? { label: 'Transition', cls: 'tag--transition' } : { label: 'Progression', cls: 'tag--progression' };
}

export function accentOf(card: Card, content: Content): string | undefined {
  if (card.kind !== 'movement') return undefined;
  const deck = content.deckById[card.deckId] ?? content.allDecks.find((d) => d.id === card.deckId);
  return deck ? `var(${deck.accentVar})` : undefined;
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

export function Art({ card, content, dim, className }: { card: Card; content: Content; dim?: boolean; className?: string }) {
  return <CardArt art={card.art} kind={card.kind} deckAccent={accentOf(card, content)} dim={dim} className={className} />;
}

/** A 2×2 cover made from a sequence's first cards, like a playlist cover. */
export function Mosaic({ cardIds, content, className = '' }: { cardIds: string[]; content: Content; className?: string }) {
  const cards = cardIds.map((id) => content.cardById[id]).filter(Boolean).slice(0, 4) as Card[];
  return (
    <span className={`mosaic mosaic--${Math.max(1, cards.length)} ${className}`} aria-hidden="true">
      {cards.map((c, i) => <CardArt key={i} art={c.art} kind={c.kind} deckAccent={accentOf(c, content)} />)}
    </span>
  );
}

/** The full playing card — used in Play, the details peek and the unlock reveal. */
export function BigCard({ card, content, modifiers = [], footer, locked, glow, deckName, compact }: {
  card: Card;
  content: Content;
  modifiers?: Card[];
  footer?: ReactNode;
  locked?: boolean;
  glow?: boolean;
  deckName?: string;
  compact?: boolean;
}) {
  const deck = deckName ?? (card.kind === 'movement' ? (content.deckById[card.deckId] ?? content.allDecks.find((d) => d.id === card.deckId))?.name : tagOf(card).label);
  return (
    <article className={`big-card big-card--${card.kind} ${glow ? 'is-glowing' : ''} ${locked ? 'is-locked' : ''} ${compact ? 'is-compact' : ''}`}>
      <span className="big-card__frame" aria-hidden="true" />
      <header className="big-card__head">
        <Tag card={card} />
        <span className="big-card__deck">{deck}</span>
      </header>
      <div className="big-card__art">
        <Art card={card} content={content} dim={locked} />
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
  );
}

export function LockIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>;
}

export function cardAria(card: Card): string {
  return `${card.name}, ${tagOf(card).label}, ${metaOf(card)}`;
}
