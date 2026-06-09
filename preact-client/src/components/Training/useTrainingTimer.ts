import { useEffect, useRef, useState } from 'preact/hooks'
import { TRAINING_CONFIG, calculateTurnTime, type TrainingMode } from '@react-set/common'

interface TrainingTimerArgs {
  gameStartTime: number
  turnStartTime: number
  score: number
  gameOver: boolean
  setFound: boolean
  initialized: boolean
  mode: TrainingMode
  onTimeUp: () => void
}

export function useTrainingTimer({
  gameStartTime,
  turnStartTime,
  score,
  gameOver,
  setFound,
  initialized,
  mode,
  onTimeUp,
}: TrainingTimerArgs) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Held in a ref so a fresh onTimeUp identity each render doesn't restart the interval.
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp

  useEffect(() => {
    if (gameOver || setFound || !initialized) return

    const interval = window.setInterval(() => {
      const now = Date.now()
      const elapsed = Math.round((now - gameStartTime) / 1000)
      const timeSinceTurnStart = now - turnStartTime
      const remaining = calculateTurnTime(score, mode) - timeSinceTurnStart

      setElapsedTime(elapsed)
      setTimeRemaining(Math.max(0, Math.round((remaining / 1000) * 10) / 10))

      if (remaining <= 0) {
        onTimeUpRef.current()
      }
    }, TRAINING_CONFIG.timerUpdateInterval)

    return () => clearInterval(interval)
  }, [gameStartTime, turnStartTime, score, gameOver, setFound, initialized, mode])

  return { elapsedTime, timeRemaining }
}
