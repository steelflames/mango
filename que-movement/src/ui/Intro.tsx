import { useStore } from '../game/store';
import { useInput } from '../input/InputProvider';
import { CardArt } from './art/CardArt';
import { Layer } from './Layer';
import { useNav } from './nav';

/** First visit only: the whole game in five lines, and where Settings lives. */
export function Intro() {
  const { dispatch } = useStore();
  const { go } = useNav();
  const { mode } = useInput();
  const close = () => dispatch({ type: 'ui/seenIntro' });
  return (
    <Layer label="Welcome to Que Movement" onClose={close} backLabel="Begin" className="intro">
      <div className="intro__art" aria-hidden="true">
        <CardArt art="bridge" kind="movement" accent="var(--forest)" live />
        <CardArt art="breathing" kind="movement" accent="var(--aubergine)" live />
        <CardArt art="scapular-glide" kind="movement" accent="var(--dusty-blue)" live />
      </div>
      <p className="eyebrow">The night market is open</p>
      <h2 className="intro__title">Welcome to Que Movement</h2>
      <ol className="intro__steps">
        <li><strong>Learn Techniques.</strong> Each one lights a lantern and becomes a Qcard. You start knowing four.</li>
        <li><strong>Build a Sequence</strong> in your Repertoire. The teachers’ seven Harmonies light up as you get the order right.</li>
        <li><strong>Perform it.</strong> Cards stack like a winning hand; Harmonies pay out at the end.</li>
        <li><strong>Grow.</strong> Spend points on deeper Techniques, rise in Rank, open your Studio to the market.</li>
      </ol>
      <p className="intro__input">
        {mode === 'pad'
          ? 'Controller ready: move with the D-pad, A to choose, B to go back, ☰ for Settings.'
          : 'Mouse, touch, keyboard or an Xbox controller: whatever you pick up. The Next step is always at the top.'}
      </p>
      <div className="intro__actions">
        <button type="button" className="btn btn--primary btn--big" data-autofocus="" onClick={() => { close(); go('repertoire'); }}>Build my first Sequence</button>
        <button type="button" className="btn btn--ghost" onClick={() => { close(); go('technique'); }}>See the Technique tree</button>
      </div>
    </Layer>
  );
}
