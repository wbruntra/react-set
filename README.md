# React Set

A multiplayer [Set card game](<https://en.wikipedia.org/wiki/Set_(card_game)>) built with Preact, Hono, Bun, and SQLite.

## Game Modes

| Mode              | Description                                          |
| ----------------- | ---------------------------------------------------- |
| **Solo**          | Play against a CPU opponent (adjustable difficulty)  |
| **Training**      | Timed practice — find Sets before the clock runs out |
| **Shared Device** | Hot-seat local multiplayer on one device             |
| **Host / Guest**  | Networked multiplayer — host a game, share a code    |

## Stack

| Layer             | Tech                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Frontend          | Preact + Vite                                                      |
| Backend           | Hono + Bun (WebSockets on `/ws`, port 5002)                        |
| Database          | SQLite via Knex                                                    |
| Auth / Realtime   | Firebase (anonymous auth; Firestore transport for networked games) |
| Shared game logic | `@react-set/common` (pure state machines, no side effects)         |

## Workspace Packages

```
common/          @react-set/common   — game rules, solo/training/multiplayer state machines
preact-client/                       — primary frontend (all game modes)
backend/                             — Hono + WebSocket server
database/        @react-set/database — Knex config, migrations, SQLite connection
vite-client/                         — legacy React frontend (not actively maintained)
```

## Getting Started

**Prerequisites:** [Bun](https://bun.sh) ≥ 1.3

```bash
bun install
```

### Build shared library

The `common` package must be compiled before the clients can use it:

```bash
bun run common:build
```

### Run database migrations

```bash
cd database && bun run migrate
```

This creates `database/react-db-dev.sqlite3` with the full schema.

### Start dev servers

```bash
# Backend (port 5002, watch mode)
bun run backend:dev

# Preact client (Vite dev server)
bun run preact:dev
```

## Environment

### `preact-client/.env`

```
VITE_TRANSPORT=firebase   # use Firebase Firestore for networked multiplayer
# or
VITE_TRANSPORT=websocket  # use the Hono/WebSocket backend instead
```

Solo, Training, and Shared Device modes work with either value — no backend connection required.

### Backend

```
PORT=5002    # optional, defaults to 5002
NODE_ENV=development
```

## Production Build

```bash
bun run common:build
bun run preact:build   # also rebuilds common via prebuild hook
```

Output: `preact-client/dist/`

## Migrations

Migrations live in `database/migrations/` and are managed with Knex.

```bash
# Apply all pending migrations
cd database && bun run migrate

# From the backend package
bun run migrate
bun run migrate:rollback
```
