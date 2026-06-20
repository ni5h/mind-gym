export interface Attempt {
  gameId: string;
  timestamp: number;
  timeTakenMs: number;
  correct: boolean;
  /** Reserved for a future free-text "explain your reasoning" feature. Unused in V1. */
  reasoningText?: string;
}
