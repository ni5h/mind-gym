import { PuzzleGame, TierConfig } from '../../core/models';
import { MagicSquarePuzzle } from './magic-square.model';

// Target times are starting guesses, tunable later once there's real play data.
const TIERS: TierConfig[] = [
  { tier: 1, targetTimeMs: 20_000 },
  { tier: 2, targetTimeMs: 35_000 },
  { tier: 3, targetTimeMs: 60_000 },
];

interface TierShape {
  size: number;
  hideCount: number;
}

const TIER_SHAPES: Record<number, TierShape> = {
  1: { size: 3, hideCount: 2 },
  2: { size: 3, hideCount: 4 },
  3: { size: 4, hideCount: 6 },
};

// The Lo Shu square — up to rotation/reflection, the only 3x3 magic square using 1-9.
const LO_SHU: number[][] = [
  [2, 7, 6],
  [9, 5, 1],
  [4, 3, 8],
];

// Built via the classic "diagonal method" for order-4 squares: fill 1..16 in row-major
// order, then replace every cell NOT on a main diagonal with (17 - value).
const DURER_STYLE_4: number[][] = [
  [1, 15, 14, 4],
  [12, 6, 7, 9],
  [8, 10, 11, 5],
  [13, 3, 2, 16],
];

type Transform = (square: number[][]) => number[][];
const SYMMETRIES: Transform[] = [
  identity,
  rotate90,
  rotate180,
  rotate270,
  flipHorizontal,
  flipVertical,
  transpose,
  antiTranspose,
];

/**
 * Generates from a known-valid base square (rotated/reflected/complemented for variety)
 * rather than searching for one — magic squares are rigid enough that random
 * constraint-based generation isn't worth it at this size.
 *
 * Like KenKen, validation is structural: it checks the player's full grid uses 1..size²
 * exactly once and that every row/column/diagonal hits the target, rather than comparing
 * against the square used at generation time.
 */
export class MagicSquareEngine implements PuzzleGame<MagicSquarePuzzle, (number | null)[][]> {
  readonly gameId = 'magic-square';
  readonly tiers = TIERS;

  generate(tier: number): MagicSquarePuzzle {
    const shape = TIER_SHAPES[tier] ?? TIER_SHAPES[1];
    const size = shape.size;
    const base = size === 4 ? DURER_STYLE_4 : LO_SHU;
    const square = randomizeSquare(base, size);
    const targetSum = (size * (size * size + 1)) / 2;

    const hidden = pickRandomCells(size, shape.hideCount);
    const grid = square.map((row, r) =>
      row.map((v, c) => (hidden.has(`${r},${c}`) ? null : v)),
    );

    return { size, grid, targetSum };
  }

  validate(puzzle: MagicSquarePuzzle, answer: (number | null)[][]): boolean {
    const n = puzzle.size;
    const sameShape = answer.length === n && answer.every((row) => row.length === n);
    if (!sameShape || answer.some((row) => row.some((v) => v === null))) return false;

    const grid = answer as number[][];

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const given = puzzle.grid[r][c];
        if (given !== null && grid[r][c] !== given) return false;
      }
    }

    if (!isPermutationOf1ToNSquared(grid.flat(), n)) return false;

    for (let i = 0; i < n; i++) {
      if (sum(grid[i]) !== puzzle.targetSum) return false;
      const column = grid.map((row) => row[i]);
      if (sum(column) !== puzzle.targetSum) return false;
    }

    const mainDiagonal = grid.map((row, i) => row[i]);
    const antiDiagonal = grid.map((row, i) => row[n - 1 - i]);
    return sum(mainDiagonal) === puzzle.targetSum && sum(antiDiagonal) === puzzle.targetSum;
  }
}

function randomizeSquare(base: number[][], size: number): number[][] {
  let square = pick(SYMMETRIES)(base);
  if (Math.random() < 0.5) square = complement(square, size);
  return square;
}

function identity(square: number[][]): number[][] {
  return square.map((row) => [...row]);
}
function rotate90(square: number[][]): number[][] {
  const n = square.length;
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => square[n - 1 - c][r]));
}
function rotate180(square: number[][]): number[][] {
  return square.map((row) => [...row].reverse()).reverse();
}
function rotate270(square: number[][]): number[][] {
  return rotate90(rotate180(square));
}
function flipHorizontal(square: number[][]): number[][] {
  return square.map((row) => [...row].reverse());
}
function flipVertical(square: number[][]): number[][] {
  return [...square].reverse();
}
function transpose(square: number[][]): number[][] {
  const n = square.length;
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => square[c][r]));
}
function antiTranspose(square: number[][]): number[][] {
  return rotate180(transpose(square));
}
function complement(square: number[][], size: number): number[][] {
  const max = size * size + 1;
  return square.map((row) => row.map((v) => max - v));
}

function pickRandomCells(size: number, count: number): Set<string> {
  const all: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) all.push(`${r},${c}`);
  }
  return new Set(shuffle(all).slice(0, count));
}

function isPermutationOf1ToNSquared(values: number[], n: number): boolean {
  const max = n * n;
  if (values.length !== max) return false;
  if (new Set(values).size !== max) return false;
  return values.every((v) => v >= 1 && v <= max);
}

function sum(values: number[]): number {
  return values.reduce((s, v) => s + v, 0);
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
