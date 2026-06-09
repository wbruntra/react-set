// Client adapter for the Solo state machine. The pure game logic lives in
// @react-set/common; this module only adds browser persistence (localStorage
// difficulty) and re-exports the transitions under the names Solo.tsx uses.

import {
  DIFFICULTY_CONFIG,
  createInitialSoloState,
  dealNewGame,
  handleDifficultyChange as changeDifficulty,
  resetGame as resetSoloGame,
  type SoloGameState,
  type SoloPlayers,
} from '@react-set/common'

export type GameState = SoloGameState
export type Players = SoloPlayers

export {
  handleCardClick,
  handleRedeal,
  handleStartGame,
  processFoundSet,
  handleDeclarationExpired,
  handleCpuFoundSet,
  handleCpuAnimationStep,
  findCpuSet,
  updatePlayerScore,
} from '@react-set/common'

const DIFFICULTY_KEY = 'soloDifficulty'

export const getSavedDifficulty = (): number => {
  const saved = localStorage.getItem(DIFFICULTY_KEY)
  return saved ? Number(saved) : DIFFICULTY_CONFIG.default
}

export const saveDifficulty = (difficulty: number): void => {
  localStorage.setItem(DIFFICULTY_KEY, difficulty.toString())
}

export function createInitialState(): GameState {
  return createInitialSoloState(getSavedDifficulty())
}

export const createGameState = dealNewGame

/** Persist the new difficulty, then apply the pure transition. */
export function handleDifficultyChange(state: GameState, newDifficulty: number): GameState {
  saveDifficulty(newDifficulty)
  return changeDifficulty(state, newDifficulty)
}

export const resetGame = resetSoloGame
