import { PuzzleVaultCategory } from '../core/models';

export interface PuzzleVaultEntry {
  id: string;
  category: PuzzleVaultCategory;
  difficulty: number;
  prompt: string;
  hints: string[];
  solution: string;
  explanation: string;
}
