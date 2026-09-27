// Line drawings for every Qcard, in a 160×100 box, drawn in ink over a watercolour wash.
// A shape with `b` has a second pose: live cards breathe between the two (see CardArt.tsx),
// so every path command in `b` must match the one in `a`.

type Attrs = Record<string, string | number>;
export interface Shape {
  t: 'path' | 'circle';
  a: Attrs;
  b?: Attrs;
  soft?: true;
  /** A pathway: dashes travel along it. */
  flow?: true;
  /** Rotates around this point. */
  spin?: [number, number];
}
export interface ArtDef {
  shapes: Shape[];
  /** Seconds for one full breath between the poses. */
  dur: number;
}

const P = (d: string, bd?: string): Shape => (bd ? { t: 'path', a: { d }, b: { d: bd } } : { t: 'path', a: { d } });
const C = (cx: number, cy: number, r: number, to?: [number, number]): Shape =>
  (to ? { t: 'circle', a: { cx, cy, r }, b: { cx: to[0], cy: to[1] } } : { t: 'circle', a: { cx, cy, r } });
const soft = (s: Shape): Shape => ({ ...s, soft: true });
const flow = (s: Shape): Shape => ({ ...s, flow: true });
const ground = soft(P('M14 84 H146'));
const groundLow = soft(P('M14 86 H146'));

