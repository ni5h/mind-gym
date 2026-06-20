import { PuzzleGame, TierConfig } from '../../core/models';
import { KakoomaOperation, KakoomaPuzzle } from './kakooma.model';

// Target times are starting guesses, tunable later once we see how Neo actually plays.
const TIERS: TierConfig[] = [
  { tier: 1, targetTimeMs: 10_000 },
  { tier: 2, targetTimeMs: 15_000 },
  { tier: 3, targetTimeMs: 20_000 },
];

interface TierShape {
  groupSize: number;
  operandRange: [number, number];
  operations: KakoomaOperation[];
}

const TIER_SHAPES: Record<number, TierShape> = {
  1: { groupSize: 4, operandRange: [1, 9], operations: ['add'] },
  2: { groupSize: 5, operandRange: [10, 99], operations: ['add'] },
  3: { groupSize: 6, operandRange: [10, 99], operations: ['add', 'multiply'] },
};

// Multiplication grows fast, so even at tier 3 keep operands small enough to stay sane.
const MULTIPLY_OPERAND_RANGE: [number, number] = [2, 9];
const MAX_GENERATION_ATTEMPTS = 50;

export class KakoomaEngine implements PuzzleGame<KakoomaPuzzle, number> {
  readonly gameId = 'kakooma';
  readonly tiers = TIERS;

  generate(tier: number): KakoomaPuzzle {
    const shape = TIER_SHAPES[tier] ?? TIER_SHAPES[1];
    const operation = pick(shape.operations);
    const operandRange = operation === 'multiply' ? MULTIPLY_OPERAND_RANGE : shape.operandRange;

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const puzzle = this.tryGenerate(shape.groupSize, operandRange, operation);
      if (puzzle) return puzzle;
    }
    throw new Error('Failed to generate a valid Kakooma puzzle after max attempts');
  }

  validate(puzzle: KakoomaPuzzle, answer: number): boolean {
    return answer === puzzle.answerIndex;
  }

  private tryGenerate(
    groupSize: number,
    [min, max]: [number, number],
    operation: KakoomaOperation,
  ): KakoomaPuzzle | null {
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    const target = operation === 'add' ? a + b : a * b;

    const distractorMax = Math.max(max, target);
    const used = new Set([a, b, target]);
    const distractors: number[] = [];

    while (distractors.length < groupSize - 3) {
      const candidate = randomInt(min, distractorMax);
      if (used.has(candidate)) continue;
      used.add(candidate);
      distractors.push(candidate);
    }

    const numbers = shuffle([a, b, target, ...distractors]);

    // Reject groups where a distractor coincidentally forms a second valid relationship —
    // the puzzle must have exactly one unambiguous answer.
    if (countValidPairs(numbers, operation) !== 1) return null;

    return { numbers, answerIndex: numbers.indexOf(target), operation };
  }
}

function countValidPairs(numbers: number[], operation: KakoomaOperation): number {
  let count = 0;
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const combined = operation === 'add' ? numbers[i] + numbers[j] : numbers[i] * numbers[j];
      if (numbers.some((n, k) => k !== i && k !== j && n === combined)) count++;
    }
  }
  return count;
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
