import type { GameAction, MultiGameState } from '@react-set/common'
import { db } from '../db'

export interface StoredGame {
  state: MultiGameState
  actions: Map<string, { action: GameAction }>
  nextSeq: number
}

const games = new Map<string, StoredGame>()

// ---------------------------------------------------------------------------
// In-memory helpers
// ---------------------------------------------------------------------------

function makeGame(state: MultiGameState): StoredGame {
  return { state, actions: new Map(), nextSeq: 0 }
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

interface ActionRow {
  seq: number
  type: string
  data: any
}

async function insertAction(gameCode: string, seq: number, type: string, data: any) {
  await db
    .insertInto('game_actions')
    .values({ game_code: gameCode, seq, type, data: JSON.stringify(data) })
    .execute()
}

async function touchGame(gameCode: string) {
  await db
    .updateTable('multiplayer_games')
    .set({ updated_at: new Date().toISOString() })
    .where('code', '=', gameCode)
    .execute()
}

function replayState(initial: MultiGameState, actions: ActionRow[]): MultiGameState {
  let state = { ...initial, selected: [], declarer: null, setFound: false }
  for (const row of actions) {
    if (row.type === 'state_update') {
      state = { ...state, ...row.data }
    } else if (row.type === 'join') {
      const payload = row.data.payload || row.data
      const existing = state.players[payload.name]
      if (!existing) {
        const nextColor = [
          '#4fc3f7',
          '#f48fb1',
          '#2e7d32',
          '#8e24aa',
          '#ffd740',
          '#fb8c00',
          '#f44336',
        ]
        const idx = Object.keys(state.players).length
        state = {
          ...state,
          players: {
            ...state.players,
            [payload.name]: {
              name: payload.name,
              color: nextColor[idx % nextColor.length],
              score: 0,
              host: false,
              uid: payload.uid,
            },
          },
        }
      }
    } else if (row.type === 'found') {
      const payload = row.data.payload || row.data
      if (!state.declarer) {
        state = {
          ...state,
          declarer: payload.name,
          selected: payload.selected,
          setFound: true,
        }
      }
    }
  }
  return state
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getGame(gameId: string): StoredGame | undefined {
  return games.get(gameId)
}

export async function createGame(gameId: string, state: MultiGameState): Promise<StoredGame> {
  const stored = makeGame(state)
  games.set(gameId, stored)

  await db
    .insertInto('multiplayer_games')
    .values({
      code: gameId,
      game_title: state.gameTitle || gameId,
      creator_uid: (state as any).creator_uid || null,
      initial_state: JSON.stringify(state),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute()

  return stored
}

export async function updateGameState(
  gameId: string,
  partial: Partial<MultiGameState>,
): Promise<MultiGameState | undefined> {
  const stored = games.get(gameId)
  if (!stored) return undefined
  stored.state = { ...stored.state, ...partial }

  await touchGame(gameId)

  return stored.state
}

export async function addAction(gameId: string, action: GameAction): Promise<string | undefined> {
  const stored = games.get(gameId)
  if (!stored) return undefined

  const seq = ++stored.nextSeq
  const actionId = String(seq)
  stored.actions.set(actionId, { action })

  await insertAction(gameId, seq, action.type, action)

  return actionId
}

export async function addStateUpdate(
  gameId: string,
  partial: Partial<MultiGameState>,
): Promise<void> {
  const stored = games.get(gameId)
  if (!stored) return

  const seq = ++stored.nextSeq
  await insertAction(gameId, seq, 'state_update', partial)
  await touchGame(gameId)
}

export async function removeAction(gameId: string, actionId: string): Promise<boolean> {
  const stored = games.get(gameId)
  if (!stored) return false
  return stored.actions.delete(actionId)
}

export async function findResumableGames(ownerUid: string): Promise<
  Array<{
    id: string
    gameTitle: string
    players: Record<string, { name: string; host: boolean }>
  }>
> {
  const results: Array<{
    id: string
    gameTitle: string
    players: Record<string, { name: string; host: boolean }>
  }> = []

  // Check in-memory first
  games.forEach((stored, id) => {
    const hasOwner = Object.values(stored.state.players).some((p) => p.host && p.uid === ownerUid)
    if (hasOwner) {
      const players: Record<string, { name: string; host: boolean }> = {}
      for (const [name, p] of Object.entries(stored.state.players)) {
        players[name] = { name: p.name, host: p.host }
      }
      results.push({ id, gameTitle: stored.state.gameTitle || id, players })
    }
  })

  // Also check DB for games not in memory
  const dbGames = await db
    .selectFrom('multiplayer_games')
    .selectAll()
    .where('creator_uid', '=', ownerUid)
    .execute()
  for (const row of dbGames) {
    if (games.has(row.code)) continue
    let playersData: Record<string, { name: string; host: boolean }> = {}
    try {
      const initial = JSON.parse(row.initial_state)
      for (const [name, p] of Object.entries(initial.players || {})) {
        playersData[name] = { name: (p as any).name || name, host: (p as any).host || false }
      }
    } catch {}
    results.push({ id: row.code, gameTitle: row.game_title || row.code, players: playersData })
  }

  return results
}

export async function listJoinableGames(): Promise<
  Array<{
    id: string
    gameTitle: string
    players: Record<string, { name: string; host: boolean }>
  }>
> {
  const results: Array<{
    id: string
    gameTitle: string
    players: Record<string, { name: string; host: boolean }>
  }> = []

  // In-memory first
  games.forEach((stored, id) => {
    if (stored.state.gameStarted) return
    const players: Record<string, { name: string; host: boolean }> = {}
    for (const [name, p] of Object.entries(stored.state.players)) {
      players[name] = { name: p.name, host: p.host }
    }
    results.push({ id, gameTitle: stored.state.gameTitle || id, players })
  })

  // DB games not in memory and not started
  const dbGames = await db
    .selectFrom('multiplayer_games')
    .selectAll()
    .where('started_at', 'is', null)
    .execute()
  for (const row of dbGames) {
    if (games.has(row.code)) continue
    let playersData: Record<string, { name: string; host: boolean }> = {}
    try {
      const initial = JSON.parse(row.initial_state)
      for (const [name, p] of Object.entries(initial.players || {})) {
        playersData[name] = { name: (p as any).name || name, host: (p as any).host || false }
      }
    } catch {}
    results.push({ id: row.code, gameTitle: row.game_title || row.code, players: playersData })
  }

  return results
}

export async function deleteGame(gameId: string): Promise<boolean> {
  games.delete(gameId)
  await db.deleteFrom('multiplayer_games').where('code', '=', gameId).execute()
  return true
}

export async function setGameStarted(gameId: string): Promise<void> {
  const stored = games.get(gameId)
  if (stored) {
    stored.state = { ...stored.state, gameStarted: true }
  }
  await db
    .updateTable('multiplayer_games')
    .set({
      started_at: new Date().toISOString(),
      finished_at: null,
      updated_at: new Date().toISOString(),
    })
    .where('code', '=', gameId)
    .execute()
}

export async function setGameFinished(gameId: string): Promise<void> {
  await db
    .updateTable('multiplayer_games')
    .set({ finished_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .where('code', '=', gameId)
    .execute()
}

/** Called on server startup: reload unfinished games into memory by replaying actions. */
export async function reloadActiveGames(): Promise<void> {
  const activeGames = await db
    .selectFrom('multiplayer_games')
    .selectAll()
    .where('started_at', 'is not', null)
    .where('finished_at', 'is', null)
    .execute()

  for (const row of activeGames) {
    const actions = await db
      .selectFrom('game_actions')
      .select(['seq', 'type', 'data'])
      .where('game_code', '=', row.code)
      .orderBy('seq', 'asc')
      .execute()

    let initialState: MultiGameState
    try {
      initialState = JSON.parse(row.initial_state)
    } catch (e) {
      console.error(`Skipping multiplayer_games row ${row.code}: failed to parse initial_state`, e)
      continue
    }

    const parsedActions = actions.map((a) => ({
      seq: a.seq,
      type: a.type,
      data: typeof a.data === 'string' ? JSON.parse(a.data) : a.data,
    }))

    const state = replayState(initialState, parsedActions)
    games.set(row.code, makeGame(state))
  }

  if (activeGames.length > 0) {
    console.log(`Reloaded ${activeGames.length} active game(s) from database`)
  }
}
