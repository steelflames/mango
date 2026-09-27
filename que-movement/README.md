# Q Movement

*Move · Learn · Teach · Belong.* A Pilates programming game: build short sequences from illustrated cue cards, play them through, and open new ways into each movement through practice.

React 18 + Vite + TypeScript, plain CSS, `localStorage`. No backend, no login, no payments. Landscape tablets first (10–13"), with mouse, touch, keyboard and Xbox controller all first-class.

## Run it

```bash
npm install
npm run dev          # local dev server
npm run build        # Vercel-ready static site in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

Vercel: import the folder (it picks up `vercel.json`: `npm run build` → `dist`), or drop the built `dist/` folder straight onto a static deploy.

## How it's put together

```
src/
  content/          everything the game knows about — plain data
    packs/core.ts     Bridging, Scapula, Core: decks, cards, challenges, skins, Q Map regions
    packs/balance.ts  Balance & Longevity expansion
    catalog.ts        rules (500-point cap, 12 steps, 2 progressions per card), expansions, badges
    content.ts        merges installed packs into one Content object
    seeds.ts          the sample community feed
  game/             the rules, independent of any screen
    rules.ts          points, streak bonus, doses, seams, challenges, unlocks
    reducer.ts        every game action; saves to localStorage (q-movement:v2, migrates v1)
    store.tsx         React context around the reducer
  input/            one input system for mouse, touch, keys and controller
    InputProvider.tsx last-input-wins mode, Settings pinning, gamepad polling, prompt bar labels
    spatial.ts        geometric D-pad navigation — works on any screen with no per-screen wiring
  ui/               frame and shared pieces: top bar, binder tabs, prompt bar, Settings,
                    menus/sheets/dialogs, the playing card, rewards, intro
  screens/          Q Map · Decks · Builder · Play · Challenges · Community · My Studio
    builder/          the music-library builder: Sidebar, Library (grid/list), Queue
  styles/           tokens.css (palette + derived colours), shell, components, screens
```

### Adding a pack

1. Add `src/content/packs/<name>.ts` exporting a `Pack` (decks, movement cards, transitions/progressions, challenges, skins, regions).
2. Add it to `PACKS` in `content.ts` and give it an entry in `expansions` in `catalog.ts`.

It then shows up everywhere: the Decks hand, the Builder library, the Q Map, Challenges and My Studio. Art keys live in `ui/art/shapes.ts`.

### Controls

| | Mouse / touch | Keyboard | Xbox controller |
|---|---|---|---|
| Move the ring | — | Arrow keys | D-pad / left stick |
| Choose | Click / tap | Enter / Space | A |
| Back, close | ✕ or tap outside | Esc / Backspace | B |
| Card or step options | ⋯ | X | X |
| Screen's main action | the big button | Y | Y |
| Sections | binder tabs | Q / E, 1–7 | LB / RB |
| Sub-tabs (collections, filters) | chips | [ / ] | LT / RT |
| Settings | top right | Esc at top level | ☰ |

Settings › Controls can pin Mouse, Touch or Controller; Automatic follows whatever was used last. Play's timer pauses whenever a menu, sheet or Settings is open.

### Game rules (unchanged from the original)

Foundation 10 pts · Working 15 · Challenge 20 · transitions and progressions 5. Streak bonus +2 for every three cards in a row inside the sequence (up to +10). Only the first 500 points count toward progression. Working opens after Foundation is practised and the deck is completed in a sequence; Challenge after Working is practised and its deck challenge is done. Skins are cosmetic only.
