// One instrument for the whole game: a soft kalimba, synthesised, tuned to a major
// pentatonic so every sound belongs to the same song. A streak climbs the scale.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) { enabled = on; }

function audio(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.32;
      // a little room: a short feedback delay, like a wooden stall
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.13;
      const fb = ctx.createGain();
      fb.gain.value = 0.22;
      const wet = ctx.createGain();
      wet.gain.value = 0.28;
      master.connect(ctx.destination);
      master.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

const PENTA = [0, 2, 4, 7, 9];
/** Frequency of a step on the pentatonic scale, from C5 upward. */
function freq(step: number) {
  const oct = Math.floor(step / 5);
  const semis = oct * 12 + PENTA[((step % 5) + 5) % 5];
  return 523.25 * Math.pow(2, semis / 12);
}

/** One plucked tine: a sine body, an octave shimmer and a brief metallic click. */
function pluck(f: number, when = 0, vol = 1, decay = 1.3) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + when;
  const out = a.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.5 * vol, t + 0.006);
  out.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  out.connect(master);
  const partials: [number, number, number][] = [[1, 1, decay], [2.0, 0.22, decay * 0.6], [5.4, 0.08, 0.12]];
  for (const [mult, g, d] of partials) {
    const o = a.createOscillator();
    o.type = 'sine';
    o.frequency.value = f * mult;
    const pg = a.createGain();
    pg.gain.setValueAtTime(g, t);
    pg.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(pg);
    pg.connect(out);
    o.start(t);
    o.stop(t + decay + 0.05);
  }
}

export const sfx = {
  /** A card joins the Sequence: the note rises with its place in the list. */
  add(n = 0) { pluck(freq(2 + Math.min(n, 9)), 0, 0.55, 0.7); },
  /** A soft tick for small confirmations. */
  tap() { pluck(freq(12), 0, 0.25, 0.25); },
  /** A card completed in Play: the streak climbs the scale, and two in a row harmonise. */
  complete(streak: number) {
    const s = Math.min(streak, 12);
    pluck(freq(s), 0, 0.8);
    if (streak >= 3) pluck(freq(s + 2), 0.07, 0.4);
  },
  /** A Harmony lands in the ledger. */
  harmony(i: number) { pluck(freq(5 + i), 0, 0.7, 1.6); pluck(freq(7 + i), 0.05, 0.35, 1.2); },
  /** A Technique learned: a bell chord that blooms. */
  learn() { [0, 2, 4, 7, 9].forEach((s, i) => pluck(freq(5 + s), i * 0.06, 0.6 - i * 0.06, 2.2)); },
  /** A badge: three bright notes. */
  badge() { [10, 12, 14].forEach((s, i) => pluck(freq(s), i * 0.11, 0.55, 1.4)); },
  /** The victory lap: a glissando up the scale. */
  cascade() { for (let i = 0; i < 11; i += 1) pluck(freq(i + 3), i * 0.055, 0.35 + i * 0.02, 1); },
  /** A visitor comes into the Studio. */
  bell() { pluck(freq(9), 0, 0.35, 1.8); pluck(freq(11), 0.18, 0.3, 1.8); }
};
