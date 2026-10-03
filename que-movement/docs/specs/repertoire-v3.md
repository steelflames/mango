# Repertoire, Sequencer, Play and Quests · spec v3

Status: decisions confirmed with the client. Section 3.1 (Challenge Decks) waits on a Council pass for Swan Dive and Corkscrew.

## 0. Names
| Thing | Name |
|---|---|
| Right-hand build panel | **The Sequencer** |
| The seven icons in it | **Harmonies** |
| Left-hand menu | **Decks** |
| Browse page at the top of the Collection | **Bookcase** |

## 1. The Sequencer
1. No Teacher's Note in the panel (teaching lives in card details and Play).
2. **Effort chart**: title "Effort", subtitle "How hard each step works, 1 to 5"; guide lines at effort 1, 3 and 5 (Easy / Steady / Peak), so a bar touching a line reads true; one bar per movement coloured by path; transitions as baseline diamonds; peak marked with a lantern; phases Arrive · Build · Peak · Settle shaded behind and labelled under the bars ("Middle" when nothing reaches effort 3); tooltip per bar ("3. Dead Bug · Effort 2 of 5").
   - **Shape ▴/▾** folds the chart and Harmonies into one line ("4 steps · 5:12 · 4/7 Harmonies") so the steps get the room. Folded by default on screens under 760 px tall; your choice is remembered.
3. **Harmonies** headline ("Harmonies · 5 of 7"); each icon has a tooltip: name and points, the teacher's quote, status or what's missing.
4. **Insert above the selected step** when a step is selected; append when nothing is.
5. **Drag a row** to reorder; drag it past the panel edge and it turns red ("Release to remove"); release removes it with a 5-second Undo.
6. **Your Sequences** is a text button in the Sequencer header that opens the full list.

## 2. Decks (left menu, one scrolling column)
1. Collection: Bookcase, All Qcards, Transitions, Progressions, Archive.
2. **Custom Decks: six slots**, shown as a six-pip meter beside the heading, with a single dashed "+ New deck" row (when the shelf is full it says the new deck goes in the tin). Rename and reorder (Move up / Move down) from ⋯. The primary deck keeps its ★ and can't be filed.
3. **Deck Library: a recipe tin of index cards** for decks beyond six. File a deck into the tin; pull one out to swap it into a slot. Unlimited.
4. **In the Queue:** the 3 most recently saved Sequences (yours or saved from the community), plus "See all".

## 3. Bookcase (Netflix-style browse page)
Rows of large full-art cards (Techniques not yet learned are shown dimmed with a "Learn" tag and open Technique): Featured · Techniques you might love · Challenge Decks · Saved from the Queue · For you · Continue (unfinished performances) · Collections (Restorative, Neck & Shoulder Ease, Foundational, Foundational but Fun, Foundational + Spicy) · Inspiration (Techniques you've learned but never built with, paired with community Sequences that use them).

### 3.1 Challenge Decks (pending content)
Constrained builds: allowed pool, max steps, required peaks, optional required Harmonies. Flagship "Two Peaks": Swan Dive and Corkscrew as the two peaks. Needs both cards from the Council and new art. Corkscrew is the first rotation card.

## 4. Play
1. **One button: Complete & Next.** A small ‹ Back stays. No Skip.
2. **Review** button: a text-only, music-app-style list of the Sequence. Reorder steps, edit each step's time (±15 s), jump to a step.
3. **Time learns from you, both ways, but asymmetrically.** A difference counts when it's 25% or more of the plan and at least 15 s; the new time is the real time rounded to the nearest 15 s (minimum 15 s).
   - **Longer** is learned at once: you needed it.
   - **Shorter** is learned on the second real short run in a row. A card finished in under 10 s is a tap-through and never counts, so skipping ahead can't shrink a class.
   - Setting a time by hand (Review or Timer +) clears any pending short run.
4. **Timer +**: a timer icon with a plus beside the ring opens a popover: the card's current time, a carnival wheel (drum picker, 0:15 to 5:00 in 15 s steps, ticking detents) and −15 s / +15 s, which land on the next 15-second mark (0:51 → 0:45 or 1:00). Tap anywhere else to close.
5. **No streak.** In its place, **Still to earn**: rewards this Sequence can give that you haven't earned yet (Harmonies it hasn't earned before, badges within reach, Techniques it would open).

### 4.1 Scoring
- **Flat rate**: 15 points for performing any Sequence through. Enough to never be nothing, not enough to grind.
- **Peak exercises**: every movement at the Sequence's peak effort (3 or more) pays 10 when completed.
- **First-time Harmonies**: each Harmony pays the first time *this* Sequence earns it. Replays pay the flat rate and peaks.
- Badges, ranks and quests pay as before.

## 5. Daily Quests (replace daily intentions)
- Quests mix in-app tasks (perform a Sequence, earn a Harmony) with off-mat self-care (stretch, self-massage, a walk, a breathing break, a posture break, water). Off-mat quests are honour-system: tick them off.
- Clearing a quest pays its points and a new one is drawn at random from your enabled types. Rewards are fixed and shown up front; only *which* quest comes next is random.
- **Customise:** how many active quests (1 to 5), which types are allowed, and presets: Office Worker, Low Back Health, Scoliosis-Friendly, Gentle Days, Everything. Presets choose quest types and wording only. No medical claims; every quest has a "skip it" with no cost.

## 6. New Qcard reveal
The two buttons explain themselves: **Add to My Practice** ("Your primary deck: it's there first when you build") and **Keep in collection** ("It stays in All Qcards. Add it to any deck later").
