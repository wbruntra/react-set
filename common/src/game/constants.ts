export const GAME_CONFIG = {
  turnTime: 4000,
  colors: ['#4fc3f7', '#f48fb1', '#2e7d32', '#8e24aa', '#ffd740', '#fb8c00', '#f44336'],
  playingTo: 6,
  cpuDelay: 1200,
  setDisplayTime: 2000,
} as const

export const DIFFICULTY_CONFIG = {
  min: 1,
  max: 8,
  step: 1,
  default: 2,
} as const

export const TRAINING_CONFIG = {
  turnTime: 4000,
  oneCardHintTurnTime: 8000,
  playingTo: 6,
  cpuDelay: 1200,
  initialTurnTime: 7000,
  minimumTurnTime: 1600,
  oneCardHintInitialTurnTime: 10000,
  oneCardHintMinimumTurnTime: 3000,
  boardSize: 8,
  timerUpdateInterval: 100,
  gameOverDelay: 2500,
  setFoundDelay: 650,
} as const