export const ART: Record<string, ArtDef> = {
  breathing: { dur: 5.5, shapes: [
    ground,
    C(34, 76, 6),
    P('M41 79 C58 78 74 79 86 80', 'M41 79 C56 71 72 75 86 80'),
    P('M86 80 L104 58 L116 83'),
    soft(P('M44 78 C52 74 58 74 64 77', 'M44 77 C52 70 58 70 64 74')),
    soft(P('M52 62 C58 56 66 56 72 62', 'M49 55 C57 46 67 46 75 55'))
  ] },

  bridge: { dur: 4, shapes: [
    ground,
    C(34, 76, 6),
    P('M41 79 C58 79 72 80 84 80', 'M41 78 C58 74 74 66 84 54'),
    P('M84 80 L104 56 L114 83', 'M84 54 L108 52 L114 83'),
    soft(P('M41 81 L70 83'))
  ] },
  'bridge-march': { dur: 3.2, shapes: [
    ground,
    C(34, 76, 6),
    P('M41 78 C58 74 74 66 84 52'),
    P('M84 52 L106 50 L112 83'),
    P('M84 52 L105 51 L110 82', 'M84 52 L98 32 L118 40'),
    soft(P('M41 81 L70 83'))
  ] },
  clam: { dur: 3, shapes: [
    ground,
    C(30, 70, 6),
    soft(P('M38 74 L24 60')),
    P('M37 73 L86 77'),
    P('M86 79 L110 70 L116 84'),
    P('M86 75 L110 67 L117 81', 'M86 75 L104 46 L117 81')
  ] },
  'single-leg-bridge': { dur: 3.6, shapes: [
    ground,
    C(34, 76, 6),
    P('M41 79 C58 78 72 76 84 72', 'M41 78 C58 74 74 66 84 52'),
    P('M84 72 L104 54 L110 83', 'M84 52 L104 52 L110 83'),
    P('M84 72 L128 44', 'M84 52 L132 26'),
    soft(P('M41 81 L70 83'))
  ] },

  'dead-bug': { dur: 3.4, shapes: [
    groundLow,
    C(32, 78, 6),
    P('M39 82 L96 82'),
    soft(P('M66 82 L62 50')),
    P('M62 82 L54 50', 'M62 82 L30 60'),
    soft(P('M92 82 L98 56 L116 52')),
    P('M94 82 L100 54 L120 50', 'M94 82 L116 66 L142 72')
  ] },
  'toe-taps': { dur: 2.6, shapes: [
    groundLow,
    C(32, 78, 6),
    P('M39 82 L94 82'),
    soft(P('M40 84 L66 84')),
    soft(P('M92 82 L94 54 L118 54')),
    P('M94 82 L98 54 L122 54', 'M94 82 L110 58 L128 84')
  ] },
  'hundred-prep': { dur: 0.9, shapes: [
    groundLow,
    C(44, 58, 7, [44, 56]),
    P('M50 62 C68 72 84 80 100 82', 'M50 60 C68 71 84 80 100 82'),
    P('M52 68 L88 78', 'M52 68 L88 71'),
    P('M100 82 L118 62 L130 84')
  ] },
  'roll-up': { dur: 5, shapes: [
    groundLow,
    C(28, 78, 6, [74, 40]),
    P('M35 81 C55 82 76 82 96 82', 'M76 47 C68 60 78 76 96 82'),
    P('M33 76 L16 62', 'M78 50 L122 62'),
    P('M96 82 L142 82')
  ] },
  'teaser-prep': { dur: 4, shapes: [
    groundLow,
    C(40, 52, 7, [46, 40]),
    P('M46 57 L84 82', 'M52 44 L84 82'),
    P('M84 82 L128 34'),
    soft(P('M50 60 L118 46', 'M56 50 L120 40'))
  ] },

  'scapular-glide': { dur: 3, shapes: [
    soft(P('M54 86 H106')),
    C(80, 28, 9),
    P('M80 38 L80 80'),
    P('M62 48 C70 42 77 50 75 60', 'M55 48 C63 42 70 50 68 60'),
    P('M98 48 C90 42 83 50 85 60', 'M105 48 C97 42 90 50 92 60'),
    soft(P('M60 50 L46 74', 'M54 50 L41 74')),
    soft(P('M100 50 L114 74', 'M106 50 L119 74'))
  ] },
  'quad-press': { dur: 2.8, shapes: [
    ground,
    C(40, 46, 7, [40, 43]),
    P('M47 48 Q75 52 104 48', 'M47 45 Q75 38 104 47'),
    P('M52 49 L52 83', 'M52 46 L52 83'),
    P('M103 48 L103 83 L126 83', 'M103 47 L103 83 L126 83'),
    soft(P('M60 44 C66 40 72 42 74 47', 'M60 38 C66 33 72 35 74 41'))
  ] },
  'bird-dog': { dur: 3.6, shapes: [
    ground,
    C(40, 44, 7),
    P('M47 46 L104 46'),
    P('M54 47 L54 83'),
    P('M102 47 L102 83 L124 83'),
    P('M50 47 L57 82', 'M50 45 L18 38'),
    P('M104 46 L106 80 L128 83', 'M104 46 L136 40 L150 42')
  ] },
  'swan-prep': { dur: 3.6, shapes: [
    ground,
    C(34, 77, 6, [34, 52]),
    P('M40 80 C60 82 90 83 140 83', 'M40 57 C62 68 90 83 140 83'),
    P('M46 81 L58 73 L66 84', 'M46 60 L56 72 L66 84')
  ] },
  'plank-control': { dur: 4, shapes: [
    ground,
    C(34, 50, 7),
    P('M41 52 L126 72', 'M41 51 L126 72'),
    P('M46 54 L46 83'),
    P('M126 72 L134 83'),
    soft(P('M54 46 C62 40 70 46 68 54', 'M52 44 C61 36 71 43 69 51'))
  ] },

  'transition-roll': { dur: 3, shapes: [
    flow(P('M28 30 C58 30 60 62 90 62 C112 62 116 44 132 44')),
    P('M124 38 L132 44 L124 50'),
    C(28, 30, 4)
  ] },
  'transition-turn': { dur: 3, shapes: [
    flow(P('M104 44 A28 28 0 1 1 80 30')),
    P('M74 22 L82 30 L74 38'),
    C(80, 58, 3.4)
  ] },

  'progression-tempo': { dur: 6, shapes: [
    C(80, 54, 26),
    { t: 'path', a: { d: 'M80 38 V56 L92 62' }, spin: [80, 54] },
    soft(P('M80 20 V26'))
  ] },
  'progression-lever': { dur: 3, shapes: [
    P('M34 60 L124 60', 'M34 65 L124 53'),
    P('M70 60 L78 74 H62 Z'),
    C(124, 60, 5, [124, 53])
  ] },
  'progression-coord': { dur: 4, shapes: [
    flow(P('M52 54 A18 18 0 1 0 88 54')),
    soft(flow(P('M72 54 A18 18 0 1 1 108 54')))
  ] }
};
