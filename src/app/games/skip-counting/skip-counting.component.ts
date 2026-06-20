import { Component, computed, inject, signal } from '@angular/core';
import { Attempt } from '../../core/models';
import { DifficultyEngineService } from '../../core/services/difficulty-engine.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { FeedbackState } from '../../shared/feedback-toast/feedback-toast.component';
import { GameShellComponent } from '../../shared/game-shell/game-shell.component';
import { NumberInputComponent } from '../../shared/number-input/number-input.component';
import { SkipCountingEngine } from './skip-counting.engine';
import { SkipCountingPuzzle } from './skip-counting.model';

const FEEDBACK_DELAY_MS = 1200;
const engine = new SkipCountingEngine();

@Component({
  selector: 'app-skip-counting',
  standalone: true,
  imports: [GameShellComponent, NumberInputComponent],
  templateUrl: './skip-counting.component.html',
})
export class SkipCountingComponent {
  private readonly progressStore = inject(ProgressStoreService);
  private readonly difficultyEngine = inject(DifficultyEngineService);

  readonly totalTiers = engine.tiers.length;
  readonly tier = signal(this.progressStore.getGameProgress(engine.gameId).currentTier);
  readonly streak = signal(0);
  readonly feedback = signal<FeedbackState>(null);
  readonly puzzle = signal<SkipCountingPuzzle>(engine.generate(this.tier()));
  readonly answers = signal<(number | null)[]>(this.emptyAnswersFor(this.puzzle()));

  readonly isAnswering = computed(() => this.feedback() === null);
  readonly canSubmit = computed(
    () => this.isAnswering() && this.answers().every((a) => a !== null),
  );

  private startedAt = Date.now();

  missingPosition(sequenceIndex: number): number {
    return this.puzzle().missingIndices.indexOf(sequenceIndex);
  }

  setAnswer(position: number, value: number | null): void {
    this.answers.update((current) => current.map((v, i) => (i === position ? value : v)));
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const puzzle = this.puzzle();
    const answer = this.answers() as number[];
    const correct = engine.validate(puzzle, answer);
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
      const next = engine.generate(nextTier);
      this.puzzle.set(next);
      this.answers.set(this.emptyAnswersFor(next));
      this.feedback.set(null);
      this.startedAt = Date.now();
    }, FEEDBACK_DELAY_MS);
  }

  private emptyAnswersFor(puzzle: SkipCountingPuzzle): (number | null)[] {
    return puzzle.missingIndices.map(() => null);
  }
}
