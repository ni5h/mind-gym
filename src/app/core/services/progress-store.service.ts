import { Injectable, signal } from '@angular/core';
import { Attempt, ChildProfile, GameProgress } from '../models';

const STORAGE_KEY = 'mind-gym:progress';
const ROLLING_WINDOW_SIZE = 10;
const DEFAULT_PROFILE_ID = 'neo';

interface StoredState {
  profiles: Record<string, ChildProfile>;
  /** profileId -> gameId -> progress. Single profile in V1, but keyed for multi-profile later. */
  gameProgress: Record<string, Record<string, GameProgress>>;
}

function defaultState(): StoredState {
  return {
    profiles: { [DEFAULT_PROFILE_ID]: { id: DEFAULT_PROFILE_ID, name: 'Neo' } },
    gameProgress: {},
  };
}

function loadState(): StoredState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    return JSON.parse(raw) as StoredState;
  } catch {
    return defaultState();
  }
}

@Injectable({ providedIn: 'root' })
export class ProgressStoreService {
  readonly activeProfileId = DEFAULT_PROFILE_ID;

  private readonly state = signal<StoredState>(loadState());

  getGameProgress(gameId: string): GameProgress {
    const existing = this.state().gameProgress[this.activeProfileId]?.[gameId];
    return existing ?? { gameId, currentTier: 1, attempts: [] };
  }

  recordAttempt(gameId: string, attempt: Attempt, nextTier: number): void {
    this.state.update((current) => {
      const profileProgress = { ...(current.gameProgress[this.activeProfileId] ?? {}) };
      const existing = profileProgress[gameId] ?? { gameId, currentTier: 1, attempts: [] };
      const attempts = [...existing.attempts, attempt].slice(-ROLLING_WINDOW_SIZE);

      profileProgress[gameId] = { gameId, currentTier: nextTier, attempts };

      const next: StoredState = {
        ...current,
        gameProgress: { ...current.gameProgress, [this.activeProfileId]: profileProgress },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }
}
