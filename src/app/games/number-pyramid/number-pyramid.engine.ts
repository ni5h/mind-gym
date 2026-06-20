import { PuzzleGame, TierConfig } from '../../core/models';
import { NumberPyramidMode, NumberPyramidPuzzle } from './number-pyramid.model';

// Target times are starting guesses, tunable later once there's real play data.
const TIERS: TierConfig[] = [
  { tier: 1, targetTimeMs: 15_000 },
  { tier: 2, targetTimeMs: 25_000 },
  { tier: 3, targetTimeMs: 45_000 },
];

interface TierShape {
  totalRowsOptions: number[];
  modes: NumberPyramidMode[];
  valueRange: [number, number];
  reverseHiddenCount: number;
}

const TIER_SHAPES: Record<number, TierShape> = {
  1: { totalRowsOptions: [3], modes: ['forward'], valueRange: [1, 9], reverseHiddenCount: 1 },
  2: { totalRowsOptions: [4], modes: ['forward', 'reverse'], valueRange: [1, 9], reverseHiddenCount: 1 },
  3: { totalRowsOptions: [5, 6], modes: ['reverse'], valueRange: [1, 6], reverseHiddenCount: 2 },
};

/**
 * `rows[0]` is the base (widest row); each subsequent row is one shorter, ending at
 * `rows[rows.length - 1]`, the single-cell apex. `rows[r][c] === rows[r-1][c] + rows[r-1][c+1]`
 * for every r >= 1 — that one relation is both how puzzles are generated and how they're
 * validated, so forward and reverse mode share the same check with no special-casing.
 */
export class NumberPyramidEngine implements PuzzleGame<NumberPyramidPuzzle, (number | null)[][]> {
  readonly gameId = 'number-pyramid';
  readonly tiers = TIERS;

  generate(tier: number): NumberPyramidPuzzle {
    const shape = TIER_SHAPES[tier] ?? TIER_SHAPES[1];
    const totalRows = pick(shape.totalRowsOptions);
    const mode = pick(shape.modes);
    const [min, max] = shape.valueRange;

    const base = Array.from({ length: totalRows }, () => randomInt(min, max));
    const fullRows = buildFullPyramid(base);

    const rows =
      mode === 'forward' ? maskForward(fullRows) : maskReverse(fullRows, shape.reverseHiddenCount);

    return { rows, mode };
  }

  validate(puzzle: NumberPyramidPuzzle, answer: (number | null)[][]): boolean {
    const rows = puzzle.rows;
    const sameShape =
      answer.length === rows.length && answer.every((row, r) => row.length === rows[r].length);
    if (!sameShape || answer.some((row) => row.some((v) => v === null))) return false;

    const grid = answer as number[][];

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const given = rows[r][c];
        if (given !== null && grid[r][c] !== given) return false;
      }
    }

    for (let r = 1; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] !== grid[r - 1][c] + grid[r - 1][c + 1]) return false;
      }
    }

    return true;
  }
}

function buildFullPyramid(base: number[]): number[][] {
  const rows: number[][] = [base];
  let current = base;
  while (current.length > 1) {
    const next = current.slice(0, -1).map((v, i) => v + current[i + 1]);
    rows.push(next);
    current = next;
  }
  return rows;
}

function maskForward(fullRows: number[][]): (number | null)[][] {
  return fullRows.map((row, r) => (r === 0 ? [...row] : row.map(() => null)));
}

function maskReverse(fullRows: number[][], hiddenCount: number): (number | null)[][] {
  const baseLength = fullRows[0].length;
  const hiddenIndices = pickNonAdjacentIndices(hiddenCount, 0, baseLength - 1);
  const maskedBase = fullRows[0].map((v, i) => (hiddenIndices.includes(i) ? null : v));
  return fullRows.map((row, r) => (r === 0 ? maskedBase : [...row]));
}

function pickNonAdjacentIndices(count: number, rangeStart: number, rangeEnd: number): number[] {
  const candidates = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i);
  const chosen: number[] = [];

  while (chosen.length < count && candidates.length > 0) {
    const pickIndex = randomInt(0, candidates.length - 1);
    const value = candidates[pickIndex];
    chosen.push(value);
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
