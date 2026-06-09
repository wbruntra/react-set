// Pure, framework-agnostic state machine for Training mode.
// No browser APIs, timers, or flash side effects — the client interprets the
// returned outcomes and performs effects (high-score persistence, flashes,
// scheduling the next board / game-over modal).

import { getBoardStartingWithSet, isSet, nameThird } from '../helpers'
import { TRAINING_CONFIG } from './constants'

export type TrainingMode = 'two-card-hint' | 'one-card-hint'

export interface TrainingGameState {
  board: string[]
  selected: string[]
  score: number
  gameStartTime: number
  turnStartTime: number
  gameOver: boolean
  showModal: boolean
  setFound: boolean
  initialized: boolean
  mode: TrainingMode
}

export const BLANK_CARD = '0333'

export function boardWithoutBlanks(board: string[]): string[] {
  return board.filter((card) => card !== BLANK_CARD)
}

export function createInitialTrainingState(): TrainingGameState {
  const now = Date.now()
  return {
    board: [],
    selected: [],
    score: 0,
    gameStartTime: now,
    turnStartTime: now,
    gameOver: true,
    showModal: false,
    setFound: false,
    initialized: false,
    mode: 'two-card-hint',
  }
}

export function generateTrainingBoard(
  select = true,
  mode: TrainingMode = 'two-card-hint',
): { board: string[]; selected: string[] } {
  const { board: newBoard } = getBoardStartingWithSet({
    boardSize: TRAINING_CONFIG.boardSize,
    commonTraits: null,
  })

  if (mode === 'two-card-hint') {
    const board = [...newBoard.slice(0, 2), BLANK_CARD, ...newBoard.slice(2, 8)]
    const selected = select ? newBoard.slice(0, 2) : []
    return { board, selected }
  }

  const hintCard = newBoard[0]
  const secondCardOfSet = newBoard[1]
  const thirdCardOfSet = nameThird(hintCard, secondCardOfSet)

  const otherCards = newBoard
    .slice(1)
    .filter((card) => card !== secondCardOfSet && card !== thirdCardOfSet)
  const additionalCards = otherCards.slice(0, 4)

  const options = [secondCardOfSet, thirdCardOfSet, ...additionalCards]
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)

  const board = [hintCard, BLANK_CARD, BLANK_CARD, ...shuffledOptions]
  const selected = select ? [hintCard] : []

  if (!shuffledOptions.includes(secondCardOfSet) || !shuffledOptions.includes(thirdCardOfSet)) {
    console.error('Generated board does not contain the complete set!')
  }

  return { board, selected }
}

/**
 * Find the first valid set on the board that includes the hint card.
 * Falls back to just the hint card if (somehow) no set is present.
 */
export function findValidSet(remaining: string[], hintCard: string): string[] {
  for (let i = 1; i < remaining.length; i++) {
    for (let j = i + 1; j < remaining.length; j++) {
      const candidate = [hintCard, remaining[i], remaining[j]]
      if (isSet(candidate)) {
        return candidate
      }
    }
  }
  return [hintCard]
}

export function calculateTurnTime(score: number, mode: TrainingMode): number {
  const config =
    mode === 'one-card-hint'
      ? {
          initial: TRAINING_CONFIG.oneCardHintInitialTurnTime,
          minimum: TRAINING_CONFIG.oneCardHintMinimumTurnTime,
        }
      : {
          initial: TRAINING_CONFIG.initialTurnTime,
          minimum: TRAINING_CONFIG.minimumTurnTime,
        }

  const calc = Math.round(config.initial - 1100 * Math.log2(score + 1))
  return Math.max(calc, config.minimum)
}

/**
 * Outcome of a card click. The client reacts to `kind`:
 *  - ignored:   no-op (blank/duplicate/locked)
 *  - select:    just update the selection
 *  - set-found: flash success, then schedule the next board
 *  - game-over: flash error, persist high score, then schedule the modal
 */
export type TrainingClickOutcome =
  | { kind: 'ignored' }
  | { kind: 'select'; state: TrainingGameState }
  | { kind: 'set-found'; state: TrainingGameState }
  | { kind: 'game-over'; state: TrainingGameState }

