import { techniquesKnown } from '../game/rules';
import { useStore } from '../game/store';

// Lanterns are knowledge: one paper lantern for every Technique in the branch,
// strung in three swoops across the top of the market. Learn one and it lights.

const SWOOPS = 3;
const TOP = 3;
const SAG = 15;

/** Height of the string (in px of a 36px-tall garland) at a point across the width. */
function sagAt(x: number) {
  const t = (x * SWOOPS) % 1;
  return TOP + SAG * 4 * t * (1 - t);
}

export function Garland() {
  const { state, content } = useStore();
  const nodes = content.branch.nodes;
  const lit = techniquesKnown(state, content);
  const n = nodes.length;
  const d = Array.from({ length: SWOOPS }, (_, i) => {
    const x0 = (i / SWOOPS) * 1000, x1 = ((i + 1) / SWOOPS) * 1000;
    return `${i === 0 ? `M${x0} ${TOP}` : ''} Q${(x0 + x1) / 2} ${TOP + SAG * 2} ${x1} ${TOP}`;
  }).join(' ');
  return (
    <div className="garland" role="img" aria-label={`${lit} of ${n} lanterns lit: one for every Technique you know`}>
      <svg className="garland__string" viewBox="0 0 1000 36" preserveAspectRatio="none" aria-hidden="true">
        <path d={d} vectorEffect="non-scaling-stroke" />
      </svg>
      {nodes.map((node, i) => {
        const x = (i + 0.5) / n;
        const on = state.ownedCardIds.includes(node.cardId);
        const accent = content.pathById[node.pathId]?.accentVar ?? '--gold';
        return (
          <span key={node.id} className={`lantern ${on ? 'is-lit' : ''}`} aria-hidden="true"
            style={{ left: `${x * 100}%`, top: `calc(${sagAt(x)}px * var(--garland-scale, 1))`, ['--i' as string]: i, ['--band' as string]: `var(${accent})` }}
            title={content.cardById[node.cardId]?.name}>
            <svg viewBox="0 0 14 24" width="14" height="24">
              <line x1="7" y1="0" x2="7" y2="4" className="lantern__cord" />
              <rect x="4" y="3.5" width="6" height="2" rx="0.8" className="lantern__cap" />
              <ellipse cx="7" cy="12" rx="6" ry="7" className="lantern__body" />
              <path d="M1.4 12 H12.6" className="lantern__band" />
              <rect x="4.5" y="18.2" width="5" height="1.8" rx="0.8" className="lantern__cap" />
              <line x1="7" y1="20" x2="7" y2="23.5" className="lantern__cord" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
