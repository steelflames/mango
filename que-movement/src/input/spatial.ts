// Geometric focus movement for the D-pad, stick and arrow keys: from the focused
// element, pick the nearest control in the pressed direction, preferring ones that
// line up with it. Works on any screen without per-screen wiring.

export type Dir = 'up' | 'down' | 'left' | 'right';

const FOCUSABLE = 'button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function isNavigable(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (!el.matches(FOCUSABLE)) return false;
  if ((el as HTMLButtonElement).disabled) return false;
  if (el.closest('[data-sim], [data-nav-skip], [inert], [aria-hidden="true"]')) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none') return false;
  return true;
}

export function candidates(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(isNavigable) as HTMLElement[];
}

/** The active layer: the top-most open dialog/menu, otherwise the app. */
export function activeRoot(): Element {
  const layers = Array.from(document.querySelectorAll('[data-layer]'));
  return layers[layers.length - 1] ?? document.getElementById('app') ?? document.body;
}

function inViewportOf(el: HTMLElement): boolean {
  // Controls scrolled out of sight inside a scroll box still count (we scroll to them),
  // but anything outside the window itself does not.
  const r = el.getBoundingClientRect();
  return r.right > 0 && r.bottom > 0 && r.left < window.innerWidth && r.top < window.innerHeight + 2000;
}

export function nextInDirection(from: HTMLElement, dir: Dir, root: Element = activeRoot()): HTMLElement | null {
  const a = from.getBoundingClientRect();
  const acx = a.left + a.width / 2, acy = a.top + a.height / 2;
  let best: HTMLElement | null = null, bestScore = Infinity;
  for (const el of candidates(root)) {
    if (el === from || el.contains(from) || from.contains(el) || !inViewportOf(el)) continue;
    const b = el.getBoundingClientRect();
    const bcx = b.left + b.width / 2, bcy = b.top + b.height / 2;
    let primary: number, overlap: number, secondaryGap: number;
    if (dir === 'right' || dir === 'left') {
      primary = dir === 'right' ? b.left - a.right : a.left - b.right;
      if ((dir === 'right' && bcx <= acx + 2) || (dir === 'left' && bcx >= acx - 2)) continue;
      overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      secondaryGap = overlap > 0 ? 0 : Math.abs(bcy - acy);
    } else {
      primary = dir === 'down' ? b.top - a.bottom : a.top - b.bottom;
      if ((dir === 'down' && bcy <= acy + 2) || (dir === 'up' && bcy >= acy - 2)) continue;
      overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      secondaryGap = overlap > 0 ? 0 : Math.abs(bcx - acx);
    }
    // Something that shares our column (for left/right) or row (for up/down) but doesn't
    // line up with us is really above/below (or beside) us — not in this direction.
    if (primary < -4 && overlap <= 0) continue;
    const score = Math.max(primary, -4) + secondaryGap * 2.2 + (overlap > 0 ? 0 : 40);
    if (score < bestScore) { bestScore = score; best = el; }
  }
  return best;
}

/** Bring a focused control into view inside whichever scroll box holds it. */
export function reveal(el: HTMLElement) {
  try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch { /* old browsers */ }
}

export function focusEl(el: HTMLElement | null) {
  if (!el) return;
  try { el.focus({ preventScroll: true }); } catch { el.focus(); }
  reveal(el);
}

export function firstIn(root: Element): HTMLElement | null {
  const preferred = root.querySelector('[data-autofocus]');
  if (isNavigable(preferred)) return preferred;
  return candidates(root)[0] ?? null;
}
