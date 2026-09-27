import type { Sequence, Slot } from '../game/types';

const hoursAgo = (h: number) => Date.now() - 1000 * 60 * 60 * h;

function seed(id: string, name: string, author: string, studio: string, note: string, hours: number, cards: (string | [string, ...string[]])[], reactions: [number, number, number, number], plays: number, saves: number): Sequence {
  const slots: Slot[] = cards.map((c, i) => (Array.isArray(c) ? { slotId: `${id}-${i}`, cardId: c[0], modifiers: c.slice(1) } : { slotId: `${id}-${i}`, cardId: c, modifiers: [] }));
  const [creative, sweaty, gentle, educational] = reactions;
  return {
    id, name, author, studio, note, seeded: true, slots,
    createdAt: hoursAgo(hours), updatedAt: hoursAgo(hours), published: true, publishedAt: hoursAgo(hours),
    reactions: { creative, sweaty, gentle, educational }, myReaction: null,
    analytics: { plays: 0, completedPlays: 0, completionPercents: [] },
    community: { plays, saves }
  };
}

/** Sequences other movers have shared In the Queue (a simulated feed, kept on this device). */
export function seedSequences(): Sequence[] {
  return [
    seed('seed-back-line', 'Wake the Back Line', 'RiverMoves', 'Riverside Room', 'Glutes first thing, before coffee has a say.', 7,
      ['breathing', 'bridge', ['bridge-march', 'pr-slow-tempo'], 'tr-supine-side', 'clam'], [96, 142, 88, 131], 2140, 318),
    seed('seed-ten-minute-centre', 'Ten-Minute Centre', 'Pip Okafor', 'The Moss Room', 'The flexion ladder I teach every new client.', 19,
      ['breathing', 'dead-bug', 'toe-taps', 'hundred-prep', 'roll-up'], [74, 190, 61, 244], 3380, 612),
    seed('seed-quiet-shoulders', 'Quiet Shoulders, Long Spine', 'LunaMoves', 'Luna’s Loft', 'For the desk-bound. Which is all of us.', 30,
      ['scapular-glide', 'tr-seated-supine', 'breathing', 'dead-bug', 'bridge'], [64, 12, 188, 241], 903, 147),
    seed('seed-slow-strength', 'Slow Strength, No Rush', 'Studio Fern', 'Studio Fern', 'Everything at half speed. It’s harder than it sounds.', 52,
      ['dead-bug', ['bridge', 'pr-slow-tempo'], 'tr-roll-to-quadruped', 'quad-press', 'bird-dog'], [41, 155, 37, 88], 1412, 201),
    seed('seed-hands-heart', 'Hands, Then Heart', 'Marguerite', 'The Attic Barre', 'Onto the hands, then open the front of the body.', 76,
      ['scapular-glide', 'tr-quad-seated', 'quad-press', ['bird-dog', 'pr-add-coordination'], 'tr-quad-prone', 'swan-prep', 'plank-control'], [182, 97, 44, 120], 1180, 266),
    seed('seed-whole-mat', 'The Whole Mat', 'Sol Reyes', 'Sunday Mat Club', 'One of everything, bridged all the way through.', 120,
      ['breathing', 'bridge', 'dead-bug', 'tr-roll-to-quadruped', 'bird-dog', 'tr-quad-prone', 'swan-prep'], [211, 84, 150, 176], 4020, 780)
  ];
}
