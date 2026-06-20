import { TierConfig } from './tier.model';

/**
 * Shared contract every game's generator/validator conforms to, so the Game Shell
 * and Adaptive Difficulty Service can work with any game without knowing its internals.
 */
export interface PuzzleGame<TPuzzle, TAnswer> {
  gameId: string;
  tiers: TierConfig[];
  generate(tier: number): TPuzzle;
  validate(puzzle: TPuzzle, answer: TAnswer): boolean;
}
