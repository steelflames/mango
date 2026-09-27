import { createContext, useContext } from 'react';

export type SectionId = 'technique' | 'repertoire' | 'play' | 'queue' | 'studio';

export const SECTIONS: { id: SectionId; label: string; glyph: string }[] = [
  { id: 'technique', label: 'Technique', glyph: '✧' },
  { id: 'repertoire', label: 'Repertoire', glyph: '❋' },
  { id: 'play', label: 'Play', glyph: '▷' },
  { id: 'queue', label: 'In the Queue', glyph: '❀' },
  { id: 'studio', label: 'Studio', glyph: '⌂' }
];

export interface BuilderView {
  /** 'primary' | a deck id | 'all' | 'transition' | 'progression' | 'archive' */
  coll: string;
  query: string;
  level: 'all' | 'foundation' | 'working' | 'challenge';
  sortBy: 'path' | 'level' | 'position' | 'time' | 'az';
  sortDir: 1 | -1;
  view: 'grid' | 'list';
  selectedSlotId: string | null;
}

export const DEFAULT_BUILDER_VIEW: BuilderView = { coll: 'primary', query: '', level: 'all', sortBy: 'path', sortDir: 1, view: 'grid', selectedSlotId: null };

interface Nav {
  section: SectionId;
  go: (id: SectionId) => void;
  builder: BuilderView;
  setBuilder: (patch: Partial<BuilderView>) => void;
}

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const n = useContext(NavContext);
  if (!n) throw new Error('useNav must be used inside NavContext');
  return n;
}
