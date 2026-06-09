# Napkin

## Corrections

| Date       | Source | What Went Wrong                                                                           | What To Do Instead                                                                                                                                                   |
| ---------- | ------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-27 | self   | First O(n^2) benchmark version was slower at small board sizes due to string/map overhead | Use precomputed card-index third-card lookup table for countSets optimization benchmarks                                                                             |
| 2026-06-09 | user   | Preact SVG shapes rendered with thin (default=1) outlines after porting from React        | In preact-client, SVG presentation attrs must be kebab-case (`stroke-width`, `stroke-dasharray`) — Preact does NOT translate camelCase `strokeWidth` like React does |

## User Preferences

- Do not start server/client automatically; user runs them manually.

## Patterns That Work

- Review attached repo instructions (`AGENTS.md`, `.github/copilot-instructions.md`) before making code edits.
- For Set-card computations, precomputing 81-card lookup tables removes runtime string math and yields large speedups.

## Patterns That Don't Work

-

## Domain Notes

- React Set game: Vite client in `vite-client/`, Express server at repo root. Newer `preact-client/` is a Preact port (only Solo + Training implemented so far).
- Shared game _rules AND orchestration_ live in `@react-set/common`. Rules: isSet, nameThird, countSets, makeDeck, CPU timing. Orchestration (pure state machines): `common/src/game/solo.ts` (createInitialSoloState, processFoundSet, handleCardClick, findCpuSet, …) and `common/src/game/training.ts` (reduceCardClick → outcome {ignored|select|set-found|game-over}, reduceTimeout, nextBoard, startTraining, …). These are pure: no localStorage, timers, or flashes — callers perform effects.
- **As of 2026-06: only the preact-client consumes the common orchestration.** vite-client (React) still has its own duplicate copies (`useSoloGame.ts`, `useTrainingGame.ts`) — it bakes side effects (axios stats POST, auth) into setState updaters, so it wasn't migrated. If you change shared gameplay logic, the vite-client won't pick it up until it's migrated too.
- `common` compiles to `dist/` (`cd common && npx tsc`). After editing common, REBUILD it or the clients won't see new exports (preact resolves `@react-set/common` → dist).
- preact client adapters stay thin: Solo `gameState.ts` = localStorage difficulty + re-export common transitions; Training `constants.ts` = high-score persistence (saveHighScore/getHighScoreKey) + re-export TRAINING_CONFIG; `useTrainingGame.ts`/`useTrainingTimer.ts` = effects only. Keep pure logic in common, persistence/timers/flashes in the client.
- preact hooks read latest state via a `gameStateRef` synced each render (`ref.current = state`); event handlers stay plain functions (no useCallback). Timer hooks hold callbacks like `onTimeUp` in a ref so the interval isn't torn down every render.
