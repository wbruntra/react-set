// Client-only Training concerns: high-score persistence (localStorage).
// Shared gameplay tuning (TRAINING_CONFIG) lives in @react-set/common and is
// re-exported here for convenience.
import type { TrainingMode } from '@react-set/common'

export { TRAINING_CONFIG } from '@react-set/common'

export const STORAGE_KEYS = {
  highScore: 'highScoreTraining',
  twoCardHintHighScore: 'highScoreTraining_twoCardHint',
  oneCardHintHighScore: 'highScoreTraining_oneCardHint',
} as const

export const getHighScoreKey = (mode: TrainingMode): string => {
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

export const saveHighScore = (mode: TrainingMode, score: number): void => {
  const key = getHighScoreKey(mode)
  const currentHighScore = Number(localStorage.getItem(key) || '0')
  if (currentHighScore < score) {
    localStorage.setItem(key, score.toString())
  }
}
