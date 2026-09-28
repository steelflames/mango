# Que Movement

*Build your movement vocabulary. Shape it into something worth performing.*

A cozy movement-programming deck builder set in a lantern-lit night market. The studio's charter, departments and design decisions live in [`docs/STUDIO_BIBLE.md`](docs/STUDIO_BIBLE.md).

Learn Techniques, collect Qcards, build them into Sequences, perform those Sequences in Play Mode, and spend what you earn on deeper Techniques while your Studio grows around you.

React 18 + Vite + TypeScript, plain CSS, `localStorage`. No backend, no login. Landscape tablets first, with mouse, touch, keyboard and Xbox controller all first-class.

## Run it

```bash
npm install
npm run dev          # local dev server
npm run build        # Vercel-ready static site in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

## The loop

**Learn → Collect → Build → Play → Earn → Unlock → Share.** The top bar always shows the next step.

| Section | What it is |
|---|---|
| **Lanterns** | A garland across the top: one lantern per Technique, lit when you know it. |
| **Technique** | The skill tree. One branch for now, Mat Fundamentals: Breath, then Bridging, Core and Shoulders paths (18 Techniques). A Technique opens when you know its parent, have *performed* a parent in a Sequence, and can pay its cost. Learning it creates its Qcard. |
| **Repertoire** | The workspace. Decks (one is primary; new Qcards are offered there first), All Qcards, Transitions, Progressions, Archive. Tap a Qcard to add it to the Sequence, or drag it onto the Sequence, onto a step (progressions) or onto a deck. Archive keeps cards out of the way without losing them. |
| **Harmonies** | Seven sequencing principles from the Pilates Council (Arrive, Rising Arc, Counterpose, Seamless, Economy, Whole Body, Settle). They light up live in the builder beside a class-arc curve, a teacher's note says what would make the Sequence sing, and they pay out at the end of a performance. |
| **Play** | A Sequence card by card, each dealt in with the Qcard alive. Completed cards stack on a solitaire-style pile; the last one sets off a victory lap and the Harmony ledger. Points: Foundation 10, Working 15, Challenge 20, transitions and progressions 5, plus a streak bonus. |
| **Rank & intentions** | Practice Rank rises with every point ever earned; each rank has a gift you claim and Studio pieces it opens. Three daily intentions (one gentle, one steady, one deep) pay a little extra and cost nothing to miss. |
| **In the Queue** | Three lanes. The Queue: a snap-scrolling feed (Popular, Newest, Saved, Yours) whose reels play themselves through. For you (swipe left): picks you could perform tonight, with the reason. Live (swipe right): a preview of teacher demonstrations and creator support. Any Sequence can be tried, saved, remixed or improved, and sent to a client as a class plan. The feed is simulated on this device. |
| **Studio** | Your page and your shop. Profile: studio name, mood, About me, the Sequence you're performing, a Top 8 of movers, Student and Teacher tracks. The room: badges on the shelf, mastery prints, the class board, Mochi the cat. Open for the evening and visitors walk in, read your board, and leave kudos and Guestbook notes keyed to its Harmonies. Decor unlocks through Rank, badges and Techniques. |
| **Sound** | One synthesised kalimba in a pentatonic key: cards pluck, streaks climb the scale, Harmonies ring. Settings › Sound turns it off. |

## How it's put together

```
src/
  content/            everything the game knows about, as plain data
    mat.ts              paths, Qcards and the Mat Fundamentals Technique tree
    catalog.ts          rules, badges, milestones (what earns each badge), skins
    studio.ts           Studio decor slots, variants, unlock conditions, titles
    progress.ts         Practice Rank thresholds and gifts, daily intentions
    community.ts        creators, moods, visitor lines, welcome notes
    seeds.ts            the sample In the Queue feed
    content.ts          indexes it all into one Content object
  game/               the rules, independent of any screen
    rules.ts            points, doses, seams, Technique status, milestones, rank, teacher standing, decor, the next step
    harmonies.ts        the Pilates Council's seven sequencing principles and the class arc
    reducer.ts          every game action; saves to localStorage (que-movement:v4)
    store.tsx           React context around the reducer
  input/              one input system for mouse, touch, keys and controller
  ui/                 frame and shared pieces: top bar + loop guide, tabs, Settings,
    art/                Qcard line art with two poses each; live cards breathe between them (SMIL)
    studio/Diorama.tsx  the isometric room, drawn from boxes and planes in SVG, with visitors and Mochi
    Garland.tsx         the lantern garland
    Harmonies.tsx       class arc, harmony row, teacher's note, the teachers' sheet
    Journey.tsx         rank ring, the Journey sheet, the intention ribbon
    SendToClient.tsx    the class plan and the send sheet
    VictoryLap.tsx      the solitaire victory lap (canvas)
    sound.ts, fly.ts    the kalimba; flying cards and the ceremony flag
  screens/            Technique · Repertoire · Play · In the Queue · Studio
    repertoire/         Sidebar (decks, collection, Sequences), Library, SequencePanel, drag.tsx
  styles/             tokens, shell, components, screens, que.css (game UI), night.css (the market after dark)
```

### Adding a Technique branch

Add Qcards and a `Branch` of `TechniqueNode`s (id, cardId, pathId, x/y on the tree, cost, requires) in a file like `content/mat.ts`, and draw each card's two poses in `ui/art/shapes.ts`. Every command in a pose's second path must match the first so the drawing can move between them.

### Controls

| | Mouse / touch | Keyboard | Xbox controller |
|---|---|---|---|
| Move the ring | — | Arrow keys | D-pad / left stick |
| Choose | Click / tap | Enter / Space | A |
| Back, close | ✕ or tap outside | Esc / Backspace | B |
| Card or step options | ⋯ | X | X |
| Screen's main action | the big button | Y | Y |
| Sections | tabs | Q / E, 1–5 | LB / RB |
| Sub-tabs, collections, reels | chips | [ / ] | LT / RT |
| Drag a Qcard | drag (touch: press and hold) | — | — |
| Settings | top right | Esc at top level | ☰ |

Settings › Motion turns off card motion; the device's reduced-motion setting is honoured by default.
