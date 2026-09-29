# Pilates Council Review · Mat Fundamentals

**Status: DRAFT for educator sign-off.** Nothing here has been approved by a certified educator yet. This review was drafted on the Council's behalf to widely taught classical and contemporary principles. It needs line-by-line approval from **Margot Feld** (Head of Movement Education) and the rehab-informed and athletic-conditioning Council seats before launch. It is not medical advice and claims no certification.

Scope: the 15 movement cards, 5 transitions, 3 progressions and the Technique tree in `src/content/mat.ts`; the Harmonies in `src/game/harmonies.ts`; the six seeds in `src/content/seeds.ts`; `classPlan` in `src/ui/SendToClient.tsx`. New content lives in `src/content/teaching.ts`.

---

## 1. Corrections made

All of these are data or text changes. No ids, types, logic or UI changed. All six seeds are still valid, and every seam in them is still bridged. `npx tsc` passes.

| Where | Change | Why |
|---|---|---|
| `mat.ts` · Swan Preparation `shortCue` | "Slide the shoulder blades down and let the chest glide…" → "Lengthen through the crown, then let the breastbone glide forward and up." | Heavy "shoulders down" cueing in prone extension tends to make people grip and pinch. Contemporary teaching leads with length and lets the shoulders sit wide. The card's own goal is "without pinching". |
| `mat.ts` · Single-Leg Bridge `shortCue` | "Lift from the standing leg…" → "Press through the grounded foot to lift; both hips stay level as you rise." | In supine there is no "standing" leg, which confuses newer movers. The new cue names the fault (a dropping hip) positively. |
| `mat.ts` · Log Roll to Side `shortCue` | "Lower with control, then roll…" → "Draw the knees together and roll to one side as one piece." | "Lower" what? The transition can follow any supine card, not only a Bridge. |
| `mat.ts` · Longer Lever `shortCue` | "Reach the limb further away from its joint." → "Reach the limb longer, only as far as the centre stays steady." | A lever progression needs its own brake built in. |
| `mat.ts` · tree: `n-roll-up` requires | `['n-toe-taps']` → `['n-hundred-prep']` | Roll Up starts with the curl you learn in Hundred Preparation, and classical order puts the Hundred before the Roll Up. Toe Taps teaches leg-and-hip dissociation, not articulation. Existing saves are unaffected: owned cards stay owned, and Teaser Preparation still requires both. On the tree this draws a short vertical line between two siblings. |
| `seeds.ts` · Ten-Minute Centre | `breathing, dead-bug, toe-taps, hundred-prep, roll-up` → `breathing, toe-taps, hundred-prep, roll-up, dead-bug` | Toe Taps is the regression of Dead Bug, so it should come first. The old order also sent a *new client* home straight after their hardest, most flexed card. The ladder still climbs, then comes down to a neutral spine. Arrive, Rising Arc and Settle are now met. Counterpose and Whole Body are left open as honest remix bait: "add a Bridge". |
| `seeds.ts` · Hands, Then Heart | Swapped Plank Scapular Control and Swan Preparation | The seed's own note is "Onto the hands, then open the front of the body". Ending on a plank contradicts it, and Plank → Swan → rest is the order a teacher would use. The peak now sits in the middle. |
| `harmonies.ts` · Counterpose `says` | Added "After you curl, open the front of the body." | This makes explicit what the rule accepts (see sign-off item 1). **`docs/STUDIO_BIBLE.md` quotes the old line; please update its Harmonies table.** |
| `harmonies.ts` · Rising Arc hint | "Everything sits at the same effort…" → "Nothing climbs above where you began. Open gentler, or add a progression to X so the work builds." | The branch also fires when you *open* on your hardest card and then drop, so "everything sits at the same effort" was sometimes untrue. |
| `harmonies.ts` · other hints | Economy: "Gather cards that share a position so there are two at most." Settle: "Close with something quieter, such as X." Counterpose fallback: "open the front of the body". "toward" → "towards". | Voice and spelling polish. "Such as" softens a suggestion that is sometimes the wrong position (see Recommendation 3). |

**Checked and left as they are:** every `dose`, `level` and `intensity`, and the other positions and costs. They are within normal teaching ranges. Doubtful ones are listed under sign-off.

**New file, `src/content/teaching.ts`:** it covers all 15 movements (setup, breath, 3–4 cues, 2–3 watch-fors, an easier and a harder variation, and take-care notes) and all 8 transitions and progressions. It uses British spelling and imagery over anatomy. It avoids "engage your core" and never says to push through pain. Take-care notes name general populations (low bone density, pregnancy and postnatal, sensitive wrists) and always send people to their teacher or clinician. They never diagnose.

---

## 2. Recommendations not made (bigger changes, need a decision)

