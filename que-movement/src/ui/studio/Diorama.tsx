import type { ReactNode } from 'react';
import type { Badge, Card } from '../../content/types';
import type { DecorSlot } from '../../game/types';

// The Studio as a little isometric room, drawn in SVG from simple boxes and planes.
// x runs toward the front-right, y toward the front-left, z is up. One unit ≈ a floorboard.

const S = 34;
const CW = S * 0.866;
const CH = S * 0.5;
const OX = 352;
const OY = 250;
const W = 10; // room width (x)
const D = 8; // room depth (y)
const H = 7; // wall height

type P3 = [number, number, number];
const pt = ([x, y, z]: P3): [number, number] => [OX + (x - y) * CW, OY + (x + y) * CH - z * S];
const pts = (ps: P3[]) => ps.map((p) => pt(p).map((n) => n.toFixed(1)).join(',')).join(' ');

function Poly({ p, fill, stroke, className, opacity }: { p: P3[]; fill: string; stroke?: string; className?: string; opacity?: number }) {
  return <polygon points={pts(p)} fill={fill} stroke={stroke ?? 'rgba(60,40,20,0.18)'} strokeWidth={stroke ? 1 : 0.8} strokeLinejoin="round" className={className} opacity={opacity} />;
}

/** A box, showing the three faces the camera sees. */
function Box({ x, y, z = 0, w, d, h, top, left, right }: { x: number; y: number; z?: number; w: number; d: number; h: number; top: string; left?: string; right?: string }) {
  const l = left ?? shade(top, 12);
  const r = right ?? shade(top, 22);
  return (
    <g>
      <Poly p={[[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]} fill={l} />
      <Poly p={[[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]} fill={r} />
      <Poly p={[[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]} fill={top} />
    </g>
  );
}
const shade = (c: string, pct: number) => `color-mix(in srgb, ${c} ${100 - pct}%, #2a1a0c)`;

/** An ellipse lying on the floor (or any flat surface at height z). */
function FloorOval({ cx, cy, z = 0, rx, ry, fill, stroke }: { cx: number; cy: number; z?: number; rx: number; ry: number; fill: string; stroke?: string }) {
  const ring: P3[] = Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z]; });
  return <Poly p={ring} fill={fill} stroke={stroke ?? 'rgba(60,40,20,0.15)'} />;
}

/** Text and pictures laid flat on the back-right wall (the y = 0 plane). */
function OnBackWall({ x, z, children }: { x: number; z: number; children: ReactNode }) {
  const [tx, ty] = pt([x, 0.02, z]);
  return <g transform={`matrix(0.866 0.5 0 1 ${tx.toFixed(1)} ${ty.toFixed(1)})`}>{children}</g>;
}
/** …and on the left wall (the x = 0 plane). */
function OnLeftWall({ y, z, children }: { y: number; z: number; children: ReactNode }) {
  const [tx, ty] = pt([0.02, y, z]);
  return <g transform={`matrix(0.866 -0.5 0 1 ${tx.toFixed(1)} ${ty.toFixed(1)})`}>{children}</g>;
}
/** Wall-plane pixels per room unit. */
const U = S;

const WALLS: Record<string, string> = { linen: '#EFE5D1', sage: '#C8D2BC', clay: '#E4C5A9', dusk: '#46506B' };
const FLOORS: Record<string, [string, string]> = { oak: ['#C99A63', '#B6874F'], walnut: ['#7D5436', '#6B452B'], ash: ['#E4D3B3', '#D5C29F'] };
const MATS: Record<string, string> = { sage: '#8CA189', clay: '#C27B57', plum: '#7C4B6C' };
const WOOD = '#B8875A';

export interface DioramaProps {
  decor: Record<DecorSlot, string>;
  badges: Badge[];
  earned: string[];
  pinned: { name: string; cards: Card[] } | null;
  mastery: { name: string; accent: string; pct: number }[];
  studioName: string;
}

