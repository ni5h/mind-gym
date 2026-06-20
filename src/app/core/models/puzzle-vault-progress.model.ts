export type PuzzleVaultCategory = 'measuring' | 'crossing' | 'weighing' | 'matchstick';

/** Reserved for Phase 7 (Puzzle Vault). Not built or used until then. */
export interface PuzzleVaultProgress {
  category: PuzzleVaultCategory;
  solvedIds: string[];
  currentDifficulty: number;
}
