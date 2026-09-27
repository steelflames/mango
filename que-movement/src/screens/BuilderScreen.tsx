import { useStore } from '../game/store';
import { usePrimary, useTriggers } from '../input/InputProvider';
import { useNav } from '../ui/nav';
import { collectionName, collections } from './builder/library';
import { Library } from './builder/Library';
import { Queue } from './builder/Queue';
import { Sidebar } from './builder/Sidebar';

/** The Sequence Builder, laid out like a music library: collections on the left,
 *  cover-art cards in the middle, your build as a playlist on the right. */
export function BuilderScreen() {
  const { state, dispatch, content } = useStore();
  const { builder, setBuilder } = useNav();
  const colls = collections(content);
  const i = Math.max(0, colls.indexOf(builder.coll));
  const step = (d: -1 | 1) => { const next = colls[i + d]; if (next) setBuilder({ coll: next }); };
  useTriggers(true, colls[i - 1] ? collectionName(colls[i - 1], content) : undefined, colls[i + 1] ? collectionName(colls[i + 1], content) : undefined, step);
  usePrimary(state.draftSlots.length > 0, 'Start sequence', () => dispatch({ type: 'sequence/saveAndStart' }));

  return (
    <div className="screen builder">
      <header className="page-head page-head--tight">
        <div>
          <p className="eyebrow">Choose decks · Attach progressions · Bridge the seams</p>
          <h1 className="page-title">Sequence Builder</h1>
        </div>
      </header>
      <div className="builder__cols">
        <Sidebar />
        <Library />
        <Queue />
      </div>
    </div>
  );
}
