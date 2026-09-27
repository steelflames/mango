import { createContext, useContext } from 'react';

export type SectionId = 'map' | 'library' | 'builder' | 'play' | 'challenges' | 'community' | 'studio';

export const SECTIONS: { id: SectionId; label: string; glyph: string }[] = [
  { id: 'map', label: 'Q Map', glyph: '✧' },
  { id: 'library', label: 'Decks', glyph: '❋' },
  { id: 'builder', label: 'Builder', glyph: '⌘' },
  { id: 'play', label: 'Play', glyph: '▷' },
  { id: 'challenges', label: 'Challenges', glyph: '◈' },
  { id: 'community', label: 'Community', glyph: '❀' },
  { id: 'studio', label: 'My Studio', glyph: '☾' }
];

export interface BuilderView {
  /** 'all' | a deck id | 'transition' | 'progression' */
  coll: string;
  query: string;
  level: 'all' | 'foundation' | 'working' | 'challenge';
  sortBy: 'deck' | 'level' | 'position' | 'time' | 'az';
  sortDir: 1 | -1;
  view: 'grid' | 'list';
  selectedSlotId: string | null;
}

export const DEFAULT_BUILDER_VIEW: BuilderView = { coll: 'all', query: '', level: 'all', sortBy: 'deck', sortDir: 1, view: 'grid', selectedSlotId: null };

interface Nav {
  section: SectionId;
  go: (id: SectionId) => void;
  builder: BuilderView;
  setBuilder: (patch: Partial<BuilderView>) => void;
  deckFocus: string | null;
  setDeckFocus: (id: string | null) => void;
}

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const n = useContext(NavContext);
  if (!n) throw new Error('useNav must be used inside NavContext');
  return n;
}
