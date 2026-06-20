import { Component, computed, inject, signal } from '@angular/core';
import { Attempt } from '../../core/models';
import { DifficultyEngineService } from '../../core/services/difficulty-engine.service';
import { ProgressStoreService } from '../../core/services/progress-store.service';
import { FeedbackState } from '../../shared/feedback-toast/feedback-toast.component';
import { GameShellComponent } from '../../shared/game-shell/game-shell.component';
import { KenKenEngine } from './kenken.engine';
import { KenKenPuzzle } from './kenken.model';

const FEEDBACK_DELAY_MS = 1200;
const engine = new KenKenEngine();

interface CellViewModel {
  row: number;
  col: number;
  /** Single-cell cages are givens in classic KenKen — pre-filled, not editable. */
  isGiven: boolean;
  givenValue: number | null;
  /** Operation+target shown only on each cage's top-left-most cell. */
  label: string | null;
  borderClasses: string;
}

@Component({
  selector: 'app-kenken',
  standalone: true,
  imports: [GameShellComponent],
  templateUrl: './kenken.component.html',
})
export class KenKenComponent {
  private readonly progressStore = inject(ProgressStoreService);
  private readonly difficultyEngine = inject(DifficultyEngineService);

  readonly totalTiers = engine.tiers.length;
  readonly tier = signal(this.progressStore.getGameProgress(engine.gameId).currentTier);
  readonly streak = signal(0);
  readonly feedback = signal<FeedbackState>(null);
  readonly puzzle = signal<KenKenPuzzle>(engine.generate(this.tier()));
  readonly cellViewModels = computed(() => buildCellViewModels(this.puzzle()));
  readonly answer = signal<(number | null)[][]>(this.emptyAnswerFor(this.cellViewModels()));
  readonly gridColumnsStyle = computed(() => `repeat(${this.puzzle().gridSize}, minmax(0, 1fr))`);

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

function buildCellViewModels(puzzle: KenKenPuzzle): CellViewModel[][] {
  const n = puzzle.gridSize;
  const cageIndexAt: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  puzzle.cages.forEach((cage, idx) => {
    cage.cells.forEach(([r, c]) => {
      cageIndexAt[r][c] = idx;
    });
  });

  const labelCellOf = new Map<number, string>();
  puzzle.cages.forEach((cage, idx) => {
    const [topLeft] = [...cage.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    labelCellOf.set(idx, `${topLeft[0]},${topLeft[1]}`);
  });

  const sameCage = (r: number, c: number, cageIndex: number): boolean =>
    r >= 0 && r < n && c >= 0 && c < n && cageIndexAt[r][c] === cageIndex;

  // Thick + dark where a cage ends, thin + faint where it continues, so cage shapes
  // read clearly at a glance rather than blending into a uniform grid. Classes are
  // spelled out literally (not built via template strings) so Tailwind's static
  // scanner can find them.
  const sideBorder = (side: 't' | 'b' | 'l' | 'r', insideCage: boolean): string => {
    const classes: Record<'t' | 'b' | 'l' | 'r', [thin: string, thick: string]> = {
      t: ['border-t border-t-gray-200', 'border-t-2 border-t-gray-800'],
      b: ['border-b border-b-gray-200', 'border-b-2 border-b-gray-800'],
      l: ['border-l border-l-gray-200', 'border-l-2 border-l-gray-800'],
      r: ['border-r border-r-gray-200', 'border-r-2 border-r-gray-800'],
    };
    return insideCage ? classes[side][0] : classes[side][1];
  };

  const grid: CellViewModel[][] = [];
  for (let r = 0; r < n; r++) {
    const row: CellViewModel[] = [];
    for (let c = 0; c < n; c++) {
      const cageIndex = cageIndexAt[r][c];
      const cage = puzzle.cages[cageIndex];
      const isGiven = cage.cells.length === 1;
      const isLabelCell = labelCellOf.get(cageIndex) === `${r},${c}`;

      const borderClasses = [
        sideBorder('t', sameCage(r - 1, c, cageIndex)),
        sideBorder('b', sameCage(r + 1, c, cageIndex)),
        sideBorder('l', sameCage(r, c - 1, cageIndex)),
        sideBorder('r', sameCage(r, c + 1, cageIndex)),
      ].join(' ');

      row.push({
        row: r,
        col: c,
        isGiven,
        givenValue: isGiven ? cage.target : null,
        label: isLabelCell && !isGiven ? `${cage.target}${cage.operation}` : null,
        borderClasses,
      });
    }
    grid.push(row);
  }
  return grid;
}
