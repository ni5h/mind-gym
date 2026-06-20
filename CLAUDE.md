# Mind Gym — CLAUDE.md

## What This Is

A web app for Neo (age 9) that trains mathematical *thinking* — pattern recognition, problem decomposition, order-of-operations reasoning — rather than drilling arithmetic procedures. Game-like puzzles, no lectures. Personal project, but built cleanly enough to scale if it proves out.

Full product brief: [mental-models-gym-spec.md](mental-models-gym-spec.md) — read this first for game specs, data shapes, and the adaptive difficulty design. This file covers setup/conventions only; the brief is the source of truth for product behavior.

## Tech Stack

- Angular 21, standalone components, TypeScript
- Tailwind v4 (`src/tailwind.css` imported alongside `src/styles.scss` in `angular.json`)
- Browser localStorage for all progress in V1 — no backend
- No test infra set up for V1 (deliberate — personal project, fast iteration prioritized). `ng test` scaffold exists (Vitest) but is unused. Revisit for KenKen grid generation and the Four 4s expression evaluator if bugs show up there — those are the two places correctness bugs are most likely to hide silently.

## Folder Structure

```
src/app/
  games/
    kakooma/  skip-counting/  kenken/  number-pyramid/  magic-square/  four-fours/
  puzzle-vault/
  core/
    services/   (difficulty-engine.service.ts, progress-store.service.ts)
    models/
  shared/        (number-input, timer-display, feedback-toast components)
```

Each game folder is self-contained: its own generator + validator conforming to a shared `PuzzleGame` interface (TBD in `core/models`), plus its own components. Game folders don't import from each other.

## Local Dev

```bash
npm start      # ng serve, http://localhost:4200
npm run build
```

## Build Order (see brief §10 for full detail)

1. Core shell + Progress Store + Adaptive Difficulty Service + **Kakooma**
2. Skip Counting
3. KenKen (expect longest — grid generation)
4. Number Pyramid
5. Magic Square
6. Four 4s
7. Puzzle Vault (seed content + browser)

## Current Status (as of 2026-06-20)

### Done
- Repo initialized, Angular 21 app scaffolded at root, Tailwind v4 wired in
- Folder structure created per brief §9
- **Phase 1 complete**: `core/models` (`ChildProfile`, `GameProgress`, `Attempt`, `TierConfig`, `PuzzleGame<TPuzzle, TAnswer>`, `PuzzleVaultProgress` reserved), `ProgressStoreService` (localStorage, keyed by profile), `DifficultyEngineService` (pure promote/demote logic per brief §5), shared chrome (`TimerDisplayComponent`, `FeedbackToastComponent`, `GameShellComponent`), **Kakooma** (`kakooma.engine.ts` generator/validator + `kakooma.component.ts`), `HomeComponent` with game grid (other games shown as "coming soon"), routing wired (`/`, `/kakooma`, both lazy-loaded)
- Verified end-to-end in a real browser (Playwright against `ng serve`): puzzle generation, answer validation, feedback overlay, streak/tier display, no console errors

