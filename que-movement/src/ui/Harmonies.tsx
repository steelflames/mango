import { useState } from 'react';
import { classArc, readHarmonies, type HarmonyReading } from '../game/harmonies';
import { useStore } from '../game/store';
import type { Slot } from '../game/types';
import { useOverlays } from './Overlays';

/** The class arc: effort across the Sequence, like a deck's curve or a song's waveform. */
export function ClassArc({ slots, className = '' }: { slots: Slot[]; className?: string }) {
  const { content } = useStore();
  const arc = classArc(slots, content);
  if (!arc.length) return <div className={`arc arc--empty ${className}`} aria-hidden="true"><span>The class arc draws itself as you add cards</span></div>;
  const W = 280, H = 46, pad = 6;
  const step = (W - pad * 2) / Math.max(arc.length, 1);
  const bw = Math.min(18, step * 0.62);
  const y = (i: number) => H - 4 - (i / 5) * (H - 12);
  const moves = arc.map((a, i) => ({ ...a, x: pad + step * (i + 0.5) })).filter((a) => a.kind === 'movement');
  const line = moves.map((m, i) => `${i ? 'L' : 'M'}${m.x.toFixed(1)} ${y(m.intensity).toFixed(1)}`).join(' ');
  const peak = Math.max(...arc.map((a) => a.intensity));
  return (
    <svg className={`arc ${className}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img"
      aria-label={`Class arc: ${arc.filter((a) => a.kind === 'movement').map((a) => a.intensity).join(', ')} out of 5`}>
      <line x1={pad} x2={W - pad} y1={H - 4} y2={H - 4} className="arc__floor" />
      {arc.map((a, i) => {
        const x = pad + step * (i + 0.5);
        if (a.kind !== 'movement') return <rect key={i} x={x - 2.5} y={H - 9} width="5" height="5" transform={`rotate(45 ${x} ${H - 6.5})`} className="arc__seam" />;
        return <rect key={i} x={x - bw / 2} y={y(a.intensity)} width={bw} height={H - 4 - y(a.intensity)} rx="3" className={`arc__bar ${a.intensity === peak ? 'is-peak' : ''}`} style={{ fill: `var(${content.pathById[a.pathId ?? '']?.accentVar ?? '--sage'})` }} />;
      })}
      {moves.length > 1 && <path d={line} className="arc__line" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/** Seven glyphs: lit when the teachers would nod, outlined when there's a note, faint when it doesn't apply yet. */
export function HarmonyRow({ slots, readings: given }: { slots: Slot[]; readings?: HarmonyReading[] }) {
  const { state, content } = useStore();
  const { openSheet } = useOverlays();
  const readings = given ?? readHarmonies(slots, content, state.ownedCardIds);
  const met = readings.filter((r) => r.status === 'met').length;
  return (
    <button type="button" className="hrow" onClick={() => openSheet({ eyebrow: 'The Pilates Council', title: 'Harmonies', body: <HarmonySheet slots={slots} /> })}
      aria-label={`${met} of ${readings.length} Harmonies. Open the teachers’ notes`} data-a="Teachers’ notes">
      {readings.map((r) => <span key={r.def.id} className={`hrow__glyph is-${r.status}`} title={`${r.def.name}${r.status === 'met' ? ' ✓' : ''}`} aria-hidden="true">{r.def.glyph}</span>)}
      <span className="hrow__count">{met}<small>/7</small></span>
    </button>
  );
}

/** One note from the teachers, the one worth the most, with a way to hear the next. */
export function TeacherNote({ slots }: { slots: Slot[] }) {
  const { state, content } = useStore();
  const [k, setK] = useState(0);
  const open = readHarmonies(slots, content, state.ownedCardIds).filter((r) => r.status === 'open' && r.hint).sort((a, b) => b.def.points - a.def.points);
  if (!slots.length) return null;
  if (!open.length) {
    const idle = readHarmonies(slots, content, state.ownedCardIds).filter((r) => r.status === 'idle').length;
    return <p className="tnote tnote--sings"><span className="tnote__who">The Council</span>{idle ? `No notes. ${idle === 1 ? 'One more Harmony opens' : `${idle} more Harmonies open`} as your Sequences grow.` : 'This one sings. Every note they’d give, you’ve taken.'}</p>;
  }
  const r = open[k % open.length];
  return (
    <p className="tnote">
      <span className="tnote__who">Teacher’s note · {r.def.name} <em>+{r.def.points}</em></span>
      {r.hint}
      {open.length > 1 && <button type="button" className="tnote__next" onClick={() => setK(k + 1)} aria-label="Another note" data-a="Another note">↻</button>}
    </p>
  );
}

export function HarmonySheet({ slots }: { slots: Slot[] }) {
  const { state, content } = useStore();
  const readings = readHarmonies(slots, content, state.ownedCardIds);
  return (
    <div className="hsheet">
      <p className="muted">Seven principles from the Council’s decades of teaching. Every one met pays out when you perform the Sequence all the way through.</p>
      <ClassArc slots={slots} className="arc--big" />
      <ul className="hsheet__list">
        {readings.map((r) => (
          <li key={r.def.id} className={`is-${r.status}`}>
            <span className="hsheet__glyph" aria-hidden="true">{r.def.glyph}</span>
            <span className="hsheet__text">
              <strong>{r.def.name} <em>+{r.def.points}</em></strong>
              <q>{r.def.says}</q>
              <span className="hsheet__state">{r.status === 'met' ? 'In this Sequence' : r.hint ?? 'Not yet'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