export function Diorama({ decor, badges, earned, pinned, mastery, studioName }: DioramaProps) {
  const wall = WALLS[decor.wall] ?? WALLS.linen;
  const dark = decor.wall === 'dusk';
  const [floorA, floorB] = FLOORS[decor.floor] ?? FLOORS.oak;
  const mat = MATS[decor.mat] ?? MATS.sage;
  const glow = decor.lamp === 'candles' ? '#FFC873' : '#FFE3A6';

  return (
    <svg className="diorama" viewBox="0 0 720 580" role="img" aria-label={`${studioName}: an isometric studio`}>
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF4D2" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFE6A8" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="lampglow">
          <stop offset="0" stopColor={glow} stopOpacity="0.9" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ballshine" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* shadow the room sits on */}
      <ellipse cx={OX + 30} cy={OY + (W + D) * CH + 8} rx="330" ry="46" fill="rgba(40,28,14,0.16)" />

      {/* walls, with a thick top edge */}
      <Poly p={[[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]]} fill={shade(wall, dark ? 4 : 8)} />
      <Poly p={[[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]]} fill={wall} />
      <Poly p={[[-0.35, -0.35, H], [W, -0.35, H], [W, 0, H], [0, 0, H], [0, D, H], [-0.35, D, H]]} fill={shade(wall, 18)} />
      <Poly p={[[0, D, 0], [-0.35, D, 0], [-0.35, D, H], [0, D, H]]} fill={shade(wall, 26)} />
      <Poly p={[[W, 0, 0], [W, -0.35, 0], [W, -0.35, H], [W, 0, H]]} fill={shade(wall, 30)} />
      {/* skirting */}
      <Poly p={[[0, 0, 0], [W, 0, 0], [W, 0, 0.35], [0, 0, 0.35]]} fill={shade(wall, 14)} />
      <Poly p={[[0, 0, 0], [0, D, 0], [0, D, 0.35], [0, 0, 0.35]]} fill={shade(wall, 20)} />

      {/* floor and boards */}
      <Poly p={[[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]]} fill={floorA} />
      {Array.from({ length: 10 }, (_, i) => <polyline key={i} points={pts([[0, (i + 1) * 0.8, 0], [W, (i + 1) * 0.8, 0]])} stroke={floorB} strokeWidth="1.2" fill="none" />)}
      {Array.from({ length: 9 }, (_, i) => { const y = i * 0.8 + 0.4; const x = ((i * 3.7) % 7) + 1.2; return <polyline key={`j${i}`} points={pts([[x, y - 0.4, 0], [x, y + 0.4, 0]])} stroke={floorB} strokeWidth="1" fill="none" />; })}
      <Poly p={[[W, 0, 0], [W, D, 0], [W, D, -0.35], [W, 0, -0.35]]} fill={shade(floorA, 30)} />
      <Poly p={[[0, D, 0], [W, D, 0], [W, D, -0.35], [0, D, -0.35]]} fill={shade(floorA, 18)} />

      {/* window on the left wall, and the light it throws */}
      <Poly p={[[0.03, 1.6, 2.2], [0.03, 4.6, 2.2], [0.03, 4.6, 5.9], [0.03, 1.6, 5.9]]} fill="#F7EFD8" stroke="#8A6A45" />
      <Poly p={[[0.05, 1.8, 2.4], [0.05, 4.4, 2.4], [0.05, 4.4, 5.7], [0.05, 1.8, 5.7]]} fill={dark ? '#2E3A57' : '#CFE0E4'} />
      <polyline points={pts([[0.06, 3.1, 2.4], [0.06, 3.1, 5.7]])} stroke="#8A6A45" strokeWidth="2.4" />
      <polyline points={pts([[0.06, 1.8, 4.05], [0.06, 4.4, 4.05]])} stroke="#8A6A45" strokeWidth="2.4" />
      <Poly p={[[0.05, 1.6, 2.2], [0.05, 4.6, 2.2], [0.5, 4.6, 2.1], [0.5, 1.6, 2.1]]} fill="#E8D8B8" />
      {!dark && <Poly className="dio-beam" p={[[0.05, 1.8, 5.7], [0.05, 4.4, 5.7], [4.6, 6.9, 0], [3.2, 3.4, 0]]} fill="url(#beam)" stroke="none" />}
      {!dark && <Poly className="dio-beam dio-beam--floor" p={[[2.1, 2.4, 0.01], [3.4, 6.5, 0.01], [5.4, 6.9, 0.01], [4.1, 2.9, 0.01]]} fill="#FFF3CF" stroke="none" opacity={0.35} />}
      {!dark && [0, 1, 2, 3, 4].map((i) => { const [cx, cy] = pt([1.6 + i * 0.6, 3 + (i % 3) * 0.8, 1.6 + (i % 2) * 1.4]); return <circle key={i} className="dio-mote" style={{ ['--i' as string]: i }} cx={cx} cy={cy} r="1.6" fill="#FFF8E4" />; })}

      {/* path mastery: three framed prints on the left wall */}
      {mastery.map((m, i) => (
        <OnLeftWall key={m.name} y={5.2 + i * 0.95} z={5.1}>
          <rect x="0" y="0" width={U * 0.72} height={U * 1.25} fill="#FBF5E8" stroke="#8A6A45" strokeWidth="2.5" />
          <rect x="4" y={4 + (U * 1.25 - 8) * (1 - m.pct)} width={U * 0.72 - 8} height={(U * 1.25 - 8) * m.pct} fill={m.accent} opacity="0.75" />
          <title>{`${m.name}: ${Math.round(m.pct * 100)}% learned`}</title>
        </OnLeftWall>
      ))}

      {/* badge shelves on the back wall */}
      {[0, 1].map((row) => (
        <g key={row}>
          <Box x={0.5} y={0} z={4.35 - row * 1.2} w={4.4} d={0.45} h={0.12} top={WOOD} />
          {badges.slice(row * 6, row * 6 + 6).map((b, i) => {
            const has = earned.includes(b.id);
            const [cx, cy] = pt([0.85 + i * 0.72, 0.22, 4.47 - row * 1.2 + 0.32]);
            return (
              <g key={b.id} className={has ? 'dio-badge is-earned' : 'dio-badge'}>
                <title>{`${b.name}${has ? '' : ' (not yet)'}`}</title>
                <circle cx={cx} cy={cy} r="8.5" fill={has ? '#D8B35E' : 'none'} stroke={has ? '#8C6A2A' : dark ? '#8C93A8' : '#B9A98B'} strokeWidth="1.5" strokeDasharray={has ? undefined : '2 2'} />
                {has && <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="10" fill="#3A2A0E">{b.glyph}</text>}
              </g>
            );
          })}
        </g>
      ))}

      {/* the class board: your pinned Sequence */}
      <OnBackWall x={5.2} z={5.6}>
        <rect x="0" y="0" width={U * 3.5} height={U * 2.5} rx="3" fill="#3E4A40" stroke={WOOD} strokeWidth="5" />
        <text x="10" y="17" className="dio-chalk dio-chalk--small">Today’s class</text>
        <text x="10" y="36" className="dio-chalk">{pinned ? trim(pinned.name, 15) : 'Nothing pinned'}</text>
        {pinned
          ? pinned.cards.slice(0, 6).map((c, i) => <g key={i}><rect x={10 + i * 17} y="48" width="13" height="18" rx="2" fill="#F4EBD6" opacity="0.9" /><text x={16.5 + i * 17} y="60" textAnchor="middle" fontSize="8" fill="#3E4A40">{c.name.slice(0, 1)}</text></g>)
          : <text x="10" y="56" className="dio-chalk dio-chalk--small">Pin one in Profile</text>}
      </OnBackWall>
      <Box x={5.25} y={0} z={3.0} w={3.45} d={0.3} h={0.1} top={WOOD} />

      {/* rug */}
      {decor.rug === 'moss' && <FloorOval cx={4.6} cy={4.2} rx={2.7} ry={2.1} fill="#7F946E" stroke="#6C8060" />}
      {decor.rug === 'moss' && <FloorOval cx={4.6} cy={4.2} rx={2.2} ry={1.6} fill="none" stroke="#9AAE88" />}
      {decor.rug === 'terracotta' && <Poly p={[[1.6, 3.2, 0.01], [8.2, 3.2, 0.01], [8.2, 5.3, 0.01], [1.6, 5.3, 0.01]]} fill="#C4704B" stroke="#A95B3A" />}
      {decor.rug === 'terracotta' && <Poly p={[[1.9, 3.45, 0.02], [7.9, 3.45, 0.02], [7.9, 5.05, 0.02], [1.9, 5.05, 0.02]]} fill="none" stroke="#E4A27E" />}
      {decor.rug === 'woven' && <g>
        <Poly p={[[2, 2.8, 0.01], [7.6, 2.8, 0.01], [7.6, 5.8, 0.01], [2, 5.8, 0.01]]} fill="#EADDC2" stroke="#C8B48E" />
        {[0, 1, 2, 3, 4, 5].map((i) => <Poly key={i} p={[[2, 3.05 + i * 0.5, 0.02], [7.6, 3.05 + i * 0.5, 0.02], [7.6, 3.25 + i * 0.5, 0.02], [2, 3.25 + i * 0.5, 0.02]]} fill={i % 2 ? '#B57C54' : '#6F8467'} stroke="none" />)}
      </g>}

      {/* equipment, at the back right */}
      {decor.equipment === 'reformer' && <Reformer />}
      {decor.equipment === 'chair' && <g>
        <Box x={7.4} y={1.1} w={1.3} d={1.2} h={1.3} top="#D6B892" left="#C3A27A" right="#A98A64" />
        <Box x={7.35} y={1.05} z={1.3} w={1.4} d={1.3} h={0.18} top="#6E5A4A" />
        <Box x={8.7} y={1.35} z={0.25} w={0.55} d={0.7} h={0.08} top="#3C3A36" />
      </g>}
      {decor.equipment === 'ball' && (() => { const [cx, cy] = pt([8, 2.2, 0.95]); return <g><FloorOval cx={8.1} cy={2.3} rx={0.8} ry={0.8} fill="rgba(40,28,14,0.18)" stroke="none" /><circle cx={cx} cy={cy} r="30" fill="#9BB0C4" /><circle cx={cx} cy={cy} r="30" fill="url(#ballshine)" /><path d={`M${cx - 30} ${cy} Q${cx} ${cy + 12} ${cx + 30} ${cy}`} stroke="#7E95AA" fill="none" /></g>; })()}

      {/* the mat */}
      <Box x={2.6} y={3.6} w={4.2} d={1.3} h={0.07} top={mat} />
      <Poly p={[[6.3, 3.6, 0.08], [6.8, 3.6, 0.08], [6.8, 4.9, 0.08], [6.3, 4.9, 0.08]]} fill={shade(mat, 10)} stroke="none" />

      {/* props */}
      {decor.prop === 'roller' && (() => { const [a1, b1] = pt([1.5, 6.1, 0.3]); const [a2, b2] = pt([3.2, 6.1, 0.3]); return <g><line x1={a1} y1={b1} x2={a2} y2={b2} stroke="#5E7C93" strokeWidth="19" strokeLinecap="round" /><line x1={a1} y1={b1 - 5} x2={a2} y2={b2 - 5} stroke="#86A2B8" strokeWidth="4" strokeLinecap="round" /></g>; })()}
      {decor.prop === 'ring' && <g><FloorOval cx={2.2} cy={6.3} z={0.02} rx={0.75} ry={0.75} fill="none" stroke="#7C4B6C" /><FloorOval cx={2.2} cy={6.3} z={0.08} rx={0.75} ry={0.75} fill="none" stroke="#9D6A8C" /></g>}
      {decor.prop === 'blocks' && <g><Box x={1.6} y={5.8} w={0.9} d={0.6} h={0.45} top="#D2A777" /><Box x={1.7} y={5.9} z={0.45} w={0.9} d={0.6} h={0.45} top="#DDB585" /></g>}

      {/* plant, front-left */}
      <Plant kind={decor.plant} />

      {/* light */}
      {decor.lamp === 'lantern' && (() => { const [lx, ly] = pt([6.4, 5.6, 4.3]); const [tx, ty] = pt([6.4, 5.6, 7.6]); return <g className="dio-lamp"><line x1={tx} y1={ty} x2={lx} y2={ly - 18} stroke="#6b5a45" strokeWidth="1.2" /><circle cx={lx} cy={ly} r="46" fill="url(#lampglow)" opacity="0.55" /><ellipse cx={lx} cy={ly} rx="17" ry="19" fill="#FBF1DC" stroke="#D9C49C" /><path d={`M${lx - 17} ${ly - 3} Q${lx} ${ly + 3} ${lx + 17} ${ly - 3} M${lx - 16} ${ly + 6} Q${lx} ${ly + 12} ${lx + 16} ${ly + 6}`} stroke="#E4D2AE" fill="none" /></g>; })()}
      {decor.lamp === 'arc' && (() => { const [bx, by] = pt([9.2, 6.4, 0]); const [hx, hy] = pt([7.6, 5.2, 4.6]); return <g className="dio-lamp"><ellipse cx={bx} cy={by} rx="14" ry="7" fill="#6E5B3E" /><path d={`M${bx} ${by} C ${bx} ${by - 170} ${hx + 40} ${hy - 50} ${hx} ${hy}`} stroke="#B08A45" strokeWidth="3" fill="none" /><circle cx={hx} cy={hy + 14} r="60" fill="url(#lampglow)" opacity="0.5" /><path d={`M${hx - 14} ${hy + 12} Q${hx} ${hy - 12} ${hx + 14} ${hy + 12} Z`} fill="#C9A057" /></g>; })()}
      {decor.lamp === 'candles' && [0, 1, 2].map((i) => { const [cx, cy] = pt([8.4 + i * 0.35, 6.9 - (i % 2) * 0.35, 0]); const h = 16 + (i % 2) * 9; return <g key={i} className="dio-lamp"><circle cx={cx} cy={cy - h} r="26" fill="url(#lampglow)" opacity="0.5" /><rect x={cx - 5} y={cy - h} width="10" height={h} rx="2" fill="#F6ECD8" /><ellipse className="dio-flame" style={{ ['--i' as string]: i }} cx={cx} cy={cy - h - 5} rx="2.6" ry="5" fill="#F2A93B" /></g>; })}
    </svg>
  );
}

