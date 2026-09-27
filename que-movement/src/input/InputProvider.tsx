import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { activeRoot, candidates, firstIn, focusEl, isNavigable, nextInDirection, type Dir } from './spatial';

// ------------------------------------------------------------------
// One input system for mouse, touch, keyboard and controller.
//  · Automatic: the last thing you used decides how the game shows itself.
//  · Settings can pin Mouse, Touch or Controller instead.
//  · Controller/keys move a gold focus ring; A = press, B = back, X = options,
//    Y = the screen's main action, LB/RB = sections, LT/RT = sub-tabs, ☰ = Settings.
// ------------------------------------------------------------------

export type Mode = 'mouse' | 'touch' | 'pad';
export type InputPref = 'auto' | 'mouse' | 'touch' | 'pad';
export type PadKey = Dir | 'a' | 'b' | 'x' | 'y' | 'lb' | 'rb' | 'lt' | 'rt' | 'menu';
export interface Prefs { input: InputPref; prompts: boolean; motion: 'device' | 'reduce' | 'full' }

interface Entry<T> { id: number; value: T }
interface BackValue { label: string; run: () => void }
interface PrimaryValue { label: string; run: () => void; enabled: boolean }
interface PairValue { prev?: string; next?: string; run: (dir: -1 | 1) => void }

export interface Prompts {
  a: string | null;
  b: string | null;
  x: string | null;
  y: string | null;
  lb: string | null;
  rb: string | null;
  lt: string | null;
  rt: string | null;
}

interface Section { id: string; label: string }

interface InputApi {
  mode: Mode;
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  press: (k: PadKey) => void;
  prompts: Prompts;
  paused: boolean;
  toast: (msg: string) => void;
  toastMsg: { id: number; msg: string } | null;
  push: <T>(kind: Kind, value: T) => number;
  pull: (kind: Kind, id: number) => void;
  refresh: () => void;
}

type Kind = 'back' | 'primary' | 'triggers' | 'bumpers' | 'layer' | 'dirs';

const Ctx = createContext<InputApi | null>(null);
const PREFS_KEY = 'q-movement:settings';

function loadPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    return { input: p.input ?? 'auto', prompts: p.prompts ?? true, motion: p.motion ?? 'device' };
  } catch {
    return { input: 'auto', prompts: true, motion: 'device' };
  }
}

