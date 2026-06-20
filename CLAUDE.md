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
- Folder structure created per brief §9 (empty, placeholder `.gitkeep` files)

### Next
- Build the `PuzzleGame` shared interface and `core/models` entities (`ChildProfile`, `GameProgress`, `Attempt`, `PuzzleVaultProgress` — see brief §8)
- Build Progress Store service (localStorage-backed, keyed by child profile)
- Build Adaptive Difficulty Service (per-game rolling window, promote/demote rules — brief §5)
- Build Game Shell component (shared chrome: timer, input, feedback, tier/streak indicator)
- Build Kakooma (first game)
