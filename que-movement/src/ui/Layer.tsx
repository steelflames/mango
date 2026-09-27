import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { firstIn, focusEl, useBack, useInput, useLayer } from '../input/InputProvider';

/** The opener of the layer that closed most recently — so a sheet opened from a menu
 *  item (gone by the time the sheet mounts) hands focus back to whatever opened the menu. */
let recent: { el: HTMLElement | null; at: number } = { el: null, at: 0 };

/** A modal layer (menu, sheet, dialog, Settings): B closes it, the ring stays inside,
 *  and focus goes back to whatever opened it. Play pauses while one is open. */
export function Layer({ children, onClose, backLabel = 'Close', label, className = '', style, scrim = true, onScrim }: {
  children: ReactNode;
  onClose: () => void;
  backLabel?: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  scrim?: boolean;
  onScrim?: () => void;
}) {
  const { mode } = useInput();
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const ref = useRef<HTMLDivElement>(null);
  useLayer(true);
  useBack(true, backLabel, onClose);
  useEffect(() => {
    let opener = document.activeElement as HTMLElement | null;
    if ((!opener || opener === document.body || !document.contains(opener)) && performance.now() - recent.at < 200) opener = recent.el;
    const t = window.setTimeout(() => { if (modeRef.current === 'pad' && ref.current) focusEl(firstIn(ref.current)); }, 20);
    return () => {
      window.clearTimeout(t);
      recent = { el: opener, at: performance.now() };
      window.setTimeout(() => {
        if (modeRef.current !== 'pad' || !opener || !document.contains(opener)) return;
        // Only take focus back if nothing else (a newer layer) has claimed it.
        const a = document.activeElement;
        if (!a || a === document.body || !document.contains(a)) focusEl(opener);
      }, 20);
    };
  }, []);
  return (
    <div className="layer" data-layer="" role="dialog" aria-modal="true" aria-label={label}>
      {scrim && <button type="button" className="layer__scrim" tabIndex={-1} aria-label={`Close ${label}`} onClick={onScrim ?? onClose} data-nav-skip="" />}
      <div ref={ref} className={className} style={style}>{children}</div>
    </div>
  );
}
