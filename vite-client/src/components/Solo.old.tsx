import React, { useState, useEffect, useRef, Fragment } from 'react'
import {
  cardToggle,
  handleGoogleRedirect,
  isSet,
  makeDeck,
  nameThird,
  removeSelected as removeSelectedCards,
  reshuffle,
} from '../utils/helpers'
import { cloneDeep, isEmpty, shuffle } from 'lodash'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import update from 'immutability-helper'

import Board from '@/components/Board.tsx'
import Signout from './Signout'
import { SoloState, GameState, Players } from '../utils/models'
import { RootState } from '../store'
import { updateUser } from '../features/user/userSlice'

const debugging = false

const config = {
  turnTime: 4000,
  colors: ['#61d020', '#1b2f92', '#FF0000'], // Assuming these are the colors from config.js
  playingTo: 6,
  cpuDelay: 1200,
}

const calculateIntervalFromDifficulty = (d: number): number => {
  let diff = Number(d)
  if (Number.isNaN(diff)) {
    diff = 1
  }
  const interval = 24000 / (5 * diff)
  return interval
}

const createGameState = (): GameState & { selected: string[] } => {
  const initialDeck = makeDeck()
  const selected: string[] = []
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected,
  }
}

const logTime = (msg = '') => {
  const d = new Date()
  const s = (d.getTime() % 10 ** 6) / 1000
  console.log(msg, s.toFixed(1))
}

const initialState: SoloState = {
  players: {
    you: {
      score: 0,
      color: config.colors[0],
      name: 'you',
    },
    cpu: {
      score: 0,
      color: config.colors[1],
      name: 'cpu',
    },
  },
  gameStarted: false,
  myName: 'you',
  setFound: false,
  declarer: null,
  gameOver: null,
  cpuTurnInterval: 1000,
  startTime: new Date(),
  deck: [],
  board: [],
  selected: [],
  cpuFound: [],
}