function isTyping(el: Element | null) {
  return !!el && el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

function labelOf(el: HTMLElement | null): string | null {
  if (!el || !isNavigable(el)) return null;
  if (el.getAttribute('aria-disabled') === 'true') return null;
  if (el.dataset.a) return el.dataset.a;
  if (isTyping(el)) return 'Type';
  const aria = el.getAttribute('aria-label');
  const text = (aria ?? el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const first = text.split(',')[0].split(' · ')[0];
  return first ? (first.length > 30 ? first.slice(0, 29) + '…' : first) : 'Select';
}

export function InputProvider({ children, sections, section, goSection }: {
  children: ReactNode;
  sections: Section[];
  section: string;
  goSection: (id: string) => void;
}) {
  const [prefs, setPrefsState] = useState<Prefs>(loadPrefs);
  const [autoMode, setAutoMode] = useState<Mode>('mouse');
  const [keyedOverride, setKeyedOverride] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMsg, setToast] = useState<{ id: number; msg: string } | null>(null);
  const [tick, setTick] = useState(0);
  const stacks = useRef<Record<Kind, Entry<unknown>[]>>({ back: [], primary: [], triggers: [], bumpers: [], layer: [], dirs: [] });
  const ids = useRef(0);
  const lastFocus = useRef<HTMLElement | null>(null);
  const toastTimer = useRef<number>(0);

  const pinned = prefs.input === 'mouse' || prefs.input === 'touch';
  const mode: Mode = keyedOverride ? 'pad' : prefs.input === 'auto' ? autoMode : prefs.input;
  const refs = useRef({ mode, prefs, settingsOpen, section, sections, pinned });
  refs.current = { mode, prefs, settingsOpen, section, sections, pinned };

  const bump = useCallback(() => setTick((t) => t + 1), []);
  const push = useCallback(<T,>(kind: Kind, value: T) => {
    const id = (ids.current += 1);
    stacks.current[kind].push({ id, value });
    bump();
    return id;
  }, [bump]);
  const pull = useCallback((kind: Kind, id: number) => {
    stacks.current[kind] = stacks.current[kind].filter((e) => e.id !== id);
    bump();
  }, [bump]);
  const top = <T,>(kind: Kind) => stacks.current[kind][stacks.current[kind].length - 1]?.value as T | undefined;
  /** The newest registration of a kind — but only if it belongs to the top-most layer.
   *  (A screen's Y or LT/RT must not fire from underneath an open menu or sheet.) */
  const scoped = <T,>(kind: Kind) => {
    const layers = stacks.current.layer;
    const floor = layers[layers.length - 1]?.id ?? 0;
    const e = stacks.current[kind][stacks.current[kind].length - 1];
    return e && e.id > floor ? (e.value as T) : undefined;
  };
  const layerOpen = () => stacks.current.layer.length > 0;
  /** Set when the player is flipping through sections (LB/RB, number keys): the ring stays on the tabs. */
  const tabNav = useRef(false);

  const setPrefs = useCallback((p: Partial<Prefs>) => {
    setPrefsState((old) => {
      const next = { ...old, ...p };
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* fine */ }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.input = mode;
    document.documentElement.dataset.motion = prefs.motion;
  }, [mode, prefs.motion]);

  const toast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), msg });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const openSettings = useCallback(() => {
    lastFocus.current = document.activeElement as HTMLElement;
    setSettingsOpen(true);
  }, []);
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    setKeyedOverride(false);
    const back = lastFocus.current;
    window.setTimeout(() => { if (refs.current.mode === 'pad' && back && document.contains(back)) focusEl(back); }, 30);
  }, []);

  const focusTab = useCallback((id: string) => {
    window.setTimeout(() => focusEl(document.querySelector<HTMLElement>(`[data-tab="${id}"]`)), 30);
  }, []);

  const stepSection = useCallback((dir: -1 | 1) => {
    const { sections: list, section: cur } = refs.current;
    const i = list.findIndex((s) => s.id === cur);
    const next = list[Math.max(0, Math.min(list.length - 1, i + dir))];
    if (next && next.id !== cur) { tabNav.current = true; goSection(next.id); if (refs.current.mode === 'pad') focusTab(next.id); }
  }, [goSection, focusTab]);

  /** Put the ring somewhere sensible when a controller or key is first used. */
  const wake = useCallback(() => {
    const root = activeRoot();
    const cur = document.activeElement;
    if (isNavigable(cur) && root.contains(cur)) { focusEl(cur); return; }
    const tab = root.querySelector<HTMLElement>(`[data-tab="${refs.current.section}"]`);
    focusEl(tab && isNavigable(tab) ? tab : firstIn(root));
  }, []);

  const press = useCallback((k: PadKey) => {
    const r = refs.current;
    if (k === 'menu') {
      if (r.settingsOpen) closeSettings(); else { if (r.pinned) setKeyedOverride(true); openSettings(); }
      return;
    }
    if (k === 'b' && r.mode !== 'pad') {
      // Esc / B always means "back" straight away: close the open menu or sheet,
      // or, with nothing open, bring up Settings.
      const back = top<BackValue>('back');
      if (back) { back.run(); return; }
      if (r.pinned) setKeyedOverride(true); else if (r.prefs.input === 'auto') setAutoMode('pad');
      openSettings();
      return;
    }
    if (r.pinned && !r.settingsOpen) return; // Mouse or Touch is pinned: keys and pads only reach Settings.
    if (r.mode !== 'pad') {
      if (r.prefs.input === 'auto') setAutoMode('pad');
      window.setTimeout(wake, 0);
      if (k === 'lb' || k === 'rb') stepSection(k === 'lb' ? -1 : 1);
      return; // the first press only shows the ring
    }
    const active = document.activeElement as HTMLElement | null;
    switch (k) {
      case 'up': case 'down': case 'left': case 'right': {
        const steer = scoped<{ run: (d: Dir) => boolean }>('dirs');
        if (steer && steer.run(k)) return;
        const root = activeRoot();
        if (!isNavigable(active) || !root.contains(active)) { focusEl(firstIn(root)); return; }
        const next = nextInDirection(active, k, root);
        if (next) focusEl(next);
        return;
      }
      case 'a':
        if (isNavigable(active) && !isTyping(active) && active.getAttribute('aria-disabled') !== 'true') active.click();
        return;
      case 'b': {
        const back = top<BackValue>('back');
        if (back) { back.run(); return; }
        const tab = document.querySelector<HTMLElement>(`[data-tab="${r.section}"]`);
        if (tab && active !== tab) { focusEl(tab); return; }
        openSettings();
        return;
      }
      case 'x': {
        const host = active?.closest<HTMLElement>('[data-x]');
        const target = host ? document.getElementById(host.dataset.x!) : null;
        if (target) target.click();
        return;
      }
      case 'y': {
        const p = scoped<PrimaryValue>('primary');
        if (p && p.enabled) p.run();
        return;
      }
      case 'lb': case 'rb': {
        const b = scoped<PairValue>('bumpers');
        if (b) b.run(k === 'lb' ? -1 : 1); else if (!layerOpen()) stepSection(k === 'lb' ? -1 : 1);
        return;
      }
      case 'lt': case 'rt': {
        const t = scoped<PairValue>('triggers');
        if (t) t.run(k === 'lt' ? -1 : 1);
        return;
      }
    }
  }, [closeSettings, openSettings, stepSection, wake]);

  // ---------------- keyboard ----------------
  useEffect(() => {
    const map: Record<string, PadKey> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      Escape: 'b', Backspace: 'b', x: 'x', X: 'x', y: 'y', Y: 'y',
      q: 'lb', Q: 'lb', PageUp: 'lb', e: 'rb', E: 'rb', PageDown: 'rb', '[': 'lt', ']': 'rt'
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target as HTMLElement;
      if (isTyping(t)) {
        if (ev.key === 'Escape') { ev.preventDefault(); t.blur(); if (refs.current.mode === 'pad') focusEl(t); return; }
        if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
      }
      const r = refs.current;
      if (/^[1-9]$/.test(ev.key) && !r.settingsOpen && !r.pinned && !layerOpen()) {
        const s = r.sections[Number(ev.key) - 1];
        if (s) { ev.preventDefault(); tabNav.current = true; goSection(s.id); if (r.mode === 'pad') focusTab(s.id); }
        return;
      }
      let k = map[ev.key];
      if (!k && (ev.key === 'Enter' || ev.key === ' ')) {
        if (r.mode !== 'pad') return; // let the focused button click natively
        k = 'a';
      }
      if (!k) return;
      ev.preventDefault();
      press(k);
    };
    const onUp = (ev: KeyboardEvent) => { if (ev.key === ' ' && refs.current.mode === 'pad' && !isTyping(ev.target as Element)) ev.preventDefault(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onUp); };
  }, [press, goSection, focusTab]);

  // ---------------- pointer: the last thing touched decides ----------------
  useEffect(() => {
    const onDown = (ev: PointerEvent) => {
      if ((ev.target as Element)?.closest?.('[data-sim]')) return;
      if (refs.current.prefs.input !== 'auto') return;
      setAutoMode(ev.pointerType === 'touch' ? 'touch' : 'mouse');
    };
    window.addEventListener('pointerdown', onDown, true);
    return () => window.removeEventListener('pointerdown', onDown, true);
  }, []);

  // ---------------- gamepad ----------------
  useEffect(() => {
    let raf = 0;
    const held: Record<string, { on: boolean; next: number }> = {};
    const buttons: [PadKey, number][] = [['a', 0], ['b', 1], ['x', 2], ['y', 3], ['lb', 4], ['rb', 5], ['lt', 6], ['rt', 7], ['menu', 9]];
    const tick = (now: number) => {
      raf = 0;
      let pads: (Gamepad | null)[] = [];
      try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch { return; }
      const gp = pads.find((p) => p && p.connected);
      if (!gp) return;
      const btn = (i: number) => !!gp.buttons[i]?.pressed;
      const ax = gp.axes ?? [];
      const dz = 0.55;
      const dirs: Record<Dir, boolean> = {
        up: btn(12) || (ax[1] ?? 0) < -dz, down: btn(13) || (ax[1] ?? 0) > dz,
        left: btn(14) || (ax[0] ?? 0) < -dz, right: btn(15) || (ax[0] ?? 0) > dz
      };
      (Object.keys(dirs) as Dir[]).forEach((d) => {
        const s = (held[d] ??= { on: false, next: 0 });
        if (dirs[d] && !s.on) { s.on = true; s.next = now + 400; press(d); }
        else if (dirs[d] && now >= s.next) { s.next = now + 120; press(d); }
        else if (!dirs[d]) s.on = false;
      });
      for (const [k, i] of buttons) {
        const s = (held[k] ??= { on: false, next: 0 });
        const on = btn(i);
        if (on && !s.on) press(k);
        s.on = on;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('gamepadconnected', start);
    return () => { window.removeEventListener('gamepadconnected', start); if (raf) cancelAnimationFrame(raf); };
  }, [press]);

  // ---------------- keep prompts in step with the focused control ----------------
  useEffect(() => {
    const on = () => bump();
    document.addEventListener('focusin', on);
    document.addEventListener('focusout', on);
    return () => { document.removeEventListener('focusin', on); document.removeEventListener('focusout', on); };
  }, [bump]);

  // A new section: flipping tabs keeps the ring on the tabs; arriving any other way
  // (Y, A on a button, a started sequence) puts it on the new screen's main control.
  useEffect(() => {
    if (refs.current.mode !== 'pad') { tabNav.current = false; return; }
    const viaTabs = tabNav.current;
    tabNav.current = false;
    const t = window.setTimeout(() => {
      if (layerOpen()) return;
      const page = document.querySelector('.page');
      const auto = page?.querySelector<HTMLElement>('[data-autofocus]');
      if (!viaTabs && auto && isNavigable(auto)) { focusEl(auto); return; }
      const a = document.activeElement as HTMLElement | null;
      const tab = document.querySelector<HTMLElement>(`[data-tab="${section}"]`);
      if (!a || a === document.body || !document.contains(a) || (a.dataset.tab && a !== tab)) focusEl(tab);
    }, 60);
    return () => window.clearTimeout(t);
  }, [section]);

  // If a screen change removes the focused control, put the ring back somewhere useful.
  useEffect(() => {
    if (mode !== 'pad') return;
    const id = window.setInterval(() => {
      const a = document.activeElement;
      if (!a || a === document.body || !document.contains(a)) wake();
    }, 250);
    return () => window.clearInterval(id);
  }, [mode, wake]);

  const prompts = useMemo<Prompts>(() => {
    void tick;
    const active = document.activeElement as HTMLElement | null;
    const back = top<BackValue>('back');
    const prim = scoped<PrimaryValue>('primary');
    const pair = scoped<PairValue>('bumpers');
    const trig = scoped<PairValue>('triggers');
    const blocked = layerOpen() && !pair;
    const i = sections.findIndex((s) => s.id === section);
    const tab = document.querySelector(`[data-tab="${section}"]`);
    const host = active?.closest<HTMLElement>('[data-x]');
    return {
      a: labelOf(active),
      b: back ? back.label : active && active !== tab && !settingsOpen ? 'Back to sections' : 'Settings',
      x: host ? host.dataset.xLabel ?? 'Options' : null,
      y: prim && prim.enabled ? prim.label : null,
      lb: blocked ? null : pair ? pair.prev ?? null : sections[i - 1]?.label ?? null,
      rb: blocked ? null : pair ? pair.next ?? null : sections[i + 1]?.label ?? null,
      lt: trig ? trig.prev ?? null : null,
      rt: trig ? trig.next ?? null : null
    };
  }, [tick, section, sections, settingsOpen]);

  const paused = settingsOpen || stacks.current.layer.length > 0;

  const api = useMemo<InputApi>(() => ({
    mode, prefs, setPrefs, settingsOpen, openSettings, closeSettings, press, prompts, paused, toast, toastMsg, push, pull, refresh: bump
  }), [mode, prefs, setPrefs, settingsOpen, openSettings, closeSettings, press, prompts, paused, toast, toastMsg, push, pull, bump]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useInput(): InputApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('useInput must be used inside InputProvider');
  return c;
}

function useRegistration<T>(kind: Kind, active: boolean, value: T) {
  const { push, pull, refresh } = useInput();
  const ref = useRef(value);
  ref.current = value;
  const label = JSON.stringify(value, (_k, v) => (typeof v === 'function' ? undefined : v));
  useEffect(() => {
    if (!active) return;
    // Registered once while active (so stacking order stays true); the stored value
    // reads through the ref, so labels and handlers are always current.
    const proxy = new Proxy({}, { get: (_t, p) => (ref.current as Record<string | symbol, unknown>)[p] });
    const id = push(kind, proxy);
    return () => pull(kind, id);
  }, [active, kind, push, pull]);
  useEffect(() => { if (active) refresh(); }, [active, label, refresh]);
}

/** B: what "back" means while this is on screen (closing a menu, leaving a mode…). */
export function useBack(active: boolean, label: string, run: () => void) {
  useRegistration<BackValue>('back', active, { label, run });
}
/** Y: the screen's main action. */
export function usePrimary(active: boolean, label: string, run: () => void, enabled = true) {
  useRegistration<PrimaryValue>('primary', active, { label, run, enabled });
}
/** LT/RT: step through sub-tabs on this screen. */
export function useTriggers(active: boolean, prev: string | undefined, next: string | undefined, run: (dir: -1 | 1) => void) {
  useRegistration<PairValue>('triggers', active, { prev, next, run });
}
/** LB/RB: override section switching (Settings uses it for its own sections). */
export function useBumpers(active: boolean, prev: string | undefined, next: string | undefined, run: (dir: -1 | 1) => void) {
  useRegistration<PairValue>('bumpers', active, { prev, next, run });
}
/** Take over the D-pad for a moment (e.g. carrying a step while reordering). Return true when handled. */
export function useDirections(active: boolean, run: (dir: Dir) => boolean) {
  useRegistration<{ run: (d: Dir) => boolean }>('dirs', active, { run });
}
/** A modal layer: pauses Play, keeps focus inside, returns it on close. */
export function useLayer(active: boolean) {
  useRegistration<{ layer: true }>('layer', active, { layer: true });
}

export { candidates, focusEl, firstIn };
export type { Dir };
