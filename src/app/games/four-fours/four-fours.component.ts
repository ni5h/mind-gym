import { Component, computed, inject, signal } from '@angular/core';
import { Attempt } from '../../core/models';
import { DifficultyEngineService } from '../../core/services/difficulty-engine.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { FeedbackState } from '../../shared/feedback-toast/feedback-toast.component';
import { GameShellComponent } from '../../shared/game-shell/game-shell.component';
import { evaluateTokens, FourFoursEngine } from './four-fours.engine';
import { FourFoursOperator, FourFoursPuzzle, FourFoursToken } from './four-fours.model';

const FEEDBACK_DELAY_MS = 1200;
const engine = new FourFoursEngine();

@Component({
  selector: 'app-four-fours',
  standalone: true,
  imports: [GameShellComponent],
  templateUrl: './four-fours.component.html',
})
export class FourFoursComponent {
  private readonly progressStore = inject(ProgressStoreService);
  private readonly difficultyEngine = inject(DifficultyEngineService);

  readonly totalTiers = engine.tiers.length;
  readonly tier = signal(this.progressStore.getGameProgress(engine.gameId).currentTier);
  readonly streak = signal(0);
  readonly feedback = signal<FeedbackState>(null);
  readonly puzzle = signal<FourFoursPuzzle>(engine.generate(this.tier()));
  readonly operators = computed(() => engine.operatorsForTier(this.tier()));

  readonly tokens = signal<FourFoursToken[]>([]);
  readonly usedDigitIndices = signal<Set<number>>(new Set());

  private startedAt = Date.now();

  readonly isAnswering = computed(() => this.feedback() === null);
  readonly openParenCount = computed(
    () =>
      this.tokens().filter((t) => t === '(').length -
      this.tokens().filter((t) => t === ')').length,
  );
  readonly previewValue = computed(() => evaluateTokens(this.tokens()));

  /** True when the next token must start a value (digit or open-paren) rather than
   * an operator or close-paren — at the very start, right after an operator, or
   * right after an open-paren. */
  private readonly expectsValue = computed(() => {
    const last = this.lastToken();
    return last === undefined || last === '(' || isOperator(last);
  });

  readonly canSubmit = computed(
    () =>
      this.isAnswering() &&
      this.usedDigitIndices().size === this.puzzle().digits.length &&
      this.openParenCount() === 0 &&
      this.previewValue() !== null,
  );

  private lastToken(): FourFoursToken | undefined {
    const t = this.tokens();
    return t[t.length - 1];
  }

  canAddDigit(index: number): boolean {
    return this.isAnswering() && !this.usedDigitIndices().has(index) && this.expectsValue();
  }

  canAddOperator(): boolean {
    return this.isAnswering() && !this.expectsValue();
  }

  canAddOpenParen(): boolean {
    return this.isAnswering() && this.expectsValue();
  }

  canAddCloseParen(): boolean {
    return this.isAnswering() && this.openParenCount() > 0 && !this.expectsValue();
  }

  addDigit(index: number): void {
    if (!this.canAddDigit(index)) return;
    this.tokens.update((t) => [...t, this.puzzle().digits[index]]);
    this.usedDigitIndices.update((s) => new Set(s).add(index));
  }

  addOperator(op: FourFoursOperator): void {
    if (!this.canAddOperator()) return;
    this.tokens.update((t) => [...t, op]);
  }

  addOpenParen(): void {
    if (!this.canAddOpenParen()) return;
    this.tokens.update((t) => [...t, '(']);
  }

  addCloseParen(): void {
    if (!this.canAddCloseParen()) return;
    this.tokens.update((t) => [...t, ')']);
  }

  undo(): void {
    if (!this.isAnswering() || this.tokens().length === 0) return;
    const removed = this.lastToken();
    this.tokens.update((t) => t.slice(0, -1));
    if (typeof removed === 'number') {
      const index = this.highestUsedIndexFor(removed);
      if (index !== null) {
        this.usedDigitIndices.update((s) => {
          const next = new Set(s);
          next.delete(index);
          return next;
        });
      }
    }
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const puzzle = this.puzzle();
    const answer = this.tokens();
    const correct = engine.validate(puzzle, answer);
    const attempt: Attempt = {
      gameId: engine.gameId,
      timestamp: Date.now(),
      timeTakenMs: Date.now() - this.startedAt,
      correct,
    };

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
      this.tokens.set([]);
      this.usedDigitIndices.set(new Set());
      this.feedback.set(null);
      this.startedAt = Date.now();
    }, FEEDBACK_DELAY_MS);
  }

  private highestUsedIndexFor(value: number): number | null {
    const used = [...this.usedDigitIndices()].filter((i) => this.puzzle().digits[i] === value);
    return used.length > 0 ? Math.max(...used) : null;
  }
}

function isOperator(token: FourFoursToken): boolean {
  return token === '+' || token === '-' || token === '×' || token === '÷';
}
