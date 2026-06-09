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

export const STORAGE_KEYS = {
  highScore: 'highScoreTraining',
  twoCardHintHighScore: 'highScoreTraining_twoCardHint',
  oneCardHintHighScore: 'highScoreTraining_oneCardHint',
} as const

export const getHighScoreKey = (mode: 'two-card-hint' | 'one-card-hint'): string => {
  return mode === 'two-card-hint'
    ? STORAGE_KEYS.twoCardHintHighScore
    : STORAGE_KEYS.oneCardHintHighScore
}

export const migrateLegacyHighScore = (): void => {
  const legacyScore = localStorage.getItem(STORAGE_KEYS.highScore)
  const twoCardScore = localStorage.getItem(STORAGE_KEYS.twoCardHintHighScore)

  if (legacyScore && !twoCardScore) {
    localStorage.setItem(STORAGE_KEYS.twoCardHintHighScore, legacyScore)
  }
}
