import React, { useState, useEffect } from 'react'
import {
  cardToggle,
  handleGoogleSignIn,
  handleGoogleRedirect,
  handleGooglePopup,
  isSet,
  makeDeck,
  nameThird,
  removeSelected as removeSelectedCards,
  reshuffle,
} from '../utils/helpers'
import { cloneDeep, isEmpty, shuffle } from 'lodash'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import update from 'immutability-helper'

import Board from '@/components/Board.tsx'
import Signout from './Signout'
import { SoloState, GameState, Players } from '../utils/models'
import { RootState } from '../store'
import { colors } from '@/config.ts'

// Configuration
const config = {
  turnTime: 4000, // Time allowed to complete a set after declaring
  colors: colors,
  playingTo: 6, // Score needed to win
  cpuDelay: 1200, // Delay between CPU card selection animations
  setDisplayTime: 2000, // Time to display a completed set before removing
}

// Generate the interval time based on difficulty level
const calculateIntervalFromDifficulty = (d: number): number => {
  let diff = Number(d)
  if (Number.isNaN(diff)) {
    diff = 1
  }
  const interval = 24000 / (5 * diff)
  return interval
}

// Create initial game state with a shuffled deck and board
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

// Initial state
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
  // Game state
  const [state, setState] = useState<SoloState & { difficulty: number }>(() => ({
    ...cloneDeep(initialState),
    ...createGameState(),
    difficulty: 2,
  }))

  // Flash animation state for CPU alerts
  const [showCpuFlash, setShowCpuFlash] = useState(false)
  // Flash animation state for user success
  const [showUserFlash, setShowUserFlash] = useState(false)

  // User data from Redux
  const userReducer = useSelector((state: RootState) => state.user)
  const { user } = userReducer

  // Debug logging for user state
  useEffect(() => {
    console.log(
      'Solo component - user state:',
      user ? `${user.displayName} (${user.uid})` : 'No user',
    )
  }, [user])

  // Load saved difficulty from local storage
  useEffect(() => {
    const savedDifficulty = window.localStorage.getItem('soloDifficulty')
    let difficulty = savedDifficulty ? Number(savedDifficulty) : 2
    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty)
    setState((prevState) => ({
      ...prevState,
      difficulty,
      cpuTurnInterval,
    }))
  }, [])

  // CPU Turn Timer
  useEffect(() => {
    let cpuTurnTimer: number | null = null

    // Only start CPU timer if game is active and no set is being processed
    if (state.gameStarted && !state.gameOver && !state.declarer && !state.setFound) {
      cpuTurnTimer = window.setInterval(() => {
        // CPU turn logic
        setState((prevState) => {
          const { board, declarer, gameOver } = prevState
          if (declarer || gameOver) {
            return prevState
          }

          // Try to find a set
          const [a, b] = shuffle(board).slice(0, 2)
          const c = nameThird(a, b)
          if (board.includes(c)) {
            // Found a set, trigger flash animation and start the selection
            setShowCpuFlash(true)
            setTimeout(() => setShowCpuFlash(false), 800) // Flash for 800ms

            return {
              ...prevState,
              declarer: 'cpu',
              selected: [a],
              cpuFound: [b, c],
              setFound: true,
            }
          }
          return prevState
        })
      }, state.cpuTurnInterval)
    }

    // Clean up timer when component unmounts or dependencies change
    return () => {
      if (cpuTurnTimer !== null) {
        clearInterval(cpuTurnTimer)
      }
    }
  }, [state.gameStarted, state.gameOver, state.declarer, state.setFound, state.cpuTurnInterval])

  // CPU Animation Effect - animates the CPU selecting cards when it finds a set
  useEffect(() => {
    let animationTimer: number | null = null

    // Only start animation if CPU is the declarer and has cards to select
    if (state.declarer === 'cpu' && state.cpuFound && state.cpuFound.length > 0) {
      animationTimer = window.setInterval(() => {
        setState((prevState) => {
          const { selected, cpuFound } = prevState
          if (!cpuFound || cpuFound.length === 0) {
            return prevState
          }

          const cpuCopy = [...cpuFound]
          const newSelected = [...selected, cpuCopy.pop()!]

          // If we've selected all 3 cards, mark the set as complete
          if (newSelected.length === 3) {
            return {
              ...prevState,
              cpuFound: cpuCopy,
              selected: newSelected,
              setFound: true,
            }
          }

          return {
            ...prevState,
            cpuFound: cpuCopy,
            selected: newSelected,
          }
        })
      }, config.cpuDelay)
    }

    return () => {
      if (animationTimer !== null) {
        clearInterval(animationTimer)
      }
    }
  }, [state.declarer, state.cpuFound])

  // Set Found Effect - handles removal of a found set after display time
  useEffect(() => {
    let setFoundTimer: number | null = null

    if (state.setFound && state.selected.length === 3 && isSet(state.selected)) {
      setFoundTimer = window.setTimeout(() => {
        processFoundSet(state.selected, state.declarer!)
      }, config.setDisplayTime)
    }

    return () => {
      if (setFoundTimer !== null) {
        clearTimeout(setFoundTimer)
      }
    }
  }, [state.setFound, state.selected])

  // Declaration Expiration Effect - handles timeout for a player declaration
  useEffect(() => {
    let declarationTimer: number | null = null

    if (state.declarer && state.timeDeclared && !state.setFound) {
      declarationTimer = window.setTimeout(() => {
        // Check if a set was not completed in time
        setState((prevState) => {
          if (prevState.declarer && !isSet(prevState.selected)) {
            const [newPlayers] = updatePlayerScore(prevState.players, prevState.declarer, -0.5)
            return {
              ...prevState,
              players: newPlayers,
              declarer: null,
              timeDeclared: undefined,
              selected: [],
            }
          }
          return prevState
        })
      }, config.turnTime)
    }

    return () => {
      if (declarationTimer !== null) {
        clearTimeout(declarationTimer)
      }
    }
  }, [state.declarer, state.timeDeclared, state.setFound])

  // Process a found set
  const processFoundSet = (selectedCards: string[], declarer: string) => {
    setState((prevState) => {
      // Skip if set already processed (setFound is false)
      if (!prevState.setFound) return prevState

      // Update score
      const [newPlayers, newScore] = updatePlayerScore(prevState.players, declarer, 1)
      const gameOver = newScore >= config.playingTo ? declarer : ''

      // Handle game completion
      if (gameOver) {
        const uid = (user && user.uid) || 'anonymous'
        const player_won = declarer === 'you' ? 1 : 0
        const total_time = Math.round(
          (new Date().getTime() - prevState.startTime.getTime()) / 1000,
        )

        // Report game stats asynchronously
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
        selected: selectedCards,
      })

      return {
        ...prevState,
        ...removedState,
        players: newPlayers,
        gameOver,
        setFound: false,
        declarer: null,
        timeDeclared: undefined,
        selected: [],
      }
    })
  }

  // Update player score
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

  // Handle player card click
  const handleCardClick = (card: string) => {
    setState((prevState) => {
      const { setFound, declarer, myName, selected } = prevState

      // Ignore clicks if a set is already found or CPU is the declarer
      if (setFound || declarer === 'cpu') {
        return prevState
      }

      // Toggle card selection
      const newSelected = cardToggle(card, selected)

      // If this is the first card click, declare for the player
      let newDeclarer = declarer
      let newTimeDeclared = prevState.timeDeclared

      if (!declarer) {
        newDeclarer = myName
        newTimeDeclared = new Date().getTime()
      }

      // Check if this completes a set
      const setFoundStatus = isSet(newSelected)

      // Trigger green flash if user found a set
      if (setFoundStatus && newDeclarer === myName) {
        setShowUserFlash(true)
        setTimeout(() => setShowUserFlash(false), 800) // Flash for 800ms
      }

      return {
        ...prevState,
        selected: newSelected,
        declarer: newDeclarer,
        timeDeclared: newTimeDeclared,
        setFound: setFoundStatus,
      }
    })
  }

  // Handle redeal request
  const handleRedeal = () => {
    setState((prevState) => ({
      ...prevState,
      ...reshuffle(prevState),
    }))
  }

  // Reset the game
  const resetGame = () => {
    setState((prevState) => ({
      ...cloneDeep(initialState),
      ...createGameState(),
      difficulty: prevState.difficulty,
      cpuTurnInterval: prevState.cpuTurnInterval,
    }))
  }

  // Handle game start
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault()
    setState((prevState) => ({
      ...prevState,
      gameStarted: true,
      startTime: new Date(),
    }))
  }

  // Change difficulty level
  const handleDifficultyChange = (newDifficulty: number) => {
    const cpuTurnInterval = calculateIntervalFromDifficulty(newDifficulty)
    window.localStorage.setItem('soloDifficulty', newDifficulty.toString())
    setState((prevState) => ({
      ...prevState,
      cpuTurnInterval,
      difficulty: newDifficulty,
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
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={difficulty}
                  onChange={(e) => handleDifficultyChange(Number(e.target.value))}
                  className="form-range"
                />
                <p>Difficulty: {difficulty}</p>
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
                <button
                  onClick={() => {
                    const result = handleGoogleSignIn()
                    if (result && typeof result.catch === 'function') {
                      result.catch(console.error)
                    }
                  }}
                  className="btn btn-info me-2"
                >
                  Sign in with Google
                </button>
              </p>
              <details>
                <summary>Advanced options</summary>
                <div className="mt-2">
                  <button
                    onClick={handleGoogleRedirect}
                    className="btn btn-outline-secondary btn-sm me-2"
                  >
                    Force Redirect
                  </button>
                  <button
                    onClick={() => {
                      handleGooglePopup().catch(console.error)
                    }}
                    className="btn btn-outline-success btn-sm"
                  >
                    Force Popup
                  </button>
                </div>
              </details>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      {/* CPU Flash Animation Overlay */}
      {showCpuFlash && (
        <div
          className="cpu-flash-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 100, 100, 0.3)',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'cpuFlash 0.8s ease-out',
          }}
        />
      )}

      {/* User Success Flash Animation Overlay */}
      {showUserFlash && (
        <div
          className="user-flash-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(100, 255, 100, 0.3)',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'userFlash 0.8s ease-out',
          }}
        />
      )}

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

      {/* CSS Animation Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes cpuFlash {
            0% {
              opacity: 0;
              background-color: rgba(255, 100, 100, 0);
            }
            20% {
              opacity: 1;
              background-color: rgba(255, 100, 100, 0.4);
            }
            80% {
              opacity: 1;
              background-color: rgba(255, 100, 100, 0.2);
            }
            100% {
              opacity: 0;
              background-color: rgba(255, 100, 100, 0);
            }
          }
          
          @keyframes userFlash {
            0% {
              opacity: 0;
              background-color: rgba(100, 255, 100, 0);
            }
            20% {
              opacity: 1;
              background-color: rgba(100, 255, 100, 0.4);
            }
            80% {
              opacity: 1;
              background-color: rgba(100, 255, 100, 0.2);
            }
            100% {
              opacity: 0;
              background-color: rgba(100, 255, 100, 0);
            }
          }
        `,
        }}
      />
    </>
  )
}

export default Solo
