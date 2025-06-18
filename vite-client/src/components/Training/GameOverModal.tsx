import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getHighScoreKey } from './constants'
import type { TrainingMode } from './types'

interface GameOverModalProps {
  show: boolean
  finalScore: number
  mode: TrainingMode
  onRestart: () => void
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  show,
  finalScore,
  mode,
  onRestart,
}) => {
  const highScoreKey = getHighScoreKey(mode)
  const highScore = localStorage.getItem(highScoreKey) || '0'
  const modeDisplayName = mode === 'two-card-hint' ? 'Two Card Hint' : 'One Card Hint'

  return (
    <Modal show={show} onHide={onRestart}>
      <Modal.Body>
        <h3 className="text-center mt-3">GAME OVER!</h3>
        <div className="d-flex flex-column justify-content-center">
          <p className="text-center my-1">Mode: {modeDisplayName}</p>
          <p className="text-center my-2">Final Score: {finalScore}</p>
          <p className="text-center my-2">
            Best Score ({modeDisplayName}): {highScore}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-primary" onClick={onRestart}>
          <Link style={{ color: 'white', textDecoration: 'none' }} to="/">
            Main Menu
          </Link>
        </button>
        <Button onClick={onRestart} variant="secondary">
          Restart
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
