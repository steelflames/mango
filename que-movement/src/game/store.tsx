import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { buildContent } from '../content/content';
import type { Content } from '../content/types';
import { loadState, reduce, saveState } from './reducer';
import type { Action, GameState } from './types';

interface Store {
  state: GameState;
  dispatch: (a: Action) => void;
  content: Content;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer((s: GameState, a: Action) => reduce(s, a, buildContent(s.installedPackIds)), undefined, loadState);
  const content = useMemo(() => buildContent(state.installedPackIds), [state.installedPackIds]);
  useEffect(() => saveState(state), [state]);
  const value = useMemo(() => ({ state, dispatch, content }), [state, content]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
