import React, { Fragment, useEffect, useRef, useState } from 'react'
import { getBoardStartingWithSet, isSet, nameThird } from '../utils/helpers'

import Board from './Board'
import { Link } from 'react-router-dom'
import { colors } from '../config'
import useInterval from '../useInterval'
import { Modal, Button } from 'react-bootstrap' // Import Modal and Button from react-bootstrap

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

  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const [turnStartTime, setTurnStartTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | string>(
    config.initialTurnTime / 1000,
  )

  const timeRef = useRef<number | string>(timeRemaining)
  timeRef.current = timeRemaining

  const scoreRef = useRef<number>(score)
  scoreRef.current = score

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

  const startTurn = ({ currentScore }: { currentScore: number }) => {
    setTurnStartTime(Date.now())
    setSetFound(false)
  }

  useEffect(() => {
    setStartTime(Date.now())
    startTurn({ currentScore: 0 })
  }, [])

  const calculateTimeRemaining = ({ precise = false } = {}): string => {
    if (turnStartTime === null) return '0.0' // Handle null turnStartTime
    const timeSinceTurnStart = Date.now() - turnStartTime
    const timeRemainingCalc = calculateTurnTime(scoreRef.current) - timeSinceTurnStart
    return (timeRemainingCalc / 1000).toFixed(1)
  }

  useInterval(
    () => {
      const now = Date.now()
      const elapsed = Math.round((now - (startTime || now)) / 1000) // Handle null startTime
      const timeSinceTurnStart = Math.round(now - (turnStartTime || now)) // Handle null turnStartTime
      const newTimeRemaining = calculateTurnTime(scoreRef.current) - timeSinceTurnStart

      setElapsedTime(elapsed)
      setTimeRemaining((newTimeRemaining / 1000).toFixed(1))

      if (newTimeRemaining < 0 && !setFound) {
        triggerGameOver()
      }
    },
    setFound || gameOver ? null : 200,
  )

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
    const timeRemainingVal = calculateTimeRemaining() // Get current value
    setTimeRemaining(timeRemainingVal)

    if (selected.length === 3 || gameOver) {
      return
    }
    if (isSet([...selected, v])) {
      setSetFound(true)
      setScore((prevScore) => prevScore + 1)
      setSelected([...selected, v])
      window.setTimeout(() => {
        getNewBoard()
        startTurn({ currentScore: scoreRef.current + 1 }) // Use updated score from ref
      }, 650)
    } else {
      triggerGameOver()
    }
  }

  const triggerGameOver = () => {
    setGameOver(true)
    const third = nameThird(selected[0], selected[1]) // Assuming selected has at least 2 elements
    setSelected([...selected, third])
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
    setStartTime(Date.now())
    startTurn({ currentScore: 0 })
  }

  return (
    <Fragment>
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
                color: gameOver ? 'error-red' : 'light-blue',
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
