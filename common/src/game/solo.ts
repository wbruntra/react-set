// Pure, framework-agnostic state machine for the Solo (vs. CPU) game mode.
// No browser APIs (localStorage), no timers, no I/O — callers wire those up.
// Each transition takes the current state and returns the next state.

import {
  cardToggle,
  countSets,
  isSet,
  makeDeck,
  nameThird,
  removeSelected,
  reshuffle,
} from '../helpers'
import { GAME_CONFIG } from './constants'
import { calculateIntervalFromDifficulty } from './cpuPerformance'

export interface SoloPlayer {
  score: number
  color: string
  name: string
}

export interface SoloPlayers {
  [key: string]: SoloPlayer
}

/** One logged round: [setsOnBoard, secondsToDeclare, who ('h'=human, 'c'=cpu)]. */
export type SoloAction = [number, number, 'h' | 'c']

export interface SoloGameState {
  board: string[]
  deck: string[]
  selected: string[]
  declarer: string | null
  players: SoloPlayers
  gameStarted: boolean
  setFound: boolean
  gameOver: string | null
  myName: string
  difficulty: number
  elapsedSeconds: number
  startTime: Date
  cpuTurnInterval: number
  cpuFound: string[]
  timeDeclared: number | undefined
  actions: SoloAction[]
}

/** Build a fresh pre-game state for the given difficulty. Pure: difficulty is passed in. */
export function createInitialSoloState(difficulty: number): SoloGameState {
  return {
    board: [],
    deck: [],
    selected: [],
    declarer: null,
    players: {
      you: { score: 0, color: GAME_CONFIG.colors[0], name: 'you' },
      cpu: { score: 0, color: GAME_CONFIG.colors[1], name: 'cpu' },
    },
    gameStarted: false,
    setFound: false,
    gameOver: null,
    myName: 'you',
    difficulty,
    elapsedSeconds: 0,
    startTime: new Date(),
    cpuTurnInterval: calculateIntervalFromDifficulty(difficulty),
    cpuFound: [],
    timeDeclared: undefined,
    actions: [],
  }
}

/** Deal a new board/deck (12 cards up, guaranteed to contain a set). */
export function dealNewGame(): Pick<SoloGameState, 'board' | 'deck' | 'selected'> {
  const initialDeck = makeDeck()
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  }
}

export function updatePlayerScore(
  players: SoloPlayers,
  playerName: string,
  delta: number,
): [SoloPlayers, number] {
  const newScore = (players[playerName]?.score || 0) + delta
  return [
    {
      ...players,
      [playerName]: { ...players[playerName], score: newScore },
    },
    newScore,
  ]
}

/** Resolve a completed set: log it, award a point, deal replacements, maybe end the game. */
export function processFoundSet(
  state: SoloGameState,
  selectedCards: string[],
  declarer: string,
  roundStartTime: number | null,
): SoloGameState {
  const setsOnBoard = countSets(state.board)
  const timeElapsed =
    roundStartTime && state.timeDeclared ? (state.timeDeclared - roundStartTime) / 1000 : 0
  const who: 'h' | 'c' = declarer === 'you' ? 'h' : 'c'
  const newAction: SoloAction = [setsOnBoard, Number(timeElapsed.toFixed(1)), who]

  const [newPlayers, newScore] = updatePlayerScore(state.players, declarer, 1)
  const gameOver = newScore >= GAME_CONFIG.playingTo ? declarer : null

  const removedState = removeSelected({
    board: state.board,
    deck: state.deck,
    selected: selectedCards,
  })

  return {
    ...state,
    ...removedState,
    players: newPlayers,
    gameOver,
    setFound: false,
    declarer: null,
    timeDeclared: undefined,
    selected: [],
    cpuFound: [],
    actions: [...state.actions, newAction],
  }
}

export function handleCardClick(state: SoloGameState, card: string): SoloGameState {
  if (state.setFound || state.declarer === 'cpu' || state.gameOver) {
    return state
  }

  const newSelected = cardToggle(card, state.selected)
  let newDeclarer = state.declarer
  let newTimeDeclared = state.timeDeclared

  if (!state.declarer) {
    newDeclarer = state.myName
    newTimeDeclared = Date.now()
  }

  return {
    ...state,
    selected: newSelected,
    declarer: newDeclarer,
    timeDeclared: newTimeDeclared,
    setFound: isSet(newSelected),
  }
}

export function handleRedeal(state: SoloGameState): SoloGameState {
  return { ...state, ...reshuffle(state) }
}

export function handleStartGame(state: SoloGameState): SoloGameState {
  return {
    ...state,
    gameStarted: true,
    startTime: new Date(),
    elapsedSeconds: 0,
    actions: [],
  }
}

/** Update difficulty (and derived CPU interval). Persistence is the caller's job. */
export function handleDifficultyChange(
  state: SoloGameState,
  newDifficulty: number,
): SoloGameState {
  return {
    ...state,
    difficulty: newDifficulty,
    cpuTurnInterval: calculateIntervalFromDifficulty(newDifficulty),
  }
}

export function resetGame(state: SoloGameState): SoloGameState {
  return {
    ...createInitialSoloState(state.difficulty),
    cpuTurnInterval: state.cpuTurnInterval,
  }
}

/** A declaration that didn't resolve into a set: dock the declarer and clear selection. */
export function handleDeclarationExpired(state: SoloGameState): SoloGameState {
  if (state.declarer && !isSet(state.selected)) {
    const [newPlayers] = updatePlayerScore(state.players, state.declarer, -0.5)
    return {
      ...state,
      players: newPlayers,
      declarer: null,
      timeDeclared: undefined,
      selected: [],
    }
  }
  return state
}

/** The CPU has spotted a set: select all three cards immediately. */
export function handleCpuFoundSet(
  state: SoloGameState,
  a: string,
  b: string,
  c: string,
): SoloGameState {
  return {
    ...state,
    declarer: 'cpu',
    selected: [a, b, c],
    cpuFound: [],
    setFound: true,
    timeDeclared: Date.now(),
  }
}

/**
 * Randomly probe the board for a set the CPU can claim this tick.
 * Returns the three cards, or null if the random pair didn't complete a set.
 */
export function findCpuSet(board: string[]): [string, string, string] | null {
  const shuffled = [...board].sort(() => Math.random() - 0.5)
  const a = shuffled[0]
  const b = shuffled[1]
  const c = nameThird(a, b)
  return board.includes(c) ? [a, b, c] : null
}
