import React, { Component, Fragment, useEffect, useRef, useState } from 'react'
import { getBoardStartingWithSet, isSet, nameThird } from '../utils/helpers'

import Board from './Board'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal'
import { colors } from '../config'
import useInterval from '../useInterval'

const GameOverModal = ({ handleClose, show, finalScore, handleHide }) => {
  return (
    <>
      <Modal
        // onHide={() => {
        //   handleClose()
        // }}
        show={show}
      >
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
          {/* <Button onClick={handleHide} variant="secondary">
            Hide
          </Button> */}
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
}

const Training = () => {
  const [board, setBoard] = useState([])
  const [selected, setSelected] = useState([])
  const [score, setScore] = useState(0)

  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const [turnStartTime, setTurnStartTime] = useState(null)
  const [turnTimeTotal, setTurnTimeTotal] = useState(99)
  const [timeSinceTurnStart, setTimeSinceTurnStart] = useState(0)

  const [timeRemaining, setTimeRemaining] = useState(99)

  const timeRef = useRef(null)
  timeRef.current = timeRemaining

  const [gameOver, setGameOver] = useState(false)
  const [modalHidden, setModalHidden] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [setFound, setSetFound] = useState(false)

  /*
    Get turn time, in ms
  */
  const calculateTurnTime = (score) => {
    const calc = Math.round(7000 - 1000 * Math.log2(score + 1))
    return calc
  }

  const startTurn = ({ score }) => {
    setTurnStartTime(Date.now())
    setTurnTimeTotal(calculateTurnTime(score))
    setSetFound(false)
  }

  useEffect(() => {
    setStartTime(Date.now())
    startTurn({ score: 0 })
  }, [])

  useInterval(
    () => {
      const now = Date.now()
      const elapsed = Math.round((now - startTime) / 1000)
      const timeSinceTurnStart = Math.round(now - turnStartTime)
      const newTimeRemaining = turnTimeTotal - timeSinceTurnStart

      setElapsedTime(elapsed)
      setTimeSinceTurnStart(timeSinceTurnStart)
      setTimeRemaining((newTimeRemaining / 1000).toFixed(1))

      if (newTimeRemaining < 0 && !setFound) {
        setGameOver(true)
        setShowModal(true)
      }
    },
    gameOver ? null : 200,
  )

  const getNewBoard = () => {
    const { board, deck } = getBoardStartingWithSet({ boardSize: 8 })
    setBoard([...board.slice(0, 2), '0333', ...board.slice(2)])
    setSelected(board.slice(0, 2))
  }

  useEffect(() => {
    getNewBoard()
  }, [])

  const handleCardClick = (v) => {
    console.log('handleCardClick', v)
    if (selected.length === 3 || gameOver) {
      return
    }
    if (isSet([...selected, v])) {
      setSelected([...selected, v])
      setScore(score + 1)
      setSetFound(true)
      window.setTimeout(() => {
        getNewBoard()
        startTurn({ score: score + 1 })
      }, 550)
    } else {
      const third = nameThird(...selected)
      setSelected([...selected, third])
      if (Number(localStorage.getItem('highScoreTraining')) < score) {
        localStorage.setItem('highScoreTraining', score)
      }
      setGameOver(true)
      window.setTimeout(() => {
        setShowModal(true)
      }, 2500)
      // setGameOver(true)
    }
  }

  const reset = () => {
    setModalHidden(false)
    setShowModal(false)
    setScore(0)
    setGameOver(false)
    getNewBoard()
    setStartTime(Date.now())
    startTurn({ score: 0 })
  }

  // console.log(selected)
  return (
    <React.Fragment>
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

        {/* {gameOver && (
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-primary" onClick={reset}>
              Reset
            </button>
          </div>
        )} */}
      </div>
      <GameOverModal
        show={gameOver && showModal}
        finalScore={score}
        handleClose={reset}
        handleHide={() => setModalHidden(true)}
      />
    </React.Fragment>
  )
}

export default Training
