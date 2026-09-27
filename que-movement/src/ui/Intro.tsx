import { useStore } from '../game/store';
import { useInput } from '../input/InputProvider';
import { CardArt } from './art/CardArt';
import { Layer } from './Layer';
import { useNav } from './nav';

/** First visit only: what the game is, in three lines, and where Settings lives. */
export function Intro() {
  const { dispatch } = useStore();
  const { go } = useNav();
  const { mode } = useInput();
  const close = () => dispatch({ type: 'ui/seenIntro' });
  return (
    <Layer label="Welcome to Q Movement" onClose={close} backLabel="Begin" className="intro">
      <div className="intro__art" aria-hidden="true">
        <CardArt art="bridge-foundation" kind="movement" deckAccent="var(--sage)" />
        <CardArt art="scapula-foundation" kind="movement" deckAccent="var(--dusty-blue)" />
        <CardArt art="core-foundation" kind="movement" deckAccent="var(--aubergine)" />
      </div>
      <p className="eyebrow">Move · Learn · Teach · Belong</p>
      <h2 className="intro__title">Welcome to Q Movement</h2>
      <ol className="intro__steps">
        <li><strong>Choose from beautiful decks.</strong> Every movement comes at three depths — Foundation is complete on its own.</li>
        <li><strong>Build a short sequence.</strong> Mix decks, attach progressions, bridge changes of position.</li>
        <li><strong>Play it through.</strong> Practice opens new ways in; challenges bring badges and skins.</li>
      </ol>
      <p className="intro__input">
        {mode === 'pad'
          ? 'Controller ready: move with the D-pad, A to choose, B to go back, ☰ for Settings.'
          : 'Mouse, touch, keyboard or an Xbox controller — whatever you pick up. Settings is always top right (or Esc).'}
      </p>
      <div className="intro__actions">
        <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={() => { close(); go('library'); }}>Open the decks</button>
        <button type="button" className="btn btn--ghost" onClick={() => { close(); go('map'); }}>See the Q Map</button>
      </div>
    </Layer>
  );
}
