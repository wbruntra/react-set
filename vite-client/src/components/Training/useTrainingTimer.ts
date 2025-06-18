import { useEffect, useState } from 'react'
import { TRAINING_CONFIG } from './constants'
import type { TrainingTimerProps, TimerHookReturn, TrainingMode } from './types'

export const useTrainingTimer = ({
  gameStartTime,
  turnStartTime,
  score,
  gameOver,
  setFound,
  initialized,
  mode,
  onTimeUp,
}: TrainingTimerProps): TimerHookReturn => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const calculateTurnTime = (currentScore: number, gameMode: TrainingMode): number => {
    const config =
      gameMode === 'one-card-hint'
        ? {
            initial: TRAINING_CONFIG.oneCardHintInitialTurnTime,
            minimum: TRAINING_CONFIG.oneCardHintMinimumTurnTime,
          }
        : {
            initial: TRAINING_CONFIG.initialTurnTime,
            minimum: TRAINING_CONFIG.minimumTurnTime,
          }

    const calc = Math.round(config.initial - 1100 * Math.log2(currentScore + 1))
    return Math.max(calc, config.minimum)
  }

  useEffect(() => {
    let timerInterval: number | null = null

    if (!gameOver && !setFound && initialized) {
      timerInterval = window.setInterval(() => {
        const now = Date.now()
        const elapsed = Math.round((now - gameStartTime) / 1000)
        const timeSinceTurnStart = now - turnStartTime
        const newTimeRemaining = calculateTurnTime(score, mode) - timeSinceTurnStart

        setElapsedTime(elapsed)
        setTimeRemaining(Math.max(0, Math.round((newTimeRemaining / 1000) * 10) / 10))

        if (newTimeRemaining <= 0 && !setFound) {
          onTimeUp()
        }
      }, TRAINING_CONFIG.timerUpdateInterval)
    }

    return () => {
      if (timerInterval !== null) {
        clearInterval(timerInterval)
      }
    }
  }, [gameOver, setFound, initialized, gameStartTime, turnStartTime, score, mode, onTimeUp])

  return {
    elapsedTime,
    timeRemaining,
    calculateTurnTime,
  }
}
