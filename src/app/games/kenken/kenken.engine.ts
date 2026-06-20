import { PuzzleGame, TierConfig } from '../../core/models';
import { KenKenCage, KenKenOperation, KenKenPuzzle } from './kenken.model';

// Target times are starting guesses — KenKen runs much longer than the other games,
// tune once there's real play data.
const TIERS: TierConfig[] = [
  { tier: 1, targetTimeMs: 25_000 },
  { tier: 2, targetTimeMs: 50_000 },
  { tier: 3, targetTimeMs: 90_000 },
];

interface TierShape {
  gridSizes: number[];
  maxCageSize: number;
  operations: KenKenOperation[];
}

const TIER_SHAPES: Record<number, TierShape> = {
  1: { gridSizes: [3], maxCageSize: 2, operations: ['+'] },
  2: { gridSizes: [4], maxCageSize: 3, operations: ['+', '-'] },
  3: { gridSizes: [5, 6], maxCageSize: 4, operations: ['+', '-', '×', '÷'] },
};

type Cell = [number, number];

/**
 * Generates a valid filled grid first, then overlays cages on top of it — generating
 * cages independently of a solution and trying to backfill targets is far more likely
 * to produce an unsolvable or ambiguous-in-the-wrong-way puzzle.
 *
 * Validation deliberately does NOT compare against the grid used at generation time:
 * it checks row/column uniqueness and cage math directly, since a cage layout can have
 * more than one valid fill and any of them should count as correct.
 */
export class KenKenEngine implements PuzzleGame<KenKenPuzzle, (number | null)[][]> {
  readonly gameId = 'kenken';
  readonly tiers = TIERS;

  generate(tier: number): KenKenPuzzle {
    const shape = TIER_SHAPES[tier] ?? TIER_SHAPES[1];
    const gridSize = pick(shape.gridSizes);
    const grid = generateLatinSquare(gridSize);
    const regions = partitionIntoCages(gridSize, shape.maxCageSize);
    const cages = regions.map((cells) => buildCage(cells, grid, shape.operations));
    return { gridSize, cages };
  }

  validate(puzzle: KenKenPuzzle, answer: (number | null)[][]): boolean {
    const n = puzzle.gridSize;
    const isComplete =
      answer.length === n && answer.every((row) => row.length === n && row.every((v) => v !== null));
    if (!isComplete) return false;

    const grid = answer as number[][];

    for (let i = 0; i < n; i++) {
      if (!isPermutationOf1ToN(grid[i], n)) return false;
      const column = grid.map((row) => row[i]);
      if (!isPermutationOf1ToN(column, n)) return false;
    }

    return puzzle.cages.every((cage) => {
      const values = cage.cells.map(([r, c]) => grid[r][c]);
      return computeTarget(cage.operation, values) === cage.target;
    });
  }
}

function buildCage(cells: Cell[], grid: number[][], allowedOps: KenKenOperation[]): KenKenCage {
  const values = cells.map(([r, c]) => grid[r][c]);

  if (cells.length === 1) {
    return { cells, operation: '+', target: values[0] };
  }
  if (cells.length === 2) {
    const operation = pick(twoCellOperationCandidates(values, allowedOps));
    return { cells, operation, target: computeTarget(operation, values) };
  }
  const operation = pick(multiCellOperationCandidates(allowedOps));
  return { cells, operation, target: computeTarget(operation, values) };
}

function twoCellOperationCandidates(
  values: number[],
  allowedOps: KenKenOperation[],
): KenKenOperation[] {
  const [a, b] = values;
  const candidates = allowedOps.filter((op) => op !== '÷' || Math.max(a, b) % Math.min(a, b) === 0);
  return candidates.length > 0 ? candidates : ['+'];
}

function multiCellOperationCandidates(allowedOps: KenKenOperation[]): KenKenOperation[] {
  const candidates = (['+', '×'] as KenKenOperation[]).filter((op) => allowedOps.includes(op));
  return candidates.length > 0 ? candidates : ['+'];
}

function computeTarget(operation: KenKenOperation, values: number[]): number {
  switch (operation) {
    case '+':
      return values.reduce((sum, v) => sum + v, 0);
    case '×':
      return values.reduce((product, v) => product * v, 1);
    case '-':
      return Math.abs(values[0] - values[1]);
    case '÷':
      return Math.max(values[0], values[1]) / Math.min(values[0], values[1]);
  }
}

function isPermutationOf1ToN(values: number[], n: number): boolean {
  if (values.length !== n) return false;
  if (new Set(values).size !== n) return false;
  return values.every((v) => v >= 1 && v <= n);
}

// --- Latin square generation: a cyclic base grid is trivially valid; shuffling whole
// rows, whole columns, and relabelling values all preserve validity while breaking the
// pattern up enough to feel non-mechanical. ---

function generateLatinSquare(n: number): number[][] {
  const grid = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => ((r + c) % n) + 1),
  );
  shuffleRows(grid);
  shuffleColumnsInPlace(grid);
  return relabel(grid, n);
}

function shuffleRows(grid: number[][]): void {
  for (let i = grid.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }
}

function shuffleColumnsInPlace(grid: number[][]): void {
  const n = grid.length;
  const order = shuffle(Array.from({ length: n }, (_, i) => i));
  for (let r = 0; r < n; r++) {
    grid[r] = order.map((c) => grid[r][c]);
  }
}

function relabel(grid: number[][], n: number): number[][] {
  const mapping = shuffle(Array.from({ length: n }, (_, i) => i + 1));
  return grid.map((row) => row.map((v) => mapping[v - 1]));
}

// --- Cage partitioning: randomized region growing over orthogonal neighbours, so every
// cage is contiguous. Cells are visited in shuffled order so leftover singles land
// unpredictably rather than always in the same corner. ---

function partitionIntoCages(n: number, maxCageSize: number): Cell[][] {
  const visited = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  const order = shuffle(allCells(n));
  const regions: Cell[][] = [];

  for (const [r, c] of order) {
    if (visited[r][c]) continue;

    const targetSize = randomInt(1, maxCageSize);
    const region: Cell[] = [[r, c]];
    visited[r][c] = true;

    while (region.length < targetSize) {
      const neighbors = collectUnvisitedNeighbors(region, visited, n);
      if (neighbors.length === 0) break;
      const [nr, nc] = neighbors[randomInt(0, neighbors.length - 1)];
      region.push([nr, nc]);
      visited[nr][nc] = true;
    }
    regions.push(region);
  }
  return regions;
}

function collectUnvisitedNeighbors(region: Cell[], visited: boolean[][], n: number): Cell[] {
  const seen = new Set<string>();
  const result: Cell[] = [];
  for (const [r, c] of region) {
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || rr >= n || cc < 0 || cc >= n || visited[rr][cc]) continue;
      const key = `${rr},${cc}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push([rr, cc]);
    }
  }
  return result;
}

function allCells(n: number): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) cells.push([r, c]);
  }
  return cells;
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
