import { Injectable } from '@angular/core';
import { Attempt, TierConfig } from '../models';

const PROMOTION_WINDOW = 10;
const PROMOTION_MAX_ERROR_RATE = 0.1;
const DEMOTION_AVERAGE_WINDOW = 5;
const DEMOTION_TIME_MULTIPLIER = 2;

/**
 * Pure tier promotion/demotion logic, scoped per game. See brief §5 for the rules.
 * Takes no dependency on storage so it stays trivially testable later.
 */
@Injectable({ providedIn: 'root' })
export class DifficultyEngineService {
  computeNextTier(currentTier: number, attempts: Attempt[], tiers: TierConfig[]): number {
    const tierConfig = tiers.find((t) => t.tier === currentTier);
    if (!tierConfig) return currentTier;

    const minTier = tiers[0].tier;
    const maxTier = tiers[tiers.length - 1].tier;

    if (this.shouldDemote(attempts, tierConfig)) {
      return Math.max(minTier, currentTier - 1);
    }
    if (this.shouldPromote(attempts, tierConfig)) {
      return Math.min(maxTier, currentTier + 1);
    }
    return currentTier;
  }

  private shouldPromote(attempts: Attempt[], tierConfig: TierConfig): boolean {
    const window = attempts.slice(-PROMOTION_WINDOW);
    if (window.length < PROMOTION_WINDOW) return false;

    const errorRate = window.filter((a) => !a.correct).length / window.length;
    const avgTime = average(window.map((a) => a.timeTakenMs));
    return errorRate <= PROMOTION_MAX_ERROR_RATE && avgTime < tierConfig.targetTimeMs;
  }

  private shouldDemote(attempts: Attempt[], tierConfig: TierConfig): boolean {
    const lastTwo = attempts.slice(-2);
    if (lastTwo.length === 2 && lastTwo.every((a) => !a.correct)) return true;

    const lastFive = attempts.slice(-DEMOTION_AVERAGE_WINDOW);
    if (lastFive.length < DEMOTION_AVERAGE_WINDOW) return false;

    const avgTime = average(lastFive.map((a) => a.timeTakenMs));
    return avgTime > tierConfig.targetTimeMs * DEMOTION_TIME_MULTIPLIER;
  }
}

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
