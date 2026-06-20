# Mental Models Gym — Project Brief (v1)

## 1. Vision

A web app for Neo (age 9) that trains mathematical *thinking* — pattern recognition, problem decomposition, order-of-operations reasoning — rather than drilling arithmetic procedures. Format: short, game-like puzzles, not worksheets. No lectures, no formula-first instruction. The child should open the app and start playing immediately.

## 2. Scope for V1

- **Operations covered:** addition, subtraction, multiplication, division, BODMAS (order of operations)
- **Games, in build order:** Kakooma → Skip Counting → KenKen → Number Pyramid → Magic Square → Four 4s
- **Plus:** a separate "Puzzle Vault" — classic lateral-thinking/logic puzzles, served by difficulty
- **No AI required for V1.** Pure frontend, local storage for progress.
- **No reasoning/explanation capture in V1** — but the attempt data model should leave a clean place to add a `reasoning_text` field later without restructuring (see §8).

## 3. Tech Stack

- Angular 19, TypeScript, standalone components (same stack as the Sweet Pills project)
- Browser local storage for progress in V1 — no backend dependency required
- Architecture should not preclude adding Supabase sync later for cross-device progress, but don't build that now

## 4. Core Architecture Concepts

- **Puzzle Engine** — per-game generator + validator (each game owns its own generation/validation logic, conforming to a shared interface)
- **Adaptive Difficulty Service** — operation/game-scoped, tracks a rolling window of recent attempts and decides tier promotion/demotion
- **Game Shell Component** — shared chrome: timer (silent, not a countdown pressure — just measured), input, feedback, current tier/streak indicator
- **Progress Store** — local-storage-backed, keyed by child profile (single profile for V1, but key it as if multiple could exist later)

## 5. Adaptive Difficulty System

Difficulty state is tracked **per game**, not globally — Neo may be fast at addition but slow at division, so tiers shouldn't be coupled across games.

**Default rules (configurable per game):**
- Rolling window: last 10 attempts
- **Promote one tier** when, over the window: error rate ≤ 10% AND average time-to-answer is below that tier's target time
- **Demote one tier** when: 2 consecutive errors, OR average time over the last 5 attempts exceeds 2× the tier's baseline target time
- Each game defines its own tier ladder (see §6) — most use digit-count progression (1-digit → 2-digit → 3-digit), KenKen uses grid size instead

## 6. Game Specs

### 6.1 Kakooma
- **Rule:** Show a group of numbers (start with 4, scale to 6). One number is the sum (later: product) of two others in the group. Find it.
- **Trains:** pattern recognition, relationship-spotting between numbers
- **Tiers:** Tier 1 — group of 4, single-digit, addition only. Tier 2 — group of 5, two-digit. Tier 3 — group of 6, mixed addition/multiplication relationships.
- **Data shape:** `{ numbers: number[], answerIndex: number, operation: 'add'|'multiply' }`

### 6.2 Skip Counting
- **Rule:** Show a sequence with gaps (e.g. `3, 6, 9, __, 15`). Fill the blanks.
- **Trains:** multiplication/division pattern sense, ahead of formal times tables
- **Tiers:** Tier 1 — count by 2/5/10, single blank at the end. Tier 2 — count by 3/4/6/7/8/9, blank in the middle. Tier 3 — multiple non-adjacent blanks, larger step sizes.
- **Data shape:** `{ sequence: (number|null)[], step: number, missingIndices: number[] }`

### 6.3 KenKen
- **Rule:** Grid puzzle (Sudoku-style no-repeat-per-row/column), divided into "cages." Numbers in a cage must combine via the cage's operation to its target.
- **Trains:** decomposition under constraint — this is the strongest "break the problem down" game on the list
- **Tiers:** grid size is the difficulty axis — 3×3 (addition-only cages) → 4×4 (add/subtract) → 5×5–6×6 (all four operations)
- **Data shape:** `{ gridSize: number, cages: { cells: [row,col][], operation: '+'|'-'|'×'|'÷', target: number }[] }`
- **Note:** likely the most complex game to build — generation needs a valid-grid-first-then-cage-overlay approach, not random cage placement.

