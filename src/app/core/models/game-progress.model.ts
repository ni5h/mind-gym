import { Attempt } from './attempt.model';

export interface GameProgress {
  gameId: string;
  currentTier: number;
  /** Rolling window of the most recent attempts, capped to the window size the difficulty engine needs. */
  attempts: Attempt[];
}
