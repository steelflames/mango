import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { useStore } from './game/store';
import { InputProvider, useInput } from './input/InputProvider';
import { BuilderScreen } from './screens/BuilderScreen';
import { ChallengesScreen } from './screens/ChallengesScreen';
import { CommunityScreen } from './screens/CommunityScreen';
import { DecksScreen } from './screens/DecksScreen';
import { MapScreen } from './screens/MapScreen';
import { PlayScreen } from './screens/PlayScreen';
import { StudioScreen } from './screens/StudioScreen';
import { collections } from './screens/builder/library';
import { Intro } from './ui/Intro';
import { DEFAULT_BUILDER_VIEW, NavContext, SECTIONS, type BuilderView, type SectionId } from './ui/nav';
import { OverlayProvider } from './ui/Overlays';
import { Rewards } from './ui/Rewards';
import { Settings } from './ui/Settings';
import { PortraitGuard, PromptBar, Tabs, Toast, TopBar } from './ui/Shell';

const SCREENS: Record<SectionId, ComponentType> = {
  map: MapScreen,
  library: DecksScreen,
  builder: BuilderScreen,
  play: PlayScreen,
  challenges: ChallengesScreen,
  community: CommunityScreen,
  studio: StudioScreen
};
const SECTION_KEY = 'q-movement:section';

function loadSection(): SectionId {
  try {
    const s = localStorage.getItem(SECTION_KEY) as SectionId | null;
    return s && s in SCREENS ? s : 'library';
  } catch { return 'library'; }
}

export function App() {
  const { state, content } = useStore();
  const [section, setSection] = useState<SectionId>(loadSection);
  const [builder, setBuilderState] = useState<BuilderView>(DEFAULT_BUILDER_VIEW);
  const [deckFocus, setDeckFocus] = useState<string | null>(null);
  const setBuilder = useCallback((p: Partial<BuilderView>) => setBuilderState((b) => ({ ...b, ...p })), []);
  const go = useCallback((id: SectionId) => setSection(id), []);

  useEffect(() => { try { localStorage.setItem(SECTION_KEY, section); } catch { /* fine */ } }, [section]);

  // Skins: set the palette on :root; everything else derives from it.
  useEffect(() => {
    const theme = content.themes.find((t) => t.id === state.themeId) ?? content.themes[0];
    const root = document.documentElement;
    if (!theme) return;
    for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(k, v);
    root.dataset.theme = theme.id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.vars['--paper-deep'] ?? '#d9ccae');
  }, [state.themeId, content]);

  // Starting a sequence from anywhere takes you to Play.
  const startedAt = state.play?.startedAt;
  useEffect(() => { if (startedAt) setSection('play'); }, [startedAt]);

  // If a pack is removed while its deck is showing in the Builder, fall back to All.
  useEffect(() => { if (!collections(content).includes(builder.coll)) setBuilder({ coll: 'all' }); }, [content, builder.coll, setBuilder]);

  const nav = useMemo(() => ({ section, go, builder, setBuilder, deckFocus, setDeckFocus }), [section, go, builder, setBuilder, deckFocus]);

  return (
    <NavContext.Provider value={nav}>
      <InputProvider sections={SECTIONS} section={section} goSection={go as (id: string) => void}>
        <OverlayProvider>
          <Frame section={section} />
        </OverlayProvider>
      </InputProvider>
    </NavContext.Provider>
  );
}

function Frame({ section }: { section: SectionId }) {
  const { state } = useStore();
  const { settingsOpen } = useInput();
  const Screen = SCREENS[section];
  const label = SECTIONS.find((s) => s.id === section)?.label;
  return (
    <>
      <div id="app" className="app">
        <TopBar />
        <div className="desk">
          <main className="page" key={section} aria-label={label}>
            <Screen />
          </main>
          <Tabs />
        </div>
        <PromptBar />
      </div>
      {settingsOpen && <Settings />}
      <Rewards />
      {!state.seenIntro && <Intro />}
      <Toast />
      <PortraitGuard />
    </>
  );
}