const trim = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function Reformer() {
  const wood = '#C49A6C';
  return (
    <g>
      <Box x={6.2} y={1.0} w={3.5} d={1.3} h={0.45} top={wood} left="#AF8558" right="#946E46" />
      <Box x={6.35} y={1.12} z={0.45} w={3.2} d={1.06} h={0.04} top="#8C6A48" />
      <Box x={7.4} y={1.12} z={0.49} w={1.3} d={1.06} h={0.22} top="#E9E0CF" left="#D8CDB8" right="#C6B9A2" />
      <Box x={7.4} y={1.1} z={0.71} w={0.35} d={1.1} h={0.35} top="#E9E0CF" />
      <Box x={9.5} y={1.0} z={0.45} w={0.14} d={0.14} h={1.0} top="#B8B4AC" />
      <Box x={9.5} y={2.16} z={0.45} w={0.14} d={0.14} h={1.0} top="#B8B4AC" />
      <Box x={9.5} y={1.0} z={1.42} w={0.14} d={1.3} h={0.12} top="#CFCBC3" />
      {[0, 1, 2].map((i) => { const [a, b] = pt([9.0 + i * 0.12, 1.6, 0.46]); const [c, d] = pt([9.45, 1.6, 0.46]); return <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#D7A93F" strokeWidth="1.5" />; })}
    </g>
  );
}

function Plant({ kind }: { kind: string }) {
  const [px, py] = pt([1.0, 7.0, 0]);
  const pot = kind === 'olive'
    ? <Box x={0.55} y={6.55} w={0.9} d={0.9} h={1.0} top="#CDB79A" left="#B59C7C" right="#9C8466" />
    : <Box x={0.6} y={6.6} w={0.8} d={0.8} h={0.75} top="#C57B55" left="#AE6644" right="#945436" />;
  const base = kind === 'olive' ? py - 1.0 * S - 6 : py - 0.75 * S - 8;
  return (
    <g>
      {pot}
      <g className="dio-plant" style={{ transformOrigin: `${px}px ${base}px` }}>
        {kind === 'fern' && Array.from({ length: 9 }, (_, i) => {
          const a = (-80 + i * 20) * (Math.PI / 180);
          const len = 50 + (i % 3) * 10;
          const ex = px + Math.sin(a) * len, ey = base - Math.cos(a) * len * 0.7;
          return <path key={i} d={`M${px} ${base} Q${px + Math.sin(a) * len * 0.5} ${base - len * 0.8} ${ex} ${ey + 14}`} stroke="#5E7F4C" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="4 1.6" />;
        })}
        {kind === 'monstera' && Array.from({ length: 6 }, (_, i) => {
          const a = (-60 + i * 24) * (Math.PI / 180);
          const len = 56 + (i % 2) * 14;
          const ex = px + Math.sin(a) * len, ey = base - Math.cos(a) * len;
          return <g key={i}><line x1={px} y1={base} x2={ex} y2={ey} stroke="#4E6B3E" strokeWidth="2" /><ellipse cx={ex} cy={ey} rx="17" ry="12" transform={`rotate(${(a * 180) / Math.PI} ${ex} ${ey})`} fill={i % 2 ? '#3F6A45' : '#4E7B51'} /></g>;
        })}
        {kind === 'olive' && <g>
          <path d={`M${px} ${base} C${px - 4} ${base - 40} ${px + 6} ${base - 70} ${px} ${base - 110}`} stroke="#6D5A43" strokeWidth="4" fill="none" />
          {Array.from({ length: 16 }, (_, i) => { const a = i * 2.4; const r = 16 + (i % 4) * 8; return <ellipse key={i} cx={px + Math.cos(a) * r} cy={base - 110 + Math.sin(a) * r * 0.7} rx="7" ry="3" transform={`rotate(${i * 37} ${px + Math.cos(a) * r} ${base - 110 + Math.sin(a) * r * 0.7})`} fill={i % 2 ? '#7E9272' : '#94A686'} />; })}
        </g>}
      </g>
    </g>
  );
}
