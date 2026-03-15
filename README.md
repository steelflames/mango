# QUE Cards — Pilates Class Planning App

A mobile-first exercise library and class planner for Pilates instructors.

## Features
- **QUE Cards**: searchable, filterable exercise library with tri-state tag filtering
- **Sequences**: reusable mini flows with variations, focus, and peak exercise
- **The Queue**: drag-and-drop class builder with grouping and sequence expansion
- **Studio**: saved class plans with tags
- **Queue Analyzer**: difficulty arc, coverage analysis, missing areas
- **Mobile optimized**: full-screen overlay panels, touch-friendly sizing

## Setup on Replit
1. Create a new Replit → Choose "Vite + React" template (or import from GitHub)
2. Replace all files with these project files
3. Click "Run" — the app starts on port 3000

## Setup locally
```bash
npm install
npm run dev
```

## Deploy
```bash
npm run build
# Serve the /dist folder with any static host (Netlify, Vercel, Replit Deployments)
npx serve dist -s
```

## Color Palette
- Forest green: `#2B4A3E` (brand, primary actions)
- Spring sage: `#7A9E8E` (accents)
- 70s Brown: `#8B6B4A` (sequences, warm accent)
- Burnt orange: `#C4703A` (peak exercises, highlights)
- Warm cream: `#F7F5F0` (backgrounds)

## Data Persistence
All data saved to localStorage:
- `que_exs` — exercises
- `que_tags` — tag categories
- `que_seqs` — sequences
- `que_queue` — current plan
- `que_plans` — saved plans
