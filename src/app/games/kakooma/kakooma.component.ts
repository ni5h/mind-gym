import { Component, computed, inject, signal } from '@angular/core';
import { Attempt } from '../../core/models';
import { DifficultyEngineService } from '../../core/services/difficulty-engine.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { FeedbackState } from '../../shared/feedback-toast/feedback-toast.component';
import { GameShellComponent } from '../../shared/game-shell/game-shell.component';
import { KakoomaEngine } from './kakooma.engine';
import { KakoomaPuzzle } from './kakooma.model';

const FEEDBACK_DELAY_MS = 1200;
const engine = new KakoomaEngine();

@Component({
  selector: 'app-kakooma',
  standalone: true,
  imports: [GameShellComponent],
  templateUrl: './kakooma.component.html',
})
export class KakoomaComponent {
  private readonly progressStore = inject(ProgressStoreService);
  private readonly difficultyEngine = inject(DifficultyEngineService);

  readonly totalTiers = engine.tiers.length;
  readonly tier = signal(this.progressStore.getGameProgress(engine.gameId).currentTier);
  readonly streak = signal(0);
  readonly feedback = signal<FeedbackState>(null);
  readonly puzzle = signal<KakoomaPuzzle>(engine.generate(this.tier()));
  readonly isAnswering = computed(() => this.feedback() === null);

  private startedAt = Date.now();

  select(index: number): void {
    if (!this.isAnswering()) return;

    const puzzle = this.puzzle();
    const correct = engine.validate(puzzle, index);
    const timeTakenMs = Date.now() - this.startedAt;
    const attempt: Attempt = { gameId: engine.gameId, timestamp: Date.now(), timeTakenMs, correct };

    const progress = this.progressStore.getGameProgress(engine.gameId);
    const nextTier = this.difficultyEngine.computeNextTier(
      this.tier(),
      [...progress.attempts, attempt],
      engine.tiers,
    );
    this.progressStore.recordAttempt(engine.gameId, attempt, nextTier);

    this.feedback.set(correct ? 'correct' : 'incorrect');
    this.streak.set(correct ? this.streak() + 1 : 0);

    setTimeout(() => {
      this.tier.set(nextTier);
      this.puzzle.set(engine.generate(nextTier));
      this.feedback.set(null);
      this.startedAt = Date.now();
    }, FEEDBACK_DELAY_MS);
  }
}
