import { useStore } from '../game/store';

/** Seasonal skins. Cosmetic only — used in Settings › Look and in My Studio. */
export function SkinPicker() {
  const { state, dispatch, content } = useStore();
  return (
    <div className="skins" role="radiogroup" aria-label="Skin">
      {content.themes.map((t) => {
        const open = state.unlockedThemeIds.includes(t.id);
        const on = state.themeId === t.id;
        return (
          <button key={t.id} type="button" role="radio" aria-checked={on} aria-disabled={!open || undefined}
            className={`skin ${on ? 'is-on' : ''} ${open ? '' : 'is-locked'}`}
            onClick={() => open && dispatch({ type: 'theme/set', themeId: t.id })}
            data-a={on ? 'Wearing' : open ? `Wear ${t.name}` : undefined}>
            <span className="skin__swatch" aria-hidden="true">
              {['--paper', '--forest', '--aubergine', '--gold'].map((v) => <i key={v} style={{ background: t.vars[v] }} />)}
            </span>
            <span className="skin__name">{on && <span aria-hidden="true">✓ </span>}{t.name}</span>
            <span className="skin__desc">{open ? t.description : `Earned with the ${content.challenges.find((c) => c.reward.themeId === t.id)?.name ?? 'a'} challenge`}</span>
          </button>
        );
      })}
    </div>
  );
}