function gameOverWith(state: TrainingGameState, selected: string[]): TrainingClickOutcome {
  return { kind: 'game-over', state: { ...state, gameOver: true, selected } }
}

export function reduceCardClick(state: TrainingGameState, card: string): TrainingClickOutcome {
  if (state.gameOver || state.selected.length >= 3) return { kind: 'ignored' }
  if (card === BLANK_CARD || state.selected.includes(card)) return { kind: 'ignored' }

  const newSelected = [...state.selected, card]
  const remaining = boardWithoutBlanks(state.board)
  const hintCard = state.board[0]

  // one-card-hint: after the first pick, bail out if no completing third card exists
  if (state.mode === 'one-card-hint' && state.selected.length === 1) {
    const third = nameThird(state.selected[0], card)
    if (!remaining.includes(third)) {
      return gameOverWith(state, findValidSet(remaining, hintCard))
    }
  }

  if (isSet(newSelected)) {
    return {
      kind: 'set-found',
      state: { ...state, selected: newSelected, score: state.score + 1, setFound: true },
    }
  }

  // Wrong selection handling, per mode
  if (state.mode === 'two-card-hint' && newSelected.length === 3) {
    const third = nameThird(state.selected[0], state.selected[1])
    return gameOverWith(state, [...state.selected, third])
  }

  if (state.mode === 'one-card-hint' && newSelected.length >= 2) {
    if (newSelected.length === 2) {
      const third = nameThird(newSelected[0], newSelected[1])
      if (remaining.includes(third)) {
        return { kind: 'select', state: { ...state, selected: newSelected } }
      }
      return gameOverWith(state, findValidSet(remaining, hintCard))
    }
    // Three cards selected and not a set
    return gameOverWith(state, findValidSet(remaining, hintCard))
  }

  return { kind: 'select', state: { ...state, selected: newSelected } }
}

/** Turn timer expired. Returns the game-over state (revealing a set), or null if already over. */
export function reduceTimeout(state: TrainingGameState): TrainingGameState | null {
  if (state.gameOver) return null

  let finalSelected = state.selected
  if (state.mode === 'two-card-hint') {
    if (state.selected.length >= 2) {
      finalSelected = [...state.selected, nameThird(state.selected[0], state.selected[1])]
    }
  } else {
    finalSelected = findValidSet(boardWithoutBlanks(state.board), state.board[0])
  }
  return { ...state, gameOver: true, selected: finalSelected }
}

/** Transition into the next board after a successful set. */
export function nextBoard(state: TrainingGameState): TrainingGameState {
  const { board, selected } = generateTrainingBoard(true, state.mode)
  return { ...state, board, selected, setFound: false, turnStartTime: Date.now() }
}

/** Begin a game in the chosen mode (from the intro modal). */
export function startTraining(state: TrainingGameState, mode: TrainingMode): TrainingGameState {
  const { board, selected } = generateTrainingBoard(true, mode)
  const now = Date.now()
  return {
    ...state,
    board,
    selected,
    gameOver: false,
    initialized: true,
    gameStartTime: now,
    turnStartTime: now,
    mode,
  }
}

/** Restart the current mode after game over. */
export function resetTraining(state: TrainingGameState): TrainingGameState {
  const { board, selected } = generateTrainingBoard(true, state.mode)
  const now = Date.now()
  return {
    board,
    selected,
    score: 0,
    gameStartTime: now,
    turnStartTime: now,
    gameOver: false,
    showModal: false,
    setFound: false,
    initialized: true,
    mode: state.mode,
  }
}

/** Pre-game state shown behind the intro modal (a board is dealt but not playable). */
export function initTraining(): TrainingGameState {
  const { board, selected } = generateTrainingBoard(false)
  const now = Date.now()
  return {
    board,
    selected,
    score: 0,
    gameStartTime: now,
    turnStartTime: now,
    gameOver: true,
    showModal: false,
    setFound: false,
    initialized: false,
    mode: 'two-card-hint',
  }
}
