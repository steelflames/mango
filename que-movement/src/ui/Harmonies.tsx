import { classArc, readHarmonies, type HarmonyReading } from '../game/harmonies';
import { useStore } from '../game/store';
import type { Slot } from '../game/types';
import { useOverlays } from './Overlays';

const LEVELS = ['', 'Easy', 'Easy', 'Steady', 'Strong', 'Peak'];
/** Guide lines sit at the effort they name, so a bar touching one reads true. */
const GUIDES: [number, string][] = [[1, 'Easy'], [3, 'Steady'], [5, 'Peak']];

/** Effort across the Sequence: one bar per movement, the peak lit, the shape of the class behind it. */
export function ClassArc({ slots, className = '', compact = false }: { slots: Slot[]; className?: string; compact?: boolean }) {
  const { content } = useStore();
  const arc = classArc(slots, content);
  const head = !compact && (
    <p className="effort__head"><strong>Effort</strong><span>How hard each step works, 1 to 5</span></p>
  );
  if (!arc.some((a) => a.kind === 'movement')) {
    return <div className={`effort effort--empty ${className}`}>{head}<div className="effort__plot"><span className="effort__hint">Add movements and the shape of your class draws itself here.</span></div></div>;
  }
  const peak = Math.max(...arc.map((a) => a.intensity));
  const moves = arc.map((a, i) => ({ ...a, i })).filter((a) => a.kind === 'movement');
  const firstPeak = moves.find((m) => m.intensity === peak)!.i;
  const lastPeak = [...moves].reverse().find((m) => m.intensity === peak)!.i;
  const n = arc.length;
  const pct = (i: number) => `${(i / n) * 100}%`;
  // Arrive · Build · Peak · Settle, read from where the peak actually sits.
  const bands = [
    { k: 'arrive', label: 'Arrive', from: 0, to: Math.min(1, firstPeak) },
    { k: 'build', label: 'Build', from: Math.min(1, firstPeak), to: firstPeak },
    { k: 'peak', label: peak >= 3 ? 'Peak' : 'Middle', from: firstPeak, to: lastPeak + 1 },
    { k: 'settle', label: 'Settle', from: lastPeak + 1, to: n }
  ].filter((b) => b.to > b.from);
  return (
    <div className={`effort ${compact ? 'effort--compact' : ''} ${className}`} role="img"
      aria-label={`Effort: ${moves.map((m) => `${m.name} ${m.intensity}`).join(', ')}, out of 5`}>
      {head}
      <div className="effort__plot">
        <div className="effort__area">
          <div className="effort__lanes" aria-hidden="true">
            {bands.map((b) => <span key={b.k} className={`effort__band is-${b.k}`} style={{ left: pct(b.from), width: pct(b.to - b.from) }} />)}
          </div>
          <div className="effort__grid" aria-hidden="true">
            {GUIDES.map(([v, label]) => <span key={v} className="effort__guide" style={{ bottom: `${(v / 5) * 100}%` }}>{!compact && <i>{label}</i>}</span>)}
          </div>
          <div className="effort__bars">
            {arc.map((a, i) => (
              <span key={i} className="effort__col" tabIndex={compact ? -1 : 0}>
                {a.kind === 'movement' ? (
                  <span className={`effort__bar ${a.intensity === peak ? 'is-peak' : ''}`} style={{ height: `${(a.intensity / 5) * 100}%`, background: `var(${content.pathById[a.pathId ?? '']?.accentVar ?? '--sage'})` }}>
                    {a.intensity === peak && peak >= 3 && <span className="effort__lantern" aria-hidden="true" />}
                  </span>
                ) : <span className="effort__seam" />}
                {!compact && <span className="effort__tip" role="tooltip">{i + 1}. {a.name}<small>{a.kind === 'movement' ? `Effort ${a.intensity} of 5 · ${LEVELS[a.intensity]}` : 'Transition: bridges a change of position'}</small></span>}
              </span>
            ))}
          </div>
        </div>
        {!compact && (
          <div className="effort__phases" aria-hidden="true">
            {bands.map((b) => <span key={b.k} className={`is-${b.k}`} style={{ left: pct(b.from), width: pct(b.to - b.from) }}>{b.label}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/** The seven Harmonies: a headline, then each glyph with its name, the teacher's words and its status on hover. */
export function HarmonyRow({ slots, readings: given }: { slots: Slot[]; readings?: HarmonyReading[] }) {
  const { state, content } = useStore();
  const { openSheet } = useOverlays();
  const readings = given ?? readHarmonies(slots, content, state.ownedCardIds);
  const met = readings.filter((r) => r.status === 'met').length;
  return (
    <div className="harm">
      <p className="harm__head">
        <strong>Harmonies</strong><span className="harm__count">{met} of {readings.length}</span>
        <button type="button" className="harm__all" onClick={() => openSheet({ eyebrow: 'The Pilates Council', title: 'Harmonies', body: <HarmonySheet slots={slots} /> })} data-a="All Harmonies">All notes</button>
      </p>
      <div className="harm__row">
        {readings.map((r) => (
          <span key={r.def.id} className={`harm__item is-${r.status}`} tabIndex={0} aria-label={`${r.def.name}, ${r.status === 'met' ? 'in this Sequence' : r.hint ?? 'not in play yet'}`}>
            <span className={`hrow__glyph is-${r.status}`} aria-hidden="true">{r.def.glyph}</span>
            <span className="harm__tip" role="tooltip">
              <strong>{r.def.name} <em>+{r.def.points}</em></strong>
              <q>{r.def.says}</q>
              <span className={`harm__state is-${r.status}`}>{r.status === 'met' ? '✓ In this Sequence' : r.status === 'open' ? r.hint : r.hint ?? 'Not in play yet'}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function HarmonySheet({ slots }: { slots: Slot[] }) {
  const { state, content } = useStore();
  const readings = readHarmonies(slots, content, state.ownedCardIds);
  return (
    <div className="hsheet">
      <p className="muted">Seven principles from the Council’s decades of teaching. Every one met pays out when you perform the Sequence all the way through.</p>
      <ClassArc slots={slots} className="effort--big" />
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

