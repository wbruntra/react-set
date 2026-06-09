// Pure, framework-agnostic state machine for multiplayer (shared-device + networked).
// No browser APIs, no timers, no I/O — callers wire those up.
// Each transition takes the current state and returns the next state.

import { cardToggle, countSets, isSet, makeDeck, removeSelected, reshuffle } from '../helpers'
import { GAME_CONFIG } from './constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  gameOver: string | null
  gameTitle?: string
  created?: boolean
}

export type GameAction =
  | { type: 'join'; payload: { name: string; uid?: string } }
  | { type: 'found'; payload: { name: string; selected: string[] } }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nextColor(players: MultiPlayers): string {
  return GAME_CONFIG.colors[Object.keys(players).length % GAME_CONFIG.colors.length]
}

/** Deal a fresh board + deck (12 cards up, guaranteed to contain a set). */
export function dealNewBoard(): Pick<MultiGameState, 'board' | 'deck' | 'selected'> {
  const initialDeck = makeDeck()
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  }
}

/** Verify every card in `selected` still exists on `board`. */
export function cardsOnBoard(board: string[], selected: string[]): boolean {
  return selected.every((c) => board.includes(c))
}

// ---------------------------------------------------------------------------
// Host reducers
// ---------------------------------------------------------------------------

/** Seed a new multiplayer game with the host as first player. */
export function createMultiGame(hostName: string): MultiGameState {
  return {
    ...dealNewBoard(),
    players: {
      [hostName]: { name: hostName, color: GAME_CONFIG.colors[0], score: 0, host: true },
    },
    declarer: null,
    setFound: false,
    gameStarted: false,
    gameOver: null,
  }
}

/** Add a player to the game. Duplicate names are ignored. */
export function applyJoin(state: MultiGameState, name: string, uid?: string): MultiGameState {
  if (Object.keys(state.players).includes(name)) {
    return state
  }
  return {
    ...state,
    players: {
      ...state.players,
      [name]: {
        name,
        color: nextColor(state.players),
        score: 0,
        host: false,
        ...(uid !== undefined && { uid }),
      },
    },
  }
}

/**
 * A player claims a set. Guard: no active declarer, cards must be on the board.
 * Returns the state with declarer and setFound set, plus a boolean indicating
 * whether the set is actually valid (so the caller can flash / penalise).
 */
export function applyFound(
  state: MultiGameState,
  selected: string[],
  declarer: string,
): MultiGameState {
  if (state.declarer) return state
  if (!cardsOnBoard(state.board, selected)) return state

  return {
    ...state,
    declarer,
    selected,
    setFound: isSet(selected),
  }
}

/** Award a point to the declarer and decide whether the game is over. */
export function markPoint(
  state: MultiGameState,
  declarer: string,
): { players: MultiPlayers; gameOver: string | null } {
  const player = state.players[declarer]
  if (!player) return { players: state.players, gameOver: null }

  const newScore = player.score + 1
  const gameOver = newScore >= GAME_CONFIG.playingTo ? declarer : null

  return {
    players: {
      ...state.players,
      [declarer]: { ...player, score: newScore },
    },
    gameOver,
  }
}

/** Penalise the declarer (failed declaration or timeout). Score floors at 0. */
export function applyPenalty(state: MultiGameState, declarer: string): MultiPlayers {
  const player = state.players[declarer]
  if (!player) return state.players

  const newScore = Math.max(0, player.score - 1)
  return {
    ...state.players,
    [declarer]: { ...player, score: newScore },
  }
}

/**
 * Remove a valid set: score the point, clear declation state,
 * deal replacement cards, decide game-over.
 */
export function removeSet(state: MultiGameState, declarer: string): MultiGameState {
  if (!isSet(state.selected)) return state

  const { players, gameOver } = markPoint(state, declarer)
  const removed = removeSelected({
    board: state.board,
    deck: state.deck,
    selected: state.selected,
  })

  return {
    ...state,
    ...removed,
    players,
    gameOver,
    setFound: false,
    declarer: null,
  }
}

/**
 * Toggle a card into the current declarer's selection.
 * Only valid when there IS an active declarer and no set has been found yet.
 */
export function multiCardClick(state: MultiGameState, card: string): MultiGameState {
  if (!state.declarer || state.setFound) return state

  const newSelected = cardToggle(card, state.selected)
  return {
    ...state,
    selected: newSelected,
    setFound: isSet(newSelected),
  }
}

/** Reshuffle the board + deck, guaranteeing at least one set on the board. */
export function redealMulti(state: MultiGameState): MultiGameState {
  return { ...state, ...reshuffle(state) }
}

// ---------------------------------------------------------------------------
// Guest reducers (networked mode — used later)
// ---------------------------------------------------------------------------

/**
 * Local optimistic card selection on a guest client.
 * Returns new state + optionally an action to send to the host.
 */
export function guestCardClick(
  state: MultiGameState,
  card: string,
  myName: string,
): { state: MultiGameState; action?: GameAction } {
  if (state.declarer) {
    return { state }
  }

  const newSelected = cardToggle(card, state.selected)
  if (newSelected.length > 3) {
    return { state }
  }

  if (isSet(newSelected)) {
    const action: GameAction = {
      type: 'found',
      payload: { name: myName, selected: newSelected },
    }
    return {
      state: { ...state, selected: newSelected, setFound: true },
      action,
    }
  }

  return { state: { ...state, selected: newSelected } }
}

/**
 * Merge an incoming host snapshot into the guest's local state.
 * Preserves the guest's in-flight selection when safe to do so.
 */
export function mergeIncomingState(
  local: MultiGameState,
  incoming: MultiGameState,
  myName: string,
): MultiGameState {
  const keepLocal =
    local.selected.length < 3 && !local.declarer && local.declarer === incoming.declarer

  return {
    ...incoming,
    selected: keepLocal ? local.selected : incoming.selected,
  }
}

/** Clear a stale (invalid) selection after a bad-set timeout. */
export function resetLocalSelected(state: MultiGameState): MultiGameState {
  return { ...state, selected: [] }
}
