import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Layer } from './Layer';

// ---------------- menus: the "⋯" menus, Tidal-style, with a second step (Move to folder) ----------------
export interface MenuItem {
  label: string;
  onSelect?: () => void;
  checked?: boolean;
  disabled?: boolean;
  danger?: boolean;
  /** Opens a second list in place, with a Back row. */
  items?: MenuItem[];
  hint?: string;
}
interface MenuState { title: string; items: MenuItem[]; rect: DOMRect; stack: { title: string; items: MenuItem[] }[] }

// ---------------- confirm dialogs ----------------
interface ConfirmState { title: string; body: string; confirm: string; danger?: boolean; resolve: (ok: boolean) => void }

// ---------------- sheets: the details peek that slides in from the right ----------------
interface SheetState { eyebrow?: string; title: string; body: ReactNode }

// ---------------- a one-line text prompt (naming a folder) ----------------
interface AskState { title: string; label: string; placeholder?: string; confirm: string; resolve: (v: string | null) => void }

interface OverlayApi {
  openMenu: (anchor: HTMLElement | null, title: string, items: MenuItem[]) => void;
  closeMenu: () => void;
  confirm: (o: Omit<ConfirmState, 'resolve'>) => Promise<boolean>;
  ask: (o: Omit<AskState, 'resolve'>) => Promise<string | null>;
  openSheet: (s: SheetState) => void;
  closeSheet: () => void;
}

const Ctx = createContext<OverlayApi | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [dialog, setDialog] = useState<ConfirmState | null>(null);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [asking, setAsking] = useState<AskState | null>(null);

  const openMenu = useCallback((anchor: HTMLElement | null, title: string, items: MenuItem[]) => {
    const rect = anchor?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0);
    setMenu({ title, items, rect, stack: [] });
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);
  const confirm = useCallback((o: Omit<ConfirmState, 'resolve'>) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })), []);
  const ask = useCallback((o: Omit<AskState, 'resolve'>) => new Promise<string | null>((resolve) => setAsking({ ...o, resolve })), []);
  const openSheet = useCallback((s: SheetState) => setSheet(s), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const api = useMemo(() => ({ openMenu, closeMenu, confirm, ask, openSheet, closeSheet }), [openMenu, closeMenu, confirm, ask, openSheet, closeSheet]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {sheet && (
        <Layer label={sheet.title} onClose={closeSheet} backLabel="Close details" className="sheet">
          <header className="sheet__head">
            <div>
              {sheet.eyebrow && <p className="eyebrow">{sheet.eyebrow}</p>}
              <h2 className="sheet__title">{sheet.title}</h2>
            </div>
            <button type="button" className="icon-btn" aria-label="Close details" onClick={closeSheet}><CloseIcon /></button>
          </header>
          <div className="sheet__body scroll">{sheet.body}</div>
        </Layer>
      )}
      {menu && <MenuPanel menu={menu} setMenu={setMenu} />}
      {dialog && (
        <Layer label={dialog.title} onClose={() => { dialog.resolve(false); setDialog(null); }} backLabel="Cancel" className="dialog">
          <h2 className="dialog__title">{dialog.title}</h2>
          <p className="dialog__body">{dialog.body}</p>
          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" data-autofocus="" onClick={() => { dialog.resolve(false); setDialog(null); }}>Cancel</button>
            <button type="button" className={`btn ${dialog.danger ? 'btn--danger' : 'btn--primary'}`} onClick={() => { dialog.resolve(true); setDialog(null); }}>{dialog.confirm}</button>
          </div>
        </Layer>
      )}
      {asking && <AskDialog ask={asking} done={(v) => { asking.resolve(v); setAsking(null); }} />}
    </Ctx.Provider>
  );
}

function AskDialog({ ask, done }: { ask: AskState; done: (v: string | null) => void }) {
  const [value, setValue] = useState('');
  const ok = value.trim().length > 0;
  return (
    <Layer label={ask.title} onClose={() => done(null)} backLabel="Cancel" className="dialog">
      <form onSubmit={(e) => { e.preventDefault(); if (ok) done(value.trim()); }}>
        <h2 className="dialog__title">{ask.title}</h2>
        <label className="field">
          <span className="field__label">{ask.label}</span>
          <input className="field__input" data-autofocus="" autoFocus value={value} maxLength={40} placeholder={ask.placeholder} onChange={(e) => setValue(e.target.value)} />
        </label>
        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={() => done(null)}>Cancel</button>
          <button type="submit" className="btn btn--primary" aria-disabled={!ok || undefined}>{ask.confirm}</button>
        </div>
      </form>
    </Layer>
  );
}

function MenuPanel({ menu, setMenu }: { menu: MenuState; setMenu: (m: MenuState | null) => void }) {
  const W = 268;
  const rows = menu.items.length + (menu.stack.length ? 1 : 0);
  const H = 48 + rows * 46;
  let left = Math.min(window.innerWidth - W - 12, Math.max(12, menu.rect.right - W));
  let top = menu.rect.bottom + 6;
  if (top + H > window.innerHeight - 12) top = Math.max(12, menu.rect.top - H - 6);
  if (menu.rect.width === 0) { left = window.innerWidth / 2 - W / 2; top = Math.max(12, window.innerHeight / 2 - H / 2); }
  const back = () => {
    if (menu.stack.length) {
      const prev = menu.stack[menu.stack.length - 1];
      setMenu({ ...menu, title: prev.title, items: prev.items, stack: menu.stack.slice(0, -1) });
    } else setMenu(null);
  };
  return (
    <Layer label={menu.title} onClose={back} backLabel={menu.stack.length ? 'Back' : 'Close menu'} onScrim={() => setMenu(null)} className="menu" style={{ left, top, width: W }} scrim>
      <p className="menu__title">{menu.title}</p>
      <div role="menu" aria-label={menu.title} key={menu.title + menu.stack.length}>
        {menu.items.map((it, i) => (
          <button
            key={it.label + i}
            type="button"
            role={it.checked !== undefined ? 'menuitemradio' : 'menuitem'}
            aria-checked={it.checked}
            aria-disabled={it.disabled || undefined}
            data-autofocus={i === 0 ? '' : undefined}
            className={`menu__item ${it.danger ? 'is-danger' : ''}`}
            onClick={() => {
              if (it.disabled) return;
              if (it.items) setMenu({ ...menu, title: it.label, items: it.items, stack: [...menu.stack, { title: menu.title, items: menu.items }] });
              else { setMenu(null); it.onSelect?.(); }
            }}
          >
            <span className="menu__check" aria-hidden="true">{it.checked ? '✓' : ''}</span>
            <span className="menu__label">{it.label}{it.hint && <span className="menu__hint">{it.hint}</span>}</span>
            {it.items && <span aria-hidden="true" className="menu__after">›</span>}
          </button>
        ))}
        {menu.stack.length > 0 && (
          <button type="button" role="menuitem" className="menu__item" onClick={back}>
            <span className="menu__check" aria-hidden="true">‹</span><span className="menu__label">Back</span>
          </button>
        )}
      </div>
    </Layer>
  );
}

export function useOverlays(): OverlayApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('useOverlays must be used inside OverlayProvider');
  return c;
}

export function CloseIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}
