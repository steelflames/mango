import { memo, useId } from 'react';
import type { Card } from '../../content/types';
import { SHAPES } from './shapes';

const FALLBACK: Record<Card['kind'], string> = { movement: 'bridge-foundation', transition: 'transition-roll', progression: 'progression-tempo' };

/** The wash behind each drawing picks up its deck's colour, so decks read at a glance. */
function washFor(card: Pick<Card, 'kind'> & { deckAccent?: string }) {
  if (card.deckAccent) return card.deckAccent;
  if (card.kind === 'transition') return 'var(--dusty-blue)';
  if (card.kind === 'progression') return 'var(--aubergine)';
  return 'var(--sage)';
}

interface Props {
  art: string;
  kind: Card['kind'];
  deckAccent?: string;
  className?: string;
  dim?: boolean;
}

/** A card's line drawing over a soft watercolour wash. Themes recolour it automatically. */
export const CardArt = memo(function CardArt({ art, kind, deckAccent, className = '', dim }: Props) {
  const shapes = SHAPES[art] ?? SHAPES[FALLBACK[kind]];
  const id = `wash${useId().replace(/:/g, '')}`;
  const tint = washFor({ kind, deckAccent });
  return (
    <svg className={`card-art ${dim ? 'is-dim' : ''} ${className}`} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <g className="card-art__wash" filter={`url(#${id})`}>
        <ellipse cx="52" cy="42" rx="38" ry="26" fill="var(--wash-a)" />
        <ellipse cx="104" cy="58" rx="42" ry="28" style={{ fill: `color-mix(in srgb, ${tint} 32%, transparent)` }} />
        <ellipse cx="80" cy="78" rx="46" ry="16" fill="var(--wash-c)" />
      </g>
      <g className="card-art__ink" fill="none" stroke="var(--ink)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        {shapes.map((s, i) => {
          const p: Record<string, string | number> = { ...s.a, vectorEffect: 'non-scaling-stroke' };
          if (s.soft) { p.strokeWidth = 1.2; p.opacity = 0.75; }
          const Tag = s.t;
          return <Tag key={i} {...p} />;
        })}
      </g>
    </svg>
  );
});
