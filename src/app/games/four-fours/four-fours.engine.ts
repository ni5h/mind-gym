import { PuzzleGame, TierConfig } from '../../core/models';
import { FourFoursOperator, FourFoursPuzzle, FourFoursToken } from './four-fours.model';

// Target times are starting guesses, tunable later once there's real play data.
const TIERS: TierConfig[] = [
  { tier: 1, targetTimeMs: 30_000 },
  { tier: 2, targetTimeMs: 45_000 },
  { tier: 3, targetTimeMs: 75_000 },
];

interface TierShape {
  operators: FourFoursOperator[];
  targetRange: [number, number];
}

// Four equal digits with only +/- can only ever land on multiples of 4 (every term is
// ±4), and +/× alone can't go below 16 (both operations only grow positive values) —
// so hitting small targets at all requires division as one of the tier-1 operators.
const TIER_SHAPES: Record<number, TierShape> = {
  1: { operators: ['+', '÷'], targetRange: [1, 10] },
  2: { operators: ['+', '-', '÷'], targetRange: [1, 20] },
  3: { operators: ['+', '-', '×', '÷'], targetRange: [1, 50] },
};

const DIGIT = 4;
const DIGIT_COUNT = 4;

/**
 * Unlike the grid games, there's no fixed solution to mask — generation instead
 * brute-forces the full set of integer values reachable from four 4s with the tier's
 * allowed operators (a tiny search at this size: 4 values, 16 subsets), then picks a
 * target from whichever land in the tier's range. This guarantees every generated
 * target is actually solvable with the operators the UI exposes for that tier.
 *
 * validate() doesn't know about tiers or allowed operators at all — it only checks
 * that the player's expression uses exactly the puzzle's digits and evaluates to the
 * target, so any correct arrangement counts, same structural-validation approach as
 * the grid games.
 */
export class FourFoursEngine implements PuzzleGame<FourFoursPuzzle, FourFoursToken[]> {
  readonly gameId = 'four-fours';
  readonly tiers = TIERS;

  operatorsForTier(tier: number): FourFoursOperator[] {
    return (TIER_SHAPES[tier] ?? TIER_SHAPES[1]).operators;
  }

  generate(tier: number): FourFoursPuzzle {
    const shape = TIER_SHAPES[tier] ?? TIER_SHAPES[1];
    const digits = Array.from({ length: DIGIT_COUNT }, () => DIGIT);

    const reachable = computeReachableValues(digits, shape.operators);
    const candidates = [...reachable].filter(
      (v) => Number.isInteger(v) && v >= shape.targetRange[0] && v <= shape.targetRange[1],
    );
    if (candidates.length === 0) {
      throw new Error(`No reachable integer target in range for tier ${tier}`);
    }

    return { digits, target: pick(candidates) };
  }

  validate(puzzle: FourFoursPuzzle, answer: FourFoursToken[]): boolean {
    const usedDigits = answer
      .filter((t): t is number => typeof t === 'number')
      .sort((a, b) => a - b);
    const requiredDigits = [...puzzle.digits].sort((a, b) => a - b);
    if (usedDigits.length !== requiredDigits.length) return false;
    if (!usedDigits.every((v, i) => v === requiredDigits[i])) return false;

    const result = evaluateTokens(answer);
    return result !== null && Math.abs(result - puzzle.target) < 1e-9;
  }
}

/**
 * Evaluates a fully-formed token expression with standard precedence and brackets.
 * Returns null for malformed input (unbalanced brackets, trailing tokens, division by
 * zero) rather than throwing, since this also validates untrusted input.
 */
export function evaluateTokens(tokens: FourFoursToken[]): number | null {
  let pos = 0;

  function parseExpr(): number | null {
    let value = parseTerm();
    if (value === null) return null;
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos] as '+' | '-';
      pos++;
      const rhs = parseTerm();
      if (rhs === null) return null;
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number | null {
    let value = parseFactor();
    if (value === null) return null;
    while (tokens[pos] === '×' || tokens[pos] === '÷') {
      const op = tokens[pos] as '×' | '÷';
      pos++;
      const rhs = parseFactor();
      if (rhs === null) return null;
      if (op === '÷') {
        if (rhs === 0) return null;
        value = value / rhs;
      } else {
        value = value * rhs;
      }
    }
    return value;
  }

  function parseFactor(): number | null {
    const token = tokens[pos];
    if (typeof token === 'number') {
      pos++;
      return token;
    }
    if (token === '(') {
      pos++;
      const value = parseExpr();
      if (value === null || tokens[pos] !== ')') return null;
      pos++;
      return value;
    }
    return null;
  }

  const result = parseExpr();
  return result !== null && pos === tokens.length ? result : null;
}

/**
 * Brute-force search over every way to split `values` into two non-empty groups and
 * combine their reachable values — equivalent to trying every parenthesization, since
 * combining pre-computed subgroup results at each split covers every grouping
 * recursively. Fine at this size (4 values => 16 subsets); would need memoization to
 * scale beyond that.
 */
function computeReachableValues(values: number[], operators: FourFoursOperator[]): Set<number> {
  if (values.length === 1) return new Set(values);

  const results = new Set<number>();
  const n = values.length;
  const fullMask = (1 << n) - 1;

  for (let mask = 1; mask < fullMask; mask++) {
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) left.push(values[i]);
      else right.push(values[i]);
    }

    const leftValues = computeReachableValues(left, operators);
    const rightValues = computeReachableValues(right, operators);

    for (const a of leftValues) {
      for (const b of rightValues) {
        for (const op of operators) {
          const combined = applyOperator(a, b, op);
          if (combined !== null) results.add(combined);
        }
      }
    }
  }
  return results;
}

function applyOperator(a: number, b: number, operator: FourFoursOperator): number | null {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? null : a / b;
  }
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
