import { useEffect, useRef } from 'react';
import { motionReduced } from './fly';
import { sfx } from './sound';

// The solitaire moment: when the last card lands, the Sequence's cards take a bouncing
// victory lap and leave soft trails, like a won hand of Klondike. Tap anywhere to skip.

export interface LapCard { name: string; accent: string }

const CW = 74;
const CH = 100;

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function VictoryLap({ cards, from, onDone }: { cards: LapCard[]; from?: DOMRect | null; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || motionReduced() || !cards.length) { done.current(); return; }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const g = canvas.getContext('2d');
    if (!g) { done.current(); return; }
    g.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const paper = css.getPropertyValue('--paper-card').trim() || '#FDF8EE';
    const ink = css.getPropertyValue('--ink').trim() || '#2A2436';
    const gold = css.getPropertyValue('--gold').trim() || '#C4852F';
    const display = css.getPropertyValue('--font-display').trim() || 'Georgia, serif';
    const x0 = from ? from.left + from.width / 2 - CW / 2 : 60;
    const y0 = from ? from.top : H - CH - 90;
    const floor = H - CH - 70;
    const lap = cards.slice(0, 8).map((c, i) => ({
      ...c,
      accent: c.accent.startsWith('var(') ? css.getPropertyValue(c.accent.slice(4, -1)).trim() || gold : c.accent,
      x: x0, y: y0, vx: (5.5 + (i % 3) * 1.6) * (i % 3 === 2 ? -0.6 : 1), vy: -(10 + (i % 4) * 1.5), start: i * 7, alive: true
    }));
    let frame = 0;
    let raf = 0;
    sfx.cascade();
    const draw = (c: typeof lap[number]) => {
      g.save();
      g.shadowColor = 'rgba(20,14,40,0.25)';
      g.shadowBlur = 8;
      roundRect(g, c.x, c.y, CW, CH, 9);
      g.fillStyle = paper;
      g.fill();
      g.shadowBlur = 0;
      g.lineWidth = 1.2;
      g.strokeStyle = gold;
      g.stroke();
      g.beginPath();
      g.ellipse(c.x + CW / 2, c.y + 40, 26, 18, 0, 0, Math.PI * 2);
      g.fillStyle = c.accent;
      g.globalAlpha = 0.35;
      g.fill();
      g.globalAlpha = 1;
      g.fillStyle = c.accent;
      g.fillRect(c.x, c.y + 6, CW, 3);
      g.fillStyle = ink;
      g.font = `italic 600 28px ${display}`;
      g.textAlign = 'center';
      g.fillText('Q', c.x + CW / 2, c.y + 50);
      g.font = `600 10px ${display}`;
      g.fillText(c.name.length > 13 ? `${c.name.slice(0, 12)}…` : c.name, c.x + CW / 2, c.y + CH - 12);
      g.restore();
    };
    const tick = () => {
      frame += 1;
      // trails fade slowly toward transparent rather than piling up forever
      g.save();
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = 'rgba(0,0,0,0.09)';
      g.fillRect(0, 0, W, H);
      g.restore();
      let any = false;
      for (const c of lap) {
        if (!c.alive || frame < c.start) { any = any || c.alive; continue; }
        c.vy += 0.42;
        c.x += c.vx;
        c.y += c.vy;
        if (c.y > floor) { c.y = floor; c.vy *= -0.78; }
        if (c.x < -CW - 10 || c.x > W + 10) c.alive = false;
        if (c.x < 0 && c.vx < 0) c.vx *= -1;
        if (frame % 3 === 0) draw(c);
        any = any || c.alive;
      }
      if (any && frame < 190) raf = requestAnimationFrame(tick);
      else finish();
    };
    const finish = () => {
      cancelAnimationFrame(raf);
      canvas.classList.add('is-done');
      window.setTimeout(() => done.current(), 420);
    };
    raf = requestAnimationFrame(tick);
    const skip = () => finish();
    canvas.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip); };
  }, [cards, from]);

  return <canvas ref={ref} className="victory-lap" aria-hidden="true" />;
}
