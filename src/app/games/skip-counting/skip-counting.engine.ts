import { PuzzleGame, TierConfig } from '../../core/models';
import { SkipCountingPuzzle } from './skip-counting.model';

// Target times are starting guesses, tunable later once there's real play data.
const TIERS: TierConfig[] = [
  { tier: 1, targetTimeMs: 8_000 },
  { tier: 2, targetTimeMs: 12_000 },
  { tier: 3, targetTimeMs: 20_000 },
];

type BlankPattern = 'end' | 'middle' | 'multiple';

interface TierShape {
  sequenceLength: number;
  steps: number[];
  blanks: BlankPattern;
}

const TIER_SHAPES: Record<number, TierShape> = {
  1: { sequenceLength: 5, steps: [2, 5, 10], blanks: 'end' },
  2: { sequenceLength: 6, steps: [3, 4, 6, 7, 8, 9], blanks: 'middle' },
  3: { sequenceLength: 7, steps: [11, 12, 15, 20, 25], blanks: 'multiple' },
};

// Index 0 is never blanked, so validate() can always recover true values from it.
const FIRST_VISIBLE_INDEX = 0;

export class SkipCountingEngine implements PuzzleGame<SkipCountingPuzzle, number[]> {
  readonly gameId = 'skip-counting';
  readonly tiers = TIERS;

  generate(tier: number): SkipCountingPuzzle {
    const shape = TIER_SHAPES[tier] ?? TIER_SHAPES[1];
    const step = pick(shape.steps);
    const start = step * randomInt(1, 4);

    const values = Array.from({ length: shape.sequenceLength }, (_, i) => start + i * step);
    const missingIndices = pickMissingIndices(shape);

    const sequence: (number | null)[] = values.map((v, i) =>
      missingIndices.includes(i) ? null : v,
    );

    return { sequence, step, missingIndices };
  }

  validate(puzzle: SkipCountingPuzzle, answer: number[]): boolean {
    const base = puzzle.sequence[FIRST_VISIBLE_INDEX];
    if (base === null || answer.length !== puzzle.missingIndices.length) return false;

    return puzzle.missingIndices.every(
      (idx, i) => base + idx * puzzle.step === answer[i],
    );
  }
}

function pickMissingIndices(shape: TierShape): number[] {
  const lastIndex = shape.sequenceLength - 1;

  switch (shape.blanks) {
    case 'end':
      return [lastIndex];
    case 'middle':
      return [randomInt(1, lastIndex - 1)];
    case 'multiple':
      return pickNonAdjacentIndices(2, 1, lastIndex);
  }
}

function pickNonAdjacentIndices(count: number, rangeStart: number, rangeEnd: number): number[] {
  const candidates = Array.from(
    { length: rangeEnd - rangeStart + 1 },
    (_, i) => rangeStart + i,
  );
  const chosen: number[] = [];

  while (chosen.length < count && candidates.length > 0) {
    const pickIndex = randomInt(0, candidates.length - 1);
    const value = candidates[pickIndex];
    chosen.push(value);
    // Remove the chosen value and its immediate neighbours so the next pick stays non-adjacent.
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (Math.abs(candidates[i] - value) <= 1) candidates.splice(i, 1);
    }
  }

  return chosen.sort((a, b) => a - b);
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
