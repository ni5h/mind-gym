import { Component, computed, inject, signal } from '@angular/core';
import { Attempt } from '../../core/models';
import { DifficultyEngineService } from '../../core/services/difficulty-engine.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { FeedbackState } from '../../shared/feedback-toast/feedback-toast.component';
import { GameShellComponent } from '../../shared/game-shell/game-shell.component';
import { NumberPyramidEngine } from './number-pyramid.engine';
import { NumberPyramidPuzzle } from './number-pyramid.model';

const FEEDBACK_DELAY_MS = 1200;
const engine = new NumberPyramidEngine();

interface CellViewModel {
  row: number;
  col: number;
  isGiven: boolean;
  givenValue: number | null;
}

@Component({
  selector: 'app-number-pyramid',
  standalone: true,
  imports: [GameShellComponent],
  templateUrl: './number-pyramid.component.html',
})
export class NumberPyramidComponent {
  private readonly progressStore = inject(ProgressStoreService);
  private readonly difficultyEngine = inject(DifficultyEngineService);

  readonly totalTiers = engine.tiers.length;
  readonly tier = signal(this.progressStore.getGameProgress(engine.gameId).currentTier);
  readonly streak = signal(0);
  readonly feedback = signal<FeedbackState>(null);
  readonly puzzle = signal<NumberPyramidPuzzle>(engine.generate(this.tier()));
  readonly cellViewModels = computed(() => buildCellViewModels(this.puzzle()));
  readonly answer = signal<(number | null)[][]>(this.emptyAnswerFor(this.cellViewModels()));

  /** Apex first, base last — visual top-to-bottom order is the reverse of `rows`. */
  readonly displayRows = computed(() => [...this.cellViewModels()].reverse());

  readonly isAnswering = computed(() => this.feedback() === null);
  readonly canSubmit = computed(
    () => this.isAnswering() && this.answer().every((row) => row.every((v) => v !== null)),
  );

  private startedAt = Date.now();

  onCellInput(row: number, col: number, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.setCell(row, col, raw === '' ? null : Number(raw));
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const puzzle = this.puzzle();
    const answer = this.answer();
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
      this.answer.set(this.emptyAnswerFor(buildCellViewModels(next)));
      this.feedback.set(null);
      this.startedAt = Date.now();
    }, FEEDBACK_DELAY_MS);
  }

  private setCell(row: number, col: number, value: number | null): void {
    this.answer.update((grid) =>
      grid.map((r, ri) => (ri === row ? r.map((v, ci) => (ci === col ? value : v)) : r)),
    );
  }

  private emptyAnswerFor(cells: CellViewModel[][]): (number | null)[][] {
    return cells.map((row) => row.map((cell) => (cell.isGiven ? cell.givenValue : null)));
  }
}

function buildCellViewModels(puzzle: NumberPyramidPuzzle): CellViewModel[][] {
  return puzzle.rows.map((row, r) =>
    row.map((value, c) => ({
      row: r,
      col: c,
      isGiven: value !== null,
      givenValue: value,
    })),
  );
}
