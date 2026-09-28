import { useState } from 'react';
import { useStore } from '../game/store';
import { useBumpers, useInput, type InputPref, type Prefs } from '../input/InputProvider';
import { Layer } from './Layer';
import { CloseIcon, useOverlays } from './Overlays';
import { SkinPicker } from './SkinPicker';
import { setSoundEnabled, sfx } from './sound';

const CATS = [
  { key: 'controls', label: 'Controls', glyph: '◎' },
  { key: 'motion', label: 'Motion', glyph: '∿' },
  { key: 'sound', label: 'Sound', glyph: '♪' },
  { key: 'look', label: 'Look', glyph: '◐' },
  { key: 'data', label: 'Game data', glyph: '❋' }
] as const;

function Options<T extends string | boolean>({ label, value, options, onPick }: {
  label: string;
  value: T;
  options: [T, string][];
  onPick: (v: T) => void;
}) {
  return (
    <div className="seg-options" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={value === v} className={`chip ${value === v ? 'is-on' : ''}`} onClick={() => onPick(v)}>
          {value === v && <span aria-hidden="true">✓</span>}{text}
        </button>
      ))}
    </div>
  );
}

/** Settings: on every screen (top right, Esc, or ☰ on a controller). */
export function Settings() {
  const { prefs, setPrefs, closeSettings } = useInput();
  const { state, dispatch } = useStore();
  const { confirm } = useOverlays();
  const [cat, setCat] = useState(0);
  useBumpers(true, CATS[cat - 1]?.label, CATS[cat + 1]?.label, (d) => setCat((c) => Math.max(0, Math.min(CATS.length - 1, c + d))));
  const key = CATS[cat].key;

  return (
    <Layer label="Settings" onClose={closeSettings} backLabel="Close settings" className="settings">
      <header className="settings__head">
        <div>
          <p className="eyebrow">On every screen · Esc or ☰ opens it</p>
          <h2 className="settings__title">Settings</h2>
        </div>
        <button type="button" className="icon-btn" aria-label="Close settings" onClick={closeSettings}><CloseIcon /></button>
      </header>
      <div className="settings__body">
        <div className="settings__cats" role="tablist" aria-orientation="vertical" aria-label="Settings sections">
          {CATS.map((c, i) => (
            <button key={c.key} type="button" role="tab" aria-selected={i === cat} className={`settings__cat ${i === cat ? 'is-on' : ''}`} onClick={() => setCat(i)} onFocus={() => setCat(i)} data-autofocus={i === cat ? '' : undefined}>
              <span aria-hidden="true" className="settings__glyph">{c.glyph}</span>{c.label}
            </button>
          ))}
        </div>
        <div className="settings__panel scroll" role="tabpanel" aria-label={CATS[cat].label}>
          {key === 'controls' && (
            <>
              <section className="setting">
                <h3>Input</h3>
                <p>Automatic follows whatever you used last — a click, a tap, a key or a controller. Pick one to keep its prompts on screen. Controller also covers the arrow keys.</p>
                <Options<InputPref> label="Input" value={prefs.input} onPick={(v) => setPrefs({ input: v })}
                  options={[['auto', 'Automatic'], ['mouse', 'Mouse'], ['touch', 'Touch'], ['pad', 'Controller']]} />
              </section>
              <section className="setting">
                <h3>Button prompts</h3>
                <p>Show what A, B, X and Y will do, along the bottom of the screen.</p>
                <Options<boolean> label="Button prompts" value={prefs.prompts} onPick={(v) => setPrefs({ prompts: v })} options={[[true, 'Show'], [false, 'Hide']]} />
              </section>
              <p className="setting__note">Esc on a keyboard, or ☰ on a controller, always brings you back here — even if you have picked Mouse or Touch. Number keys 1–5 jump straight to a section.</p>
            </>
          )}
          {key === 'motion' && (
            <section className="setting">
              <h3>Motion</h3>
              <p>Lifts, slides and fades as cards and tabs move.</p>
              <Options<Prefs['motion']> label="Motion" value={prefs.motion} onPick={(v) => setPrefs({ motion: v })}
                options={[['device', 'Match this device'], ['reduce', 'Reduced'], ['full', 'Full']]} />
            </section>
          )}
          {key === 'sound' && (
            <section className="setting">
              <h3>Sound</h3>
              <p>A soft kalimba: cards pluck as they join a Sequence, a streak climbs the scale, the teachers’ Harmonies ring out at the end.</p>
              <Options<boolean> label="Sound" value={prefs.sound} onPick={(v) => { setPrefs({ sound: v }); setSoundEnabled(v); if (v) sfx.harmony(0); }} options={[[true, 'On'], [false, 'Off']]} />
            </section>
          )}
          {key === 'look' && (
            <section className="setting">
              <h3>Seasonal skins</h3>
              <p>Cosmetic only. A skin never changes an exercise, its level, or how anything unlocks.</p>
              <SkinPicker />
            </section>
          )}
          {key === 'data' && (
            <section className="setting">
              <h3>Progress on this device</h3>
              <p>{state.points} points to spend · {state.lifetimePoints} earned in all · {state.badgeIds.length} badges · {state.ownedCardIds.length} Qcards · {state.sequences.filter((s) => !s.seeded).length} Sequences.</p>
              <div className="seg-options">
                <button type="button" className="chip chip--danger" onClick={async () => {
                  const ok = await confirm({ title: 'Reset all progress?', body: 'Points, Techniques, Qcards, decks, badges, Sequences and your Studio on this device start over. Settings stay as they are.', confirm: 'Reset progress', danger: true });
                  if (ok) dispatch({ type: 'game/reset' });
                }}>Reset all progress</button>
              </div>
            </section>
          )}
        </div>
      </div>
    </Layer>
  );
}
