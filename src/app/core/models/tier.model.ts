export interface TierConfig {
  tier: number;
  /** Expected average time-to-answer at this tier, in ms. Drives promotion/demotion. */
  targetTimeMs: number;
}
