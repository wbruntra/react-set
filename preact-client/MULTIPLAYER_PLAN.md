# Preact-client Multiplayer Plan

Status: **planning**. This document is the implementation plan for bringing
multiplayer to `preact-client`, ported from the working `vite-client`
implementation, in a **backend-agnostic** way.

## Goals

1. Port multiplayer (shared-device + networked host/guest) to the preact-client.
2. Keep game logic **pure and shared** in `@react-set/common`, so authority can
   live anywhere (host browser today, a bun+websockets server later).
3. Put the network behind a **`GameTransport` interface**, so swapping
   Firebase → bun/websockets is a one-line factory change, not a rewrite.
4. Improve/clean up the logic as we port it (see "Refactors" per phase).

## Key decisions (locked)

- **Order:** Phase 0 (pure multiplayer logic in `common`) + Phase 6
  (shared-device, no backend) **first**, to learn the shape before touching the
  network. Networked phases (1–5) follow.
- **Backend:** Firebase (Firestore) as the realtime transport, same
  host-authoritative pub/sub model as the vite-client.
- **Auth:** **nickname-only**. No Google sign-in required. Players type a
  nickname to identify themselves. (If Firestore security rules require an
  authenticated principal, use Firebase **anonymous auth** under the hood — the
  user never sees a sign-in step.) Auth stays behind an `AuthProvider` seam so
  it's swappable.

## How multiplayer works today (reference: vite-client)

Two independent modes:

- **Shared-device** (`SharedDevice.tsx`): local hot-seat, N players on one
  screen. **No backend** — pure local state + timers.
- **Networked host/guest** (`Host/useHostGame.ts`, `Guest/useGuestGame.ts`):
  **host-authoritative pub/sub over Firestore**. The Express server is not
  involved.

Networked model:

| Concern             | Firestore mechanism                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Shared game state   | `games/{id}` doc — host writes, everyone subscribes (`onSnapshot`)                            |
| Guest→host messages | `games/{id}/actions` subcollection — guests append (`join`, `found`); host consumes + deletes |
| Keepalive / resume  | host writes `lastUpdate` every 30s; resume via `query(creator_uid == me)`                     |
| Authority           | host runs set-validation + scoring; guests are optimistic-UI only                             |

The host owns all game logic; the network is just a pipe carrying (a) state
snapshots host→all and (b) actions guest→host. That pattern maps onto Firestore
_or_ websockets — as long as logic is shared and transport is abstracted.

---

## Phase 0 — Pure multiplayer state machine in `common`

Mirror the Solo/Training extraction: pure, framework-free, unit-testable. No
`localStorage`, no timers, no Firestore.

**New file:** `common/src/game/multiplayer.ts`

Types:

```ts
export interface MultiPlayer {
  name: string
  color: string
  score: number
  host: boolean
  uid?: string
}
export interface MultiPlayers {
  [name: string]: MultiPlayer
}

export interface MultiGameState {
  board: string[]
  deck: string[]
  selected: string[]
  players: MultiPlayers
  declarer: string | null
  setFound: boolean
  gameStarted: boolean
  gameOver: string | null // winner name, or null  (UNIFIED type — see refactors)
}

export type GameAction =
  | { type: 'join'; payload: { name: string; uid?: string } }
  | { type: 'found'; payload: { name: string; selected: string[] } }
```

Host reducers (pure `(state, …) => state` or `=> { state, effects }`):

- `createMultiGame(hostName): MultiGameState` — deal board/deck, seed host player.
- `applyJoin(state, name, uid): MultiGameState` — add player w/ next color; ignore dup names.
- `applyFound(state, selected, declarer): MultiGameState` — verify all cards on
  board + no current declarer, set declarer + `setFound`.
- `markPoint(state, declarer): { state, gameOver: string | null }` — award point,
  decide winner. **No side effects** (cleanup is the hook's job).
- `removeSet(state, declarer): MultiGameState` — if valid set: score, clear
  declarer/selected, deal replacements.
- `hostCardClick(state, card): MultiGameState` — host's own selection/declare.
- `redeal(state): MultiGameState`.

Guest reducers:

- `guestCardClick(state, card, myName): { state, action?: GameAction }` — local
  optimistic selection; emit a `found` action when a valid set is selected.
- `mergeIncomingState(local, incoming): MultiGameState` — reconcile a host
  snapshot with the guest's in-flight local selection (the subtle bit — see
  refactors). Pure + tested.
- `resetLocalSelected(state): MultiGameState` — clear a stale bad selection.

