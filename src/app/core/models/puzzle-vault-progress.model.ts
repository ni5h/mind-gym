export type PuzzleVaultCategory = 'measuring' | 'crossing' | 'weighing' | 'matchstick';

export interface PuzzleVaultProgress {
  category: PuzzleVaultCategory;
  solvedIds: string[];
  currentDifficulty: number;
}
