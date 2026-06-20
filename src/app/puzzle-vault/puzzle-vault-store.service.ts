import { Injectable, signal } from '@angular/core';
import { PuzzleVaultCategory, PuzzleVaultProgress } from '../core/models';

const STORAGE_KEY = 'mind-gym:puzzle-vault-progress';
const DEFAULT_PROFILE_ID = 'neo';

type StoredState = Record<string, Record<PuzzleVaultCategory, PuzzleVaultProgress>>;

function loadState(): StoredState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredState;
  } catch {
    return {};
  }
}

function emptyProgress(category: PuzzleVaultCategory): PuzzleVaultProgress {
  return { category, solvedIds: [], currentDifficulty: 1 };
}

/**
 * Separate from ProgressStoreService on purpose — the Vault isn't adaptively tiered
 * (brief §7), so it has nothing to do with rolling attempt windows or tier
 * promotion/demotion. It just tracks which puzzles have been viewed/solved per category.
 */
@Injectable({ providedIn: 'root' })
export class PuzzleVaultStoreService {
  private readonly activeProfileId = DEFAULT_PROFILE_ID;
  private readonly state = signal<StoredState>(loadState());

  getProgress(category: PuzzleVaultCategory): PuzzleVaultProgress {
    return this.state()[this.activeProfileId]?.[category] ?? emptyProgress(category);
  }

  isSolved(category: PuzzleVaultCategory, puzzleId: string): boolean {
    return this.getProgress(category).solvedIds.includes(puzzleId);
  }

  markSolved(category: PuzzleVaultCategory, puzzleId: string, difficulty: number): void {
    this.state.update((current) => {
      const profileProgress = { ...(current[this.activeProfileId] ?? {}) } as Record<
        PuzzleVaultCategory,
        PuzzleVaultProgress
      >;
      const existing = profileProgress[category] ?? emptyProgress(category);

      if (existing.solvedIds.includes(puzzleId)) return current;

      profileProgress[category] = {
        category,
        solvedIds: [...existing.solvedIds, puzzleId],
        currentDifficulty: Math.max(existing.currentDifficulty, difficulty + 1),
      };

      const next: StoredState = { ...current, [this.activeProfileId]: profileProgress };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }
}