Export all from `common/src/index.ts`. Rebuild `common` (`cd common && tsc`)
after — clients resolve `@react-set/common` from `dist/`.

**Refactors folded in here:**

- Unify `gameOver` to `string | null` (vite has `string | boolean`).
- `markPoint` returns the game-over decision; the hook performs deletion/cleanup.
- Replace magic numbers (`4000`ms set-display, `30000`ms keepalive) with
  `GAME_CONFIG` constants.
- Extract `mergeIncomingState` as a named, tested function (was inline in guest
  `processUpdate`).
- Drop `console.log` noise.

---

## Phase 6 — Shared-device mode (no backend)

Independent of the network. Pure `common` reducer + local Preact state + timers.
Good first build to validate the multiplayer reducers and board reuse.

**Reuse:** the existing `Board` component already supports `gameMode="versus"`,
`declarer`, and `players` — shared-device renders through it.

**New files (preact-client):**

- `src/components/SharedDevice/SharedDevice.tsx` — player-count setup → game →
  game-over. Renders `Board` + per-player score frames.
- `src/components/SharedDevice/useSharedDevice.ts` — thin hook: local state +
  declaration timer + set-found timer, delegating transitions to `common`.

**Logic (mostly reuses Phase 0 + existing `common`):**

- `createPlayers(n)` — N local players, colors from `GAME_CONFIG.colors`.
- Tap a player frame to "declare", then pick 3 cards; declaration timer
  (`GAME_CONFIG.turnTime`) penalizes on expiry; valid set scores via the shared
  reducer; first to `GAME_CONFIG.playingTo` wins.
- No transport, no auth, no nicknames.

**Menu wiring:** add a "Shared Device" entry (currently the preact menu only has
Solo + Training; Host/Join are disabled placeholders). Hash route `#/shared`.

**Refactors folded in:** lift any reusable shared-device transitions into the
`common` multiplayer module rather than duplicating them in the component.

---

## Phases 1–5 — Networked host/guest (Firebase, nickname auth) — LATER

Sketched now; detailed when we start them.

- **Phase 1 — `GameTransport` interface.** `src/multiplayer/transport.ts`.
  Wire types (`GameAction`, serializable state) live in `common` for future
  server reuse.

  ```ts
  interface GameTransport {
    createGame(id, initialState): Promise<void>
    updateState(id, partial): Promise<void> // host → all
    subscribeState(id, cb): Unsubscribe // all
    sendAction(id, action): Promise<ActionId> // guest → host
    subscribeActions(id, cb): Unsubscribe // host
    consumeAction(id, actionId): Promise<void> // host ack (Firestore: delete)
    findResumable(ownerId): Promise<GameSummary[]>
    deleteGame(id): Promise<void>
  }
  ```

- **Phase 2 — `FirebaseTransport`.** Add `firebase` dep + `firebaseConfig.ts`;
  port Firestore `onSnapshot`/`setDoc`/`addDoc`/`query` behind the interface.
  Keepalive handled internally.

- **Phase 3 — `useHostGame` / `useGuestGame` hooks (thin).** Common reducers +
  **injected** transport + framework effects (subscriptions, optimistic
  selection, set-found timer). Transport injected so a websocket swap leaves
  hooks untouched.

- **Phase 4 — UI:** port Host, Guest, Lobby, PlayerList to Preact; reuse `Board`.

- **Phase 5 — Auth + routing + menu.** Nickname entry behind `AuthProvider`
  (optionally Firebase anonymous auth under the hood); hash routes `#/host`,
  `#/lobby`, `#/game/:id`; enable the disabled "Host Game" / "Join Game" menu
  cards.

**Backend-swap path (future):** implement `WebSocketTransport implements
GameTransport` against a bun+ws server; flip the transport factory. Because game
logic is in `common`, a bun server can even run the _same_ reducers to become
authoritative — the interface supports relay-mode and authoritative-mode alike.

---

## Cross-cutting refactors (apply throughout)

- Keep pure logic in `common`; keep persistence/timers/transport/flash in the
  client (the pattern established for Solo/Training).
- Unify types (`gameOver`, player shapes) across modes.
- Separate side effects from state transitions.
- Replace magic numbers with `GAME_CONFIG` / shared constants.
- Remove debug `console.log`s.
- Reuse `Board` everywhere instead of bespoke board markup.

## Build/verify reminders

- After editing `common`, rebuild it (`cd common && npx tsc`) or clients won't
  see new exports.
- Verify each phase with `cd preact-client && npm run build` (tsc + vite).
- Manual gameplay check per phase (shared-device: declare → pick → score →
  win/penalty paths).