function Solo() {
  const [state, setState] = useState<
    SoloState & { difficulty: number; cpuTimer: number | null; cpuAnimation: number | null }
  >(() => ({
    ...cloneDeep(initialState),
    ...createGameState(),
    difficulty: 2,
    cpuTimer: null,
    cpuAnimation: null,
  }))

  const dispatch = useDispatch()
  const userReducer = useSelector((state: RootState) => state.user)
  const { user } = userReducer

  const cpuTimerRef = useRef<number | null>(null)
  const cpuAnimationRef = useRef<number | null>(null)
  const undeclareIdRef = useRef<number | null>(null)

  useEffect(() => {
    const savedDifficulty = window.localStorage.getItem('soloDifficulty')
    let difficulty = savedDifficulty ? Number(savedDifficulty) : 2
    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty)
    setState((prevState) => ({
      ...prevState,
      difficulty,
      cpuTurnInterval,
    }))

    return () => {
      if (cpuTimerRef.current !== null) {
        window.clearInterval(cpuTimerRef.current)
      }
      if (cpuAnimationRef.current !== null) {
        window.clearInterval(cpuAnimationRef.current)
      }
      if (undeclareIdRef.current !== null) {
        window.clearTimeout(undeclareIdRef.current)
      }
    }
  }, [])

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault()
    setState((prevState) => ({
      ...prevState,
      gameStarted: true,
      startTime: new Date(),
    }))

    console.log(`Turns every ${state.cpuTurnInterval} ms`)
    cpuTimerRef.current = window.setInterval(cpuTurn, state.cpuTurnInterval)
    setState((prevState) => ({ ...prevState, cpuTimer: cpuTimerRef.current }))
  }

  const cpuTurn = () => {
    setState((prevState) => {
      const { board, declarer, gameOver } = prevState
      if (declarer || gameOver) {
        return prevState
      }
      if (debugging) {
        logTime('Guess')
      }
      const [a, b] = shuffle(board).slice(0, 2)
      const c = nameThird(a, b)
      if (board.includes(c)) {
        if (cpuTimerRef.current !== null) {
          clearInterval(cpuTimerRef.current)
        }
        cpuAnimationRef.current = window.setInterval(animateCpuChoice, 900)
        return {
          ...prevState,
          declarer: 'cpu',
          selected: [a],
          cpuFound: [b, c],
          setFound: true,
          cpuAnimation: cpuAnimationRef.current,
        }
      }
      return prevState
    })
  }

  const animateCpuChoice = () => {
    setState((prevState) => {
      const { selected, cpuFound } = prevState
      const cpuCopy = [...(cpuFound || [])]
      if (cpuCopy.length === 0) {
        return prevState
      }
      const newSelected = [...selected, cpuCopy.pop()!]

      const newState = {
        ...prevState,
        cpuFound: cpuCopy,
        selected: newSelected,
      }

      if (newSelected.length === 3) {
        if (cpuAnimationRef.current !== null) {
          clearInterval(cpuAnimationRef.current)
        }
        // Mark the set as found and schedule removal
        newState.setFound = true
        setTimeout(() => {
          removeSet(newSelected, 'cpu')
        }, 2000)
      }

      return newState
    })
  }

  const updatePlayerScore = (
    players: Players,
    myName: string,
    delta: number,
  ): [Players, number] => {
    const newScore = (players[myName]?.score || 0) + delta
    const newPlayers = update(players, {
      [myName]: {
        $merge: {
          score: newScore,
        },
      },
    })
    return [newPlayers as Players, newScore]
  }

  const expireDeclare = () => {
    const { declarer, selected } = state
    if (declarer && !isSet(selected)) {
      const [newPlayers] = updatePlayerScore(state.players, declarer, -0.5)
      setState((prevState) => ({
        ...prevState,
        players: newPlayers as Players,
        declarer: null,
        timeDeclared: undefined,
        selected: [],
      }))
    }
  }

  const markPointForDeclarer = (declarer: string) => {
    const [newPlayers, newScore] = updatePlayerScore(state.players, declarer, 1)
    const gameOver = newScore >= config.playingTo ? declarer : ''
    const newState = {
      players: newPlayers as Players,
      gameOver,
    }
    if (!isEmpty(gameOver)) {
      const uid = (user && user.uid) || 'anonymous'
      const player_won = declarer === 'you' ? 1 : 0
      const total_time = Math.round((new Date().getTime() - state.startTime.getTime()) / 1000)

      // Send game stats asynchronously without blocking
      setTimeout(() => {
        axios
          .post('/api/game', {
            uid,
            total_time,
            player_won,
            difficulty_level: state.difficulty,
            winning_score: newScore,
          })
          .then(() => {
            console.log('Game stats sent successfully')
          })
          .catch((err) => {
            console.log('Failed to send game stats (this is OK):', err.message)
          })
      }, 0)
    }
    setState((prevState) => ({ ...prevState, ...newState }))
    return newState
  }

  const performDeclare = (declarer: string) => {
    if (!state.declarer) {
      const timeNow = new Date().getTime()
      const updateState = {
        declarer,
        timeDeclared: timeNow,
      }
      setState((prevState) => ({ ...prevState, ...updateState }))
      undeclareIdRef.current = window.setTimeout(() => {
        expireDeclare()
      }, config.turnTime)
    }
  }

  const handleCardClick = (card: string) => {
    setState((prevState) => {
      const { setFound, declarer, myName } = prevState

      if (!setFound && declarer !== 'cpu') {
        const newSelected = cardToggle(card, prevState.selected)

        // If no one has declared yet, declare for this player
        let newDeclarer = declarer
        if (!declarer) {
          newDeclarer = myName
          // Set up the undeclare timeout
          const timeNow = new Date().getTime()
          undeclareIdRef.current = window.setTimeout(() => {
            expireDeclare()
          }, config.turnTime)
        }

        const setFoundStatus = isSet(newSelected)

        const newState = {
          ...prevState,
          selected: newSelected,
          declarer: newDeclarer,
          setFound: setFoundStatus,
          timeDeclared: newDeclarer !== declarer ? new Date().getTime() : prevState.timeDeclared,
        }

        // If we found a valid set, schedule the removal
        if (setFoundStatus) {
          if (undeclareIdRef.current !== null) {
            clearTimeout(undeclareIdRef.current)
          }
          setTimeout(() => {
            removeSet(newSelected, newDeclarer)
          }, 2000)
        }

        return newState
      }

      return prevState
    })
  }

  const handleRedeal = () => {
    const newState = reshuffle(state)
    setState((prevState) => ({ ...prevState, ...newState }))
  }

  const removeSet = (selectedCards?: string[], declarerPlayer?: string) => {
    setState((prevState) => {
      // Guard: only process if setFound is true
      if (!prevState.setFound) return prevState

      const currentSelected = selectedCards || prevState.selected
      const currentDeclarer = declarerPlayer || prevState.declarer

      if (currentDeclarer && isSet(currentSelected)) {
        // Immediately set setFound: false to prevent double scoring
        let newState: any = { ...prevState, setFound: false }

        // Update score
        const [newPlayers, newScore] = updatePlayerScore(prevState.players, currentDeclarer, 1)
        const gameOver = newScore >= config.playingTo ? currentDeclarer : ''

        // Handle game completion (don't block the game flow)
        if (gameOver) {
          const uid = (user && user.uid) || 'anonymous'
          const player_won = currentDeclarer === 'you' ? 1 : 0
          const total_time = Math.round(
            (new Date().getTime() - prevState.startTime.getTime()) / 1000,
          )
          setTimeout(() => {
            axios
              .post('/api/game', {
                uid,
                total_time,
                player_won,
                difficulty_level: prevState.difficulty,
                winning_score: newScore,
              })
              .catch(() => {})
          }, 0)
        }

        // Remove selected cards and get new cards
        const removedState = removeSelectedCards({
          board: prevState.board,
          deck: prevState.deck,
          selected: currentSelected,
        })

        // Restart CPU timer
        if (cpuTimerRef.current !== null) {
          clearInterval(cpuTimerRef.current)
        }
        cpuTimerRef.current = window.setInterval(cpuTurn, prevState.cpuTurnInterval)

        newState = {
          ...newState,
          players: newPlayers as Players,
          gameOver,
          declarer: null,
          timeDeclared: undefined,
          cpuTimer: cpuTimerRef.current,
          ...removedState,
        }
        return newState
      }
      return prevState
    })
  }

  const resetGame = () => {
    if (cpuTimerRef.current !== null) {
      window.clearInterval(cpuTimerRef.current)
    }
    setState((prevState) => ({
      ...cloneDeep(initialState),
      ...createGameState(),
      difficulty: prevState.difficulty, // Preserve difficulty
      cpuTurnInterval: prevState.cpuTurnInterval, // Preserve cpuTurnInterval
      cpuTimer: null,
      cpuAnimation: null,
    }))
  }

  const {
    board,
    deck,
    selected,
    declarer,
    players,
    gameStarted,
    setFound,
    gameOver,
    myName,
    difficulty,
  } = state

  if (userReducer.loading) {
    return 'Loading...'
  }

  if (!gameStarted) {
    return (
      <div className="container main-content">
        {user && user.uid ? <Signout /> : null}
        <h3 className="text-center mb-4">Solo Play vs. Computer</h3>
        <h4 className="mb-4">Choose difficulty level:</h4>
        <div className="row">
          <div className="col-12">
            <form onSubmit={handleStartGame}>
              <div className="col-10 col-md-6 mb-5">
                {/* <InputRange
                  maxValue={8}
                  minValue={1}
                  value={difficulty}
                  onChange={(value: number | { min: number; max: number }) => {
                    const newDifficulty = typeof value === 'number' ? value : value.max;
                    const cpuTurnInterval = calculateIntervalFromDifficulty(newDifficulty);
                    window.localStorage.setItem('soloDifficulty', newDifficulty.toString());
                    setState(prevState => ({
                      ...prevState,
                      cpuTurnInterval,
                      difficulty: newDifficulty,
                    }));
                  }}
                /> */}
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={difficulty}
                  onChange={(e) => {
                    const newDifficulty = Number(e.target.value)
                    const cpuTurnInterval = calculateIntervalFromDifficulty(newDifficulty)
                    window.localStorage.setItem('soloDifficulty', newDifficulty.toString())
                    setState((prevState) => ({
                      ...prevState,
                      cpuTurnInterval,
                      difficulty: newDifficulty,
                    }))
                  }}
                  className="form-control"
                />
              </div>
              <input type="submit" value="Start" className="btn btn-primary" />
            </form>
            <p style={{ marginTop: '24px' }}>First to {config.playingTo} points is the winner</p>
          </div>
          <div className="row mt-4">
            <p>Other Game Options:</p>
            <ul style={{ listStyleType: 'none' }}>
              <li className="mb-4">
                <Link to="/local">Local Multiplayer</Link>
              </li>
              <li className="mb-4">
                <Link to="/training">Training</Link>
              </li>
              <hr />
              <li>
                <Link to="/">Back to Main Menu</Link>
              </li>
            </ul>
          </div>
        </div>
        {!user || !user.uid ? (
          <div className="row mt-4">
            <div>
              <p>To save your game statistics, sign in with your Google account.</p>
              <p>
                <button onClick={handleGoogleRedirect} className="btn btn-info">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <Fragment>
      <Board
        board={board}
        deck={deck}
        selected={selected}
        declarer={declarer}
        handleCardClick={handleCardClick}
        handleDeclare={() => {}}
        handleRedeal={handleRedeal}
        players={players}
        setFound={setFound}
        gameOver={gameOver}
        myName={myName}
        resetGame={resetGame}
        solo={true}
        gameMode="versus"
      />
    </Fragment>
  )
}

export default Solo
