import { memo, useId, useSyncExternalStore } from 'react';
import type { Card } from '../../content/types';
import { ART, type Shape } from './shapes';

const FALLBACK: Record<Card['kind'], string> = { movement: 'bridge', transition: 'transition-roll', progression: 'progression-tempo' };

/** The wash behind each drawing picks up its path's colour, so paths read at a glance. */
function washFor(kind: Card['kind'], accent?: string) {
  if (accent) return accent;
  if (kind === 'transition') return 'var(--dusty-blue)';
  if (kind === 'progression') return 'var(--aubergine)';
  return 'var(--sage)';
}

// Live art respects Settings › Motion and the device's reduced-motion setting.
const reduceQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
function subscribe(cb: () => void) {
  reduceQuery?.addEventListener('change', cb);
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => { reduceQuery?.removeEventListener('change', cb); mo.disconnect(); };
}
function motionOk() {
  const pref = document.documentElement.dataset.motion;
  if (pref === 'reduce') return false;
  if (pref === 'full') return true;
  return !reduceQuery?.matches;
}
export function useMotionOk() {
  return useSyncExternalStore(subscribe, motionOk, () => false);
}

const EASE = '0.45 0 0.55 1;0.45 0 0.55 1';

function Pose({ shape, dur, live }: { shape: Shape; dur: number; live: boolean }) {
  const p: Record<string, string | number> = { ...shape.a, vectorEffect: 'non-scaling-stroke' };
  if (shape.soft) { p.strokeWidth = 1.2; p.opacity = 0.75; }
  const cls = shape.flow && live ? 'is-flow' : undefined;
  const anims = live && shape.b
    ? Object.entries(shape.b).map(([k, v]) => (
      <animate key={k} attributeName={k} values={`${shape.a[k]};${v};${shape.a[k]}`} keyTimes="0;0.5;1" calcMode="spline" keySplines={EASE} dur={`${dur}s`} repeatCount="indefinite" />
    ))
    : null;
  const spin = live && shape.spin
    ? <animateTransform attributeName="transform" type="rotate" from={`0 ${shape.spin[0]} ${shape.spin[1]}`} to={`360 ${shape.spin[0]} ${shape.spin[1]}`} dur={`${dur}s`} repeatCount="indefinite" />
    : null;
  return shape.t === 'circle'
    ? <circle {...p} className={cls}>{anims}{spin}</circle>
    : <path {...p} className={cls}>{anims}{spin}</path>;
}

interface Props {
  art: string;
  kind: Card['kind'];
  accent?: string;
  className?: string;
  dim?: boolean;
  /** Breathe between the two poses, drift the wash, run the pathways. */
  live?: boolean;
}

/** A Qcard's line drawing over a soft watercolour wash. Themes recolour it automatically. */
export const CardArt = memo(function CardArt({ art, kind, accent, className = '', dim, live = false }: Props) {
  const def = ART[art] ?? ART[FALLBACK[kind]];
  const id = `wash${useId().replace(/:/g, '')}`;
  const motion = useMotionOk();
  const on = live && motion;
  const tint = washFor(kind, accent);
  return (
    <svg className={`card-art ${dim ? 'is-dim' : ''} ${on ? 'is-live' : ''} ${className}`} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
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
        {def.shapes.map((s, i) => <Pose key={`${art}${i}`} shape={s} dur={def.dur} live={on} />)}
      </g>
    </svg>
  );
});
