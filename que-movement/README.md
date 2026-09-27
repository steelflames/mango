# Que Movement

*Build your movement vocabulary. Shape it into something worth performing.*

A cozy movement-programming deck builder. Learn Techniques, collect Qcards, build them into Sequences, perform those Sequences in Play Mode, and spend what you earn on deeper Techniques while your Studio grows around you.

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
| **Technique** | The skill tree. One branch for now, Mat Fundamentals: Breath, then Bridging, Core and Shoulders paths (18 Techniques). A Technique opens when you know its parent, have *performed* a parent in a Sequence, and can pay its cost. Learning it creates its Qcard. |
| **Repertoire** | The workspace. Decks (one is primary; new Qcards are offered there first), All Qcards, Transitions, Progressions, Archive. Tap a Qcard to add it to the Sequence, or drag it onto the Sequence, onto a step (progressions) or onto a deck. Archive keeps cards out of the way without losing them. |
| **Play** | A Sequence card by card, each dealt in with the Qcard alive. Completing cards earns points (Foundation 10, Working 15, Challenge 20, transitions and progressions 5, plus a streak bonus). |
| **In the Queue** | A vertical, snap-scrolling feed of community Sequences that play themselves through. Save, try, or remix into your Repertoire. The feed is simulated on this device. |
| **Studio** | An isometric room: badges on the shelf, path mastery on the wall, your pinned Sequence on the class board. Walls, floor, rug, mat, equipment, plant, light and props unlock through badges, Techniques and points. |

## How it's put together

```
src/
  content/            everything the game knows about, as plain data
    mat.ts              paths, Qcards and the Mat Fundamentals Technique tree
    catalog.ts          rules, badges, milestones (what earns each badge), skins
    studio.ts           Studio decor slots, variants, unlock conditions, titles
    seeds.ts            the sample In the Queue feed
    content.ts          indexes it all into one Content object
  game/               the rules, independent of any screen
    rules.ts            points, doses, seams, Technique status, milestones, decor, the next step
    reducer.ts          every game action; saves to localStorage (que-movement:v4)
    store.tsx           React context around the reducer
  input/              one input system for mouse, touch, keys and controller
  ui/                 frame and shared pieces: top bar + loop guide, tabs, Settings,
    art/                Qcard line art with two poses each; live cards breathe between them (SMIL)
    studio/Diorama.tsx  the isometric room, drawn from boxes and planes in SVG
  screens/            Technique · Repertoire · Play · In the Queue · Studio
    repertoire/         Sidebar (decks, collection, Sequences), Library, SequencePanel, drag.tsx
  styles/             tokens, shell, components, screens, que.css (tree, reels, Studio, motion)
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
