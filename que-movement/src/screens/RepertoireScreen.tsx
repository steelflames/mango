import { useStore } from '../game/store';
import { usePrimary, useTriggers } from '../input/InputProvider';
import { useNav } from '../ui/nav';
import { DragProvider } from './repertoire/drag';
import { collectionName, collections, resolveColl } from './repertoire/library';
import { Library } from './repertoire/Library';
import { SequencePanel } from './repertoire/SequencePanel';
import { Sidebar } from './repertoire/Sidebar';

/** Repertoire: the workspace. Decks and your collection on the left, Qcards in the middle,
 *  the Sequence you're making on the right. */
export function RepertoireScreen() {
  const { state, dispatch } = useStore();
  const { builder, setBuilder } = useNav();
  const colls = collections(state);
  const i = Math.max(0, colls.indexOf(resolveColl(builder.coll, state)));
  const step = (d: -1 | 1) => { const next = colls[i + d]; if (next) setBuilder({ coll: next }); };
  useTriggers(true, colls[i - 1] ? collectionName(colls[i - 1], state) : undefined, colls[i + 1] ? collectionName(colls[i + 1], state) : undefined, step);
  usePrimary(state.draftSlots.length > 0, 'Perform this Sequence', () => dispatch({ type: 'sequence/saveAndStart' }));

  return (
    <div className="screen builder">
      <header className="page-head page-head--tight">
        <div>
          <p className="eyebrow">Collect · Organise · Build</p>
          <h1 className="page-title">Repertoire</h1>
        </div>
        <p className="page-hint">Tap a Qcard to add it · drag it onto the Sequence or a deck · ⋯ to archive</p>
      </header>
      <DragProvider>
        <div className="builder__cols">
          <Sidebar />
          <Library />
          <SequencePanel />
        </div>
      </DragProvider>
    </div>
  );
}
