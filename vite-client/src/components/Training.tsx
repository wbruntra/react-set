import React, { Fragment, useEffect, useState } from 'react'
import { getBoardStartingWithSet, isSet, nameThird } from '../utils/helpers'

import Board from './Board'
import FlashOverlay from './FlashOverlay'
import { useFlashAnimation } from '../hooks/useFlashAnimation'
import { Link } from 'react-router-dom'
import { colors } from '../config'
import { Modal, Button } from 'react-bootstrap' // Import Modal and Button from react-bootstrap
import scssColors from '@/styles/bts/colors.module.scss'

interface IntroModalProps {
  show: boolean
  handleClose: () => void
  setShow: (show: boolean) => void // Added setShow prop
}

const IntroModal: React.FC<IntroModalProps> = ({ show, handleClose, setShow }) => {
  return (
    <>
      <Modal show={show} onHide={() => setShow(false)}>
        {' '}
        {/* Added onHide for closing */}
        <Modal.Header className="justify-content-center">
          <Modal.Title>Training Mode</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column justify-content-center">
            <p className="my-2">
              Find the one card that completes a set with the two highlighted cards.
            </p>
            <p className="my-2">Try to keep finding SETs for as long as you can.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-center">
            <Button onClick={handleClose} variant="primary">
              Let's Go!
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

interface GameOverModalProps {
  handleClose: () => void
  show: boolean
  finalScore: number
}

const GameOverModal: React.FC<GameOverModalProps> = ({ handleClose, show, finalScore }) => {
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        {' '}
        {/* Added onHide for closing */}
        <Modal.Body>
          <h3 className="text-center mt-3">GAME OVER!</h3>
          <div className="d-flex flex-column justify-content-center">
            <p className="text-center my-2">Final Score: {finalScore} </p>
            <p className="text-center my-2">
              Best Score: {localStorage.getItem('highScoreTraining') || 0}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={handleClose}>
            <Link style={{ color: 'white', textDecoration: 'none' }} to="/">
              Main Menu
            </Link>
          </button>
          <Button onClick={handleClose} variant="secondary">
            Restart
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

const debugging = false

const config = {
  turnTime: 4000,
  colors,
  playingTo: 6,
  cpuDelay: 1200,
  initialTurnTime: 7000,
  minimumTurnTime: 1600,
}

const Training = () => {
  const [board, setBoard] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [score, setScore] = useState(0)

  const [startTime, setStartTime] = useState<number>(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)

  // Flash animation hook
  const {
    showSuccessFlash,
    showErrorFlash,
    triggerSuccessFlash,
    triggerErrorFlash,
  } = useFlashAnimation()

  const [turnStartTime, setTurnStartTime] = useState<number>(Date.now())
  const [timeRemaining, setTimeRemaining] = useState<number>(config.initialTurnTime / 1000)

  const [gameOver, setGameOver] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [setFound, setSetFound] = useState(false)
  const [initialized, setInitialized] = useState(false)

  /*
    Get turn time, in ms
  */
  const calculateTurnTime = (currentScore: number): number => {
    const calc = Math.round(config.initialTurnTime - 1100 * Math.log2(currentScore + 1))
    return Math.max(calc, config.minimumTurnTime)
  }

  const startTurn = (currentScore: number) => {
    setTurnStartTime(Date.now())
    setSetFound(false)
    setTimeRemaining(calculateTurnTime(currentScore) / 1000)
  }

  // Initialize game on mount
  useEffect(() => {
    const now = Date.now()
    setStartTime(now)
    startTurn(0)
  }, [])

  // Timer Effect - handles countdown and game over
  useEffect(() => {
    let timerInterval: number | null = null

    // Only run timer if game is active and no set is being processed
    if (!gameOver && !setFound && initialized) {
      timerInterval = window.setInterval(() => {
        const now = Date.now()
        const elapsed = Math.round((now - startTime) / 1000)
        const timeSinceTurnStart = now - turnStartTime
        const newTimeRemaining = calculateTurnTime(score) - timeSinceTurnStart

        setElapsedTime(elapsed)
        setTimeRemaining(Math.max(0, Math.round((newTimeRemaining / 1000) * 10) / 10))

        // Check if time has run out
        if (newTimeRemaining <= 0 && !setFound) {
          triggerGameOver()
        }
      }, 100) // Update every 100ms for smooth countdown
    }

    return () => {
      if (timerInterval !== null) {
        clearInterval(timerInterval)
      }
    }
  }, [gameOver, setFound, initialized, startTime, turnStartTime, score])

  const getNewBoard = ({ select = true } = {}) => {
    const { board: newBoard, deck } = getBoardStartingWithSet({ boardSize: 8, commonTraits: null })
    setBoard([...newBoard.slice(0, 2), '0333', ...newBoard.slice(2)])
    if (select) {
      setSelected(newBoard.slice(0, 2))
    }
  }

  useEffect(() => {
    getNewBoard({ select: false })
  }, [])

  const handleCardClick = (v: string) => {
    if (selected.length === 3 || gameOver) {
      return
    }
    if (isSet([...selected, v])) {
      setSetFound(true)
      const newScore = score + 1
      setScore(newScore)
      setSelected([...selected, v])

      // Trigger green flash for correct answer
      triggerSuccessFlash()

      window.setTimeout(() => {
        getNewBoard()
        startTurn(newScore)
      }, 650)
    } else {
      // Trigger red flash for wrong answer
      triggerErrorFlash()

      triggerGameOver()
    }
  }

  const triggerGameOver = () => {
    setGameOver(true)
    const third = nameThird(selected[0], selected[1]) // Assuming selected has at least 2 elements
    setSelected([...selected, third])

    // Trigger red flash for game over (timeout)
    triggerErrorFlash()

    if (Number(localStorage.getItem('highScoreTraining')) < score) {
      localStorage.setItem('highScoreTraining', score.toString())
    }
    window.setTimeout(() => {
      setShowModal(true)
    }, 2500)
  }

  const reset = () => {
    setGameOver(false)
    setShowModal(false)
    setSetFound(false)
    setScore(0)
    getNewBoard()
    const now = Date.now()
    setStartTime(now)
    startTurn(0)
  }

  return (
    <Fragment>
      <FlashOverlay showSuccessFlash={showSuccessFlash} showErrorFlash={showErrorFlash} />

      <div className="d-flex flex-column justify-content-between">
        <div>
          <Board
            board={board}
            deck={[]}
            selected={selected}
            declarer={null}
            handleCardClick={handleCardClick}
            handleDeclare={() => {}}
            players={{
              you: {
                name: 'you',
                score,
                color: gameOver ? scssColors.errorRed : scssColors.lightBlue,
              },
            }}
            setFound={false}
            gameOver={gameOver}
            myName={'you'}
            resetGame={() => {}}
            solo={true}
            gameMode="training"
            elapsedTime={elapsedTime}
            timeLeft={timeRemaining}
          />
        </div>
      </div>
      <IntroModal
        show={!initialized}
        setShow={setInitialized}
        handleClose={() => {
          setInitialized(true)
          reset()
        }}
      />
      <GameOverModal
        show={initialized && gameOver && showModal}
        finalScore={score}
        handleClose={reset}
      />
    </Fragment>
  )
}

export default Training