### 6.4 Number Pyramid
- **Rule:** Each brick equals the sum (or difference) of the two bricks below it. Forward mode: build up from the base. Reverse mode: given the top, find the missing base bricks.
- **Trains:** addition/subtraction fluency, working backward from a goal (reverse mode)
- **Tiers:** Tier 1 — 3-row pyramid, forward only. Tier 2 — 4-row, forward + reverse. Tier 3 — 5–6 row, reverse mode with multiple unknowns.
- **Data shape:** `{ rows: (number|null)[][], mode: 'forward'|'reverse' }`

### 6.5 Magic Square
- **Rule:** Fill a grid so every row, column, and diagonal sums to the same number.
- **Trains:** trial-and-adjustment, addition fluency, holding multiple constraints at once
- **Tiers:** Tier 1 — 3×3, most cells pre-filled. Tier 2 — 3×3, fewer given cells. Tier 3 — 4×4.
- **Data shape:** `{ size: number, grid: (number|null)[][], targetSum: number }`

### 6.6 Four 4s
- **Rule:** Using exactly four 4s (or another fixed digit-set) and any of +,−,×,÷ and brackets, construct a given target number.
- **Trains:** order-of-operations (BODMAS) reasoning directly — bracket placement changes the outcome, which is the core insight
- **Tiers:** Tier 1 — targets 1–10, two operations allowed. Tier 2 — targets 1–20. Tier 3 — targets up to 50, all four operations + nested brackets required.
- **Data shape:** `{ digits: number[], target: number }` — validation needs an expression parser/evaluator, not just answer-matching, since multiple valid expressions exist.

## 7. Puzzle Vault (Lateral-Thinking Repository)

A separate section from the drill games above — one-off classic logic puzzles, browsed by difficulty rather than adaptively tiered (these aren't meant to be repeated/drilled).

**Seed categories for V1:**
- **Measuring/jug puzzles** — e.g. "You have a 3L and a 5L bucket. How do you measure exactly 4L?"
- **River-crossing puzzles** — e.g. wolf/goat/cabbage, or the classic "two people, one boat, constraints" family
- **Weighing/balance puzzles** — e.g. "Find the one heavier coin among 9, using a balance scale only twice"
- **Matchstick puzzles** — move one stick to fix an equation or shape

**Data shape:**
```
{
  id: string,
  category: 'measuring'|'crossing'|'weighing'|'matchstick',
  difficulty: 1-5,
  prompt: string,
  hints: string[],       // progressive hints, revealed on request
  solution: string,
  explanation: string
}
```

V1 build task: seed ~15–20 hand-written puzzles across the four categories at varying difficulty, structured as JSON so the repository is trivially expandable later (this is a Phase 7 task, not part of this brief).

## 8. Data Model (entities)

- `ChildProfile` — id, name (single profile for V1, but keyed for future multi-child support)
- `GameProgress` — per game: current tier, rolling window of recent attempts (time, correct/incorrect)
- `Attempt` — gameId, timestamp, timeTakenMs, correct, **`reasoningText?: string` (unused in V1, reserved for later)**
- `PuzzleVaultProgress` — puzzles solved, current difficulty position per category

## 9. Suggested Folder Structure

```
src/app/
  games/
    kakooma/
    skip-counting/
    kenken/
    number-pyramid/
    magic-square/
    four-fours/
  puzzle-vault/
  core/
    services/        (difficulty-engine.service.ts, progress-store.service.ts)
    models/
  shared/             (number-input, timer-display, feedback-toast components)
```

## 10. Phased Build Order

1. Core shell + Progress Store + Adaptive Difficulty Service + **Kakooma**
2. **Skip Counting**
3. **KenKen** (expect this to take longest — grid generation logic)
4. **Number Pyramid**
5. **Magic Square**
6. **Four 4s**
7. **Puzzle Vault** — seed content + simple difficulty-ordered browser

## 11. Explicitly Out of Scope for V1

- AI-generated puzzles
- Free-text reasoning capture (schema reserved, not built)
- Multi-child / multi-tenant support
- Backend, auth, or cross-device sync
