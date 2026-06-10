import { useLocation } from 'wouter-preact'
import { getHighScoreKey } from './constants'
import type { TrainingMode } from './types'

interface GameOverModalProps {
  show: boolean
  finalScore: number
  mode: TrainingMode
  onRestart: () => void
}

export function GameOverModal({ show, finalScore, mode, onRestart }: GameOverModalProps) {
  const [, navigate] = useLocation()
  if (!show) return null

  const highScoreKey = getHighScoreKey(mode)
  const highScore = Number(localStorage.getItem(highScoreKey) || '0')
  const isNewHigh = finalScore > highScore && finalScore > 0

  const modeLabel = mode === 'two-card-hint' ? 'Find One' : 'Find Two'

  return (
    <div class="modal d-block" tabindex={-1} role="dialog" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Game Over</h5>
          </div>
          <div class="modal-body text-center">
            <p class="mb-2">
              <strong>{modeLabel}</strong>
            </p>
            <h2 class="mb-3">Score: {finalScore}</h2>
            <p class="mb-1">
              High Score: <strong>{Math.max(highScore, finalScore)}</strong>
            </p>
            {isNewHigh && <p class="text-success mb-3">New High Score!</p>}
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn btn-primary" onClick={onRestart}>
              Restart
            </button>
            <button class="btn btn-secondary" onClick={() => navigate('/')}>
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
