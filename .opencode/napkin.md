# Napkin

## Corrections

| Date       | Source | What Went Wrong                                                                           | What To Do Instead                                                                       |
| ---------- | ------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 2026-04-27 | self   | First O(n^2) benchmark version was slower at small board sizes due to string/map overhead | Use precomputed card-index third-card lookup table for countSets optimization benchmarks |

## User Preferences

- Do not start server/client automatically; user runs them manually.

## Patterns That Work

- Review attached repo instructions (`AGENTS.md`, `.github/copilot-instructions.md`) before making code edits.
- For Set-card computations, precomputing 81-card lookup tables removes runtime string math and yields large speedups.

## Patterns That Don't Work

-

## Domain Notes

- React Set game: Vite client in `vite-client/`, Express server at repo root.
