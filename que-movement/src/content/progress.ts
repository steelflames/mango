// Practice Rank: the long rhythm of the game.
// Everything here is deterministic and shown before it's earned. No gacha, no guilt.

/** Lifetime points needed to reach each rank (index 0 is rank 1). */
export const RANK_XP = [0, 60, 150, 280, 450, 660, 910, 1200, 1530, 1900, 2310, 2760, 3250, 3780, 4350];
export const MAX_RANK = RANK_XP.length;

/** Points given when a rank is claimed. */
export const rankGift = (rank: number) => 10 + rank * 5;

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
