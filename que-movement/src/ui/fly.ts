import { useSyncExternalStore } from 'react';

// Small pieces of stagecraft shared across screens: a card flying from one place to another,
// and the "ceremony" flag that holds other overlays back while a celebration plays.

export function motionReduced(): boolean {
  const pref = document.documentElement.dataset.motion;
  if (pref === 'reduce') return true;
  if (pref === 'full') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

type Box = { left: number; top: number; width: number; height: number };

/** Lift a copy of `from` and arc it into `to`, shrinking as it lands. */
export function fly(from: Element | null | undefined, to: Element | Box | null | undefined, opts: { duration?: number; rotate?: number; lift?: number } = {}) {
  if (!from || !to || motionReduced()) return;
  const a = from.getBoundingClientRect();
  const b = to instanceof Element ? to.getBoundingClientRect() : to;
  if (!a.width || !b.width) return;
  const clone = from.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  Object.assign(clone.style, {
    position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    margin: '0', zIndex: '96', pointerEvents: 'none', transformOrigin: 'center', willChange: 'transform, opacity'
  });
  clone.classList.add('is-flying');
  document.body.appendChild(clone);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = Math.max(0.18, Math.min(1, Math.min(b.width / a.width, b.height / a.height)));
  const r = opts.rotate ?? (dx > 0 ? 8 : -8);
  const lift = opts.lift ?? 70;
  const anim = clone.animate([
    { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(${(1 + s) / 2}) rotate(${r / 2}deg)`, opacity: 1, offset: 0.45 },
    { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(${r}deg)`, opacity: 0.35 }
  ], { duration: opts.duration ?? 560, easing: 'cubic-bezier(.45,0,.25,1)' });
  anim.onfinish = () => clone.remove();
  anim.oncancel = () => clone.remove();
}

/** Where a card tapped in the library should land: just under the last step of the Sequence. */
export function sequenceLanding(): Box | null {
  const list = document.querySelector('.queue__list');
  if (!list) return null;
  const r = list.getBoundingClientRect();
  const rows = list.querySelectorAll('[data-slot-row]');
  const last = rows[rows.length - 1]?.getBoundingClientRect();
  const top = last ? Math.min(last.bottom + 6, r.bottom - 40) : r.top + 24;
  return { left: r.left + 40, top, width: 52, height: 34 };
}

// ---------------- the ceremony flag ----------------
let ceremony = false;
const listeners = new Set<() => void>();
export function setCeremony(on: boolean) {
  if (ceremony === on) return;
  ceremony = on;
  listeners.forEach((l) => l());
}
export function useCeremony() {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => ceremony, () => false);
}
