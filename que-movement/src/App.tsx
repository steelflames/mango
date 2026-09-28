import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { useStore } from './game/store';
import { InputProvider, useInput } from './input/InputProvider';
import { PlayScreen } from './screens/PlayScreen';
import { QueueScreen } from './screens/QueueScreen';
import { RepertoireScreen } from './screens/RepertoireScreen';
import { StudioScreen } from './screens/StudioScreen';
import { TechniqueScreen } from './screens/TechniqueScreen';
import { Garland } from './ui/Garland';
import { Intro } from './ui/Intro';
import { IntentionRibbon } from './ui/Journey';
import { DEFAULT_BUILDER_VIEW, NavContext, SECTIONS, type BuilderView, type SectionId } from './ui/nav';
import { OverlayProvider } from './ui/Overlays';
import { Rewards } from './ui/Rewards';
import { Settings } from './ui/Settings';
import { setSoundEnabled } from './ui/sound';
import { PortraitGuard, PromptBar, Tabs, Toast, TopBar } from './ui/Shell';

const SCREENS: Record<SectionId, ComponentType> = {
  technique: TechniqueScreen,
  repertoire: RepertoireScreen,
  play: PlayScreen,
  queue: QueueScreen,
  studio: StudioScreen
};
const SECTION_KEY = 'que-movement:section';

function loadSection(): SectionId {
  try {
    const s = localStorage.getItem(SECTION_KEY) as SectionId | null;
    return s && s in SCREENS ? s : 'technique';
  } catch { return 'technique'; }
}

export function App() {
  const { state, content } = useStore();
  const [section, setSection] = useState<SectionId>(loadSection);
  const [builder, setBuilderState] = useState<BuilderView>(DEFAULT_BUILDER_VIEW);
  const setBuilder = useCallback((p: Partial<BuilderView>) => setBuilderState((b) => ({ ...b, ...p })), []);
  const go = useCallback((id: SectionId) => setSection(id), []);

  useEffect(() => { try { localStorage.setItem(SECTION_KEY, section); } catch { /* fine */ } }, [section]);

  // Skins: set the palette on :root; everything else derives from it.
  useEffect(() => {
    const theme = content.themes.find((t) => t.id === state.themeId) ?? content.themes[0];
    const root = document.documentElement;
    for (const [k, v] of Object.entries(theme.vars)) root.style.setProperty(k, v);
    root.dataset.theme = theme.id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.vars['--paper-deep'] ?? '#d9ccae');
  }, [state.themeId, content]);

  // Starting a Sequence from anywhere takes you to Play.
  const startedAt = state.play?.startedAt;
  useEffect(() => { if (startedAt) setSection('play'); }, [startedAt]);

  // A deleted deck can't stay on screen in the Repertoire.
  useEffect(() => {
    const c = builder.coll;
    if (c.startsWith('d-') && !state.decks.some((d) => d.id === c)) setBuilder({ coll: 'primary' });
  }, [state.decks, builder.coll, setBuilder]);

  const nav = useMemo(() => ({ section, go, builder, setBuilder }), [section, go, builder, setBuilder]);

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
  const { settingsOpen, prefs } = useInput();
  useEffect(() => setSoundEnabled(prefs.sound), [prefs.sound]);
  const Screen = SCREENS[section];
  const label = SECTIONS.find((s) => s.id === section)?.label;
  return (
    <>
      <div id="app" className="app">
        <Garland />
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
      <IntentionRibbon />
      {!state.seenIntro && <Intro />}
      <Toast />
      <PortraitGuard />
    </>
  );
}
