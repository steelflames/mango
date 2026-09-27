import type { Sequence } from '../game/types';

const hoursAgo = (h: number) => Date.now() - 1000 * 60 * 60 * h;

/** Community builds that ship with the game (a simulated feed, kept on this device). */
export function seedSequences(): Sequence[] {
  return [
    {
      id: 'seed-morning-flow',
      name: 'Mountain Morning Flow',
      author: 'RiverMoves',
      seeded: true,
      slots: [
        { slotId: 's1', cardId: 'core-foundation', modifiers: ['pr-slow-tempo'] },
        { slotId: 's2', cardId: 'bridge-foundation', modifiers: [] },
        { slotId: 's3', cardId: 'tr-seated-supine', modifiers: [] },
        { slotId: 's4', cardId: 'scapula-foundation', modifiers: ['pr-longer-lever'] }
      ],
      createdAt: hoursAgo(52),
      updatedAt: hoursAgo(52),
      published: true,
      publishedAt: hoursAgo(52),
      reactions: { creative: 128, sweaty: 96, gentle: 214, educational: 173 },
      myReaction: null,
      analytics: { plays: 1892, completedPlays: 1476, rewatches: 610, cardsViewed: 10820, completionPercents: [78] }
    },
    {
      id: 'seed-quiet-shoulders',
      name: 'Quiet Shoulders, Long Spine',
      author: 'LunaMoves',
      seeded: true,
      slots: [
        { slotId: 's1', cardId: 'scapula-foundation', modifiers: ['pr-longer-lever'] },
        { slotId: 's2', cardId: 'tr-seated-supine', modifiers: [] },
        { slotId: 's3', cardId: 'core-foundation', modifiers: ['pr-add-coordination'] },
        { slotId: 's4', cardId: 'bridge-foundation', modifiers: [] }
      ],
      createdAt: hoursAgo(120),
      updatedAt: hoursAgo(120),
      published: true,
      publishedAt: hoursAgo(120),
      reactions: { creative: 64, sweaty: 12, gentle: 188, educational: 241 },
      myReaction: null,
      analytics: { plays: 903, completedPlays: 742, rewatches: 288, cardsViewed: 4120, completionPercents: [82] }
    },
    {
      id: 'seed-slow-strength',
      name: 'Slow Strength, No Rush',
      author: 'Studio Fern',
      seeded: true,
      slots: [
        { slotId: 's1', cardId: 'core-foundation', modifiers: [] },
        { slotId: 's2', cardId: 'bridge-foundation', modifiers: ['pr-add-load', 'pr-slow-tempo'] },
        { slotId: 's3', cardId: 'tr-seated-supine', modifiers: [] },
        { slotId: 's4', cardId: 'scapula-foundation', modifiers: ['pr-narrow-support'] }
      ],
      createdAt: hoursAgo(9),
      updatedAt: hoursAgo(9),
      published: true,
      publishedAt: hoursAgo(9),
      reactions: { creative: 41, sweaty: 155, gentle: 37, educational: 88 },
      myReaction: null,
      analytics: { plays: 412, completedPlays: 301, rewatches: 96, cardsViewed: 2510, completionPercents: [71] }
    }
  ];
}