1. **Swap Dead Bug and Toe Taps on the tree.** Toe Taps (one leg moves from tabletop) is the regression of Dead Bug (opposite arm and leg on a longer lever). The tree teaches them backwards. The fix needs the two nodes' `x/y`, `requires` and `cost` swapped, so Toe Taps becomes the free starter and Dead Bug costs 25. It also changes the starter set for *new* players and needs a save note: existing players keep Dead Bug. I didn't make this change because layout is outside the Council's remit.
2. **Separate spine from hip, and give Counterpose a proper rule.** Bridge, Bridge March and Single-Leg Bridge are tagged `spine: 'extension'`, but the spine stays neutral in a bridge. What extends is the hip. The tag is doing double duty so that a Bridge can answer flexion, which many teachers accept. *Proposed:* add an `opens?: 'front'` (or `hip: 'extension'`) field. Counterpose is **met** by a spinal extension (Swan) within the next two movements after the last flexion card, and **partly met** (half points) by a hip-extension card. Today any extension anywhere later counts, even ten cards on.
3. **Arrive and Settle hints should respect position.** Both suggest Scapular Glide (seated) whenever the player owns it. For an all-supine class, or one that ends prone, that sends the player into a new position change and can break Economy. *Proposed:* suggest a calm card in the Sequence's current position first (Supine Breathing for supine), and the other only if there isn't one.
4. **Economy should scale, and follow a gravity ladder.** "Two changes at most" suits five to seven cards. A 12-card class that goes supine → side → quadruped → prone → kneeling is also well taught. *Proposed "Gravity Ladder" rule:* the route never returns to a position it has left, and changes ≤ max(2, ⌊movements ÷ 3⌋). What teachers actually say is "don't go up and down off the floor".
5. **Whole Body counts Supine Breathing as the centre.** Breathing + Bridge + Scapular Glide meets it without any real centre work. *Proposed:* only cards with intensity ≥ 2 count towards Whole Body.
6. **A missing Harmony, "Kind to Wrists":** the rehab seat would ask for it first for this audience. *Proposed:* open if more than two hand-loaded cards (Quad Press, Bird Dog, Plank) run back to back without a break. Hint: "Give the wrists a rest: sit back or change position between them."
7. **A missing Harmony, "Every Direction" (needs new cards).** The `Spine` type has `rotation` and `lateral`, but no card uses them. A balanced mat class moves the spine in all five directions. *Proposed:* met when a Sequence of 6+ movements includes flexion, extension and rotation or lateral.
8. **Cards to add, in priority order:**
   - Rest Position (child's pose), as the natural counter after prone extension, a wrist break and a Settle card
   - Spine Twist or Seated Rotation, and Mermaid or Side Bend, to fill rotation and lateral
   - Chest Lift, the gap between Toe Taps and Hundred/Roll Up
   - Swimming Prep or Single Leg Kick, so Swan isn't the only extension
   - Standing Roll Down, so a class can end standing (`standing` exists but has no card)
   - Side-Lying Leg Series
9. **Rising Arc accepts a peak anywhere but first and last.** A peak at card 2 of 10 passes. *Proposed:* the peak sits between 30% and 80% of the way through.
10. **Dose units.** Hundred Preparation is better dosed in breath cycles (for example, "4 breath cycles") than seconds, and per-side holds need a dose label. This is a type change for Engineering.

---

## 3. Needs educator sign-off

Items marked ⚠ are ones I am least confident about. Please tick or amend each.

- [ ] ⚠ **1. Bridges tagged `spine: 'extension'`** (bridge, bridge-march, single-leg-bridge). Kept on purpose so a Bridge can answer flexion (see Recommendation 2). Retagging to `neutral` would leave Swan Preparation as the only extension card. Full Harmony would then be very hard to reach, because a Swan finish can't meet Settle.
- [ ] ⚠ **2. Take-care wording for low bone density, pregnancy and postnatal, and abdominal surgery** on Hundred Prep, Roll Up, Teaser Prep, Dead Bug, Toe Taps, Swan Prep and Plank. It is drafted to be general and cautious. It needs the rehab seat's approval, and ideally a clinician's read before launch.
- [ ] ⚠ **3. Breath patterns.** Schools differ, and some cue the opposite breath for Bridge and Roll Up. I used the most common contemporary pattern: exhale on effort, and inhale to extend in Swan. Confirm the house pattern.
- [ ] 4. Intensities that sit on the line: **Quad Press 3** (arguably 2, since it is the first weight-bearing shoulder card), **Swan Prep 3** (arguably 2), **Teaser Prep 5** (a *prep* at the ceiling of the scale), and **Clam 2** (arguably 1).
- [ ] 5. **Plank Scapular Control as `prone`.** "Prone plank" is common language, but for seams a plank is closer to quadruped: you step back into it rather than pushing up from lying. Changing it would affect players' saved Sequences that pair Swan and Plank without a transition.
- [ ] 6. **The Roll Up prerequisite change** (Hundred Prep, not Toe Taps). Confirm, and check that the tree still reads well to Art.
- [ ] 7. **Seed reorders** (Ten-Minute Centre, Hands, Then Heart). The seeds' notes and authors are unchanged.
- [ ] 8. Doses: Hundred Prep 40 s, Plank 30 s, Teaser Prep 5 reps. All are within range; 3–4 reps may suit Teaser Prep better.
- [ ] 9. Every `easier` and `harder` variation in `teaching.ts`, especially the ones that use props or a wall (Scapular Glide, Quad Press), and "Hands light" in Swan Prep.
- [ ] 10. The whole cue voice pass in `teaching.ts`: imagery choices (clementine, string of pearls, tray of tea, prow of a boat) and British spellings.

---

## 4. The class plan (`classPlan`)

The format is sound: numbered cards, position and dose on one line, and the card's cue beneath. That is how a client reads a plan on a phone. The disclaimer ("Move at your own pace. Stop if anything hurts, and check with your teacher about any changes.") is kind and correct, but it is too thin for a plan that leaves the game. The client may not know the sender is only a hobbyist. I recommend:

- Wording: "This plan is general guidance, not medical advice. Move at your own pace and stop if anything hurts. If you are pregnant or recently postnatal, recovering from injury or surgery, or have a health condition, check with your clinician before you start."
- Remove the Harmony names from the footer. "Arrive, Rising Arc" is game language that means nothing to a client.
- Add one "Easier:" line per movement from `TEACHING[id].easier`, so every card a client receives carries its modification. The Bible promises this.
- Let transitions show their first cue instead of just "Transition".

These are UI changes, so they are left for Engineering to make with Wellbeing (Dr Nia Brooks) signing off the disclaimer.