- **Phase 2 complete**: shared `NumberInputComponent` (plain input/output, not `model()` — needed for binding against array-signal slots like `answers()[i]`), **Skip Counting** (`skip-counting.engine.ts` + component). Tier 1 single blank at the end, Tier 2 single blank in the middle, Tier 3 two non-adjacent blanks with larger steps. Index 0 of the sequence is never blanked by design, so `validate()` can always recover true values from `sequence[0] + idx * step` without storing hidden state.
- **Phase 3 complete**: **KenKen** (`kenken.engine.ts` + component). Generation is grid-first: a randomized valid Latin square (cyclic base grid, then row/column shuffle + value relabelling — all validity-preserving), then cages are overlaid via randomized contiguous region growing, then each cage's operation/target is derived from the actual grid values (filtered to the tier's allowed ops; `÷` only offered when evenly divisible). Single-cell cages are rendered as pre-filled "givens", matching classic KenKen convention. `validate()` checks row/column uniqueness + cage math directly against the player's grid — it does **not** compare to the generation grid, since a cage layout can have more than one valid fill and any of them should count as correct. Verified with a standalone backtracking solver (60 trials across all 3 tiers): every generated puzzle was solvable and the validator accepted the found solution.
- **Phase 4 complete**: **Number Pyramid** (`number-pyramid.engine.ts` + component). `rows[0]` is the base, each row up is one shorter, ending at the apex — `rows[r][c] === rows[r-1][c] + rows[r-1][c+1]` is the one relation that drives both generation and validation, so forward and reverse mode share the same `validate()` with no special-casing (it just checks every originally-given cell is preserved and every parent-child relation holds). Forward mode (tier 1, and half of tier 2) reveals only the base; reverse mode (half of tier 2, all of tier 3) reveals everything except 1–2 non-adjacent base cells. Verified with a generic constraint-propagation solver (fills any cell solvable from known neighbours, forward or backward) — 90/90 trials passed across all 3 tiers, with the forward/reverse mix per tier matching spec exactly.
- **Phase 5 complete**: **Magic Square** (`magic-square.engine.ts` + component). Generates from a known-valid base square — the Lo Shu square for 3×3 (the only 3×3 magic square on 1–9, up to symmetry), a Dürer-style diagonal-method square for 4×4 — then applies a random symmetry (8 rotations/reflections) and optionally the complement transform (`v → size²+1-v`, which preserves the magic property and the 1..n² permutation). `validate()` is structural like KenKen: checks the player's grid uses 1..size² exactly once, every given cell is preserved, and every row/column/diagonal hits the target sum — not a comparison to the generation square. Verified with a brute-force permutation solver over the hidden cells (45/45 trials across all 3 tiers).
- **Phase 6 complete**: **Four 4s** (`four-fours.engine.ts` + component) — **all six games are now built**. Structurally different from the grid games: there's no fixed solution to mask, so `generate()` brute-forces the set of integer values reachable from four 4s under the tier's allowed operators (a tiny search — 4 values, 16 subsets, every split = every parenthesization) and picks a target from whatever lands in the tier's range. Tier 1 had to use `{+, ÷}` rather than a more "introductory-feeling" pair — `{+,-}` on four equal digits can only reach multiples of 4 (every term is ±4), and `{+,×}` can't go below 16 at all (both ops only grow positive values), so division is mathematically required to hit small targets. The UI is tap-to-build (digit tiles consumed by index, reusable operator/bracket tiles), not free-text — invalid taps are disabled at construction time (alternating value/operator grammar) rather than parsed-and-rejected after the fact, with a live `= N` preview. `validate()` doesn't know about tiers/allowed-ops at all — it only checks the digit multiset and the evaluated result, so a tier-1 player who taps into territory beyond `{+,÷}` would still be marked correct if the UI ever exposed that (it doesn't, but the validator doesn't need to care). Verified directly: candidate-target coverage per tier, the expression evaluator (precedence/brackets/div-by-zero/malformed input), and validate() accepting a correct cross-operator solution while rejecting wrong digit counts and wrong totals.

### Notes for future work
- Kakooma's tier `targetTimeMs` values (10s/15s/20s) are placeholder guesses — tune once there's real play data from Neo. Same for Skip Counting (8s/12s/20s), KenKen (25s/50s/90s), Number Pyramid (15s/25s/45s), Magic Square (20s/35s/60s), and Four 4s (30s/45s/75s).
- `KakoomaEngine` rejects generated groups with more than one valid sum/product relationship (ambiguous puzzles) and retries.
- Dynamic Tailwind classes built via template-string interpolation (e.g. `` `border-${side}-2` ``) don't get picked up by Tailwind's static scanner — they silently produce no CSS. `kenken.component.ts`'s `sideBorder()` works around this with a literal lookup table. The other games avoided the issue entirely by sticking to static class strings.
- The three grid games (KenKen, Number Pyramid, Magic Square) share the same shape: a `CellViewModel[][]` built from the puzzle, an `answer` signal pre-filled with givens, `setCell`/`onCellInput`/`submit` following an identical pattern. Four 4s doesn't fit that mold (expression-builder, not a grid) and that's expected.
- Four 4s' tier-1 reachable targets only cover {1,2,3,6,8,9} out of 1–10 (missing 4,5,7,10) — not every integer is achievable with exactly four 4s under a restricted operator set. This is a real mathematical constraint, not a bug; tier 2/3 have progressively better coverage as more operators become available.
- The "structural validation" pattern (validate against the relation/constraints, not a stored solution grid) has now paid off twice — KenKen (multiple valid fills per cage layout) and Number Pyramid (forward/reverse sharing one validator). Magic Square should likely follow the same approach.

### Next
- Puzzle Vault (Phase 7 — seed ~15-20 lateral-thinking puzzles + a difficulty-ordered browser; not adaptively tiered like the six drill games)
