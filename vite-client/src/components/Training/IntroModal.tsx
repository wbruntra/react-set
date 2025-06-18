import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import type { TrainingMode } from './types'

interface IntroModalProps {
  show: boolean
  onClose: (mode: TrainingMode) => void
}

export const IntroModal: React.FC<IntroModalProps> = ({ show, onClose }) => {
  const [selectedMode, setSelectedMode] = useState<TrainingMode>('two-card-hint')

  const handleStart = () => {
    onClose(selectedMode)
  }

  return (
    <Modal show={show} onHide={() => onClose('two-card-hint')}>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Training Mode</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column justify-content-center">
          <p className="my-2">Choose your training mode:</p>

          <div className="my-3">
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="radio"
                name="trainingMode"
                id="twoCardHint"
                checked={selectedMode === 'two-card-hint'}
                onChange={() => setSelectedMode('two-card-hint')}
              />
              <label className="form-check-label" htmlFor="twoCardHint">
                <strong>Two Card Hint (Easier)</strong>
                <br />
                <small>
                  Find the one card that completes a set with the two highlighted cards.
                </small>
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="trainingMode"
                id="oneCardHint"
                checked={selectedMode === 'one-card-hint'}
                onChange={() => setSelectedMode('one-card-hint')}
              />
              <label className="form-check-label" htmlFor="oneCardHint">
                <strong>One Card Hint (Harder)</strong>
                <br />
                <small>
                  Find the two cards that complete a set with the one highlighted card.
                </small>
              </label>
            </div>
          </div>

          <p className="my-2">Try to keep finding SETs for as long as you can!</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-center">
          <Button onClick={handleStart} variant="primary">
            Let's Go!
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
