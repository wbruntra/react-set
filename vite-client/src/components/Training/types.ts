// Type definitions for Training component

export type TrainingMode = 'two-card-hint' | 'one-card-hint'

export interface GameState {
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

export interface TrainingTimerProps {
  gameStartTime: number
  turnStartTime: number
  score: number
  gameOver: boolean
  setFound: boolean
  initialized: boolean
  mode: TrainingMode
  onTimeUp: () => void
}

export interface TrainingGameActions {
  initializeGame: () => void
  handleCardClick: (card: string, onSuccess: () => void, onError: () => void) => void
  handleGameOver: () => void
  resetGame: () => void
  startInitialGame: (mode: TrainingMode) => void
  startTurn: (score: number) => void
}

export interface TrainingGameHookReturn {
  gameState: GameState
  actions: TrainingGameActions
}

export interface TimerHookReturn {
  elapsedTime: number
  timeRemaining: number
  calculateTurnTime: (score: number, mode: TrainingMode) => number
}
