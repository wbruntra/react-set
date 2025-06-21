import React, { useState, useEffect, useRef } from 'react'
import { cloneDeep, shuffle, map, get } from 'lodash'
import {
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected as removeSelectedCards,
  isSet,
  countSets,
} from '../utils/helpers'
import { colors } from '../config'
import { Players } from '../utils/models'
import SharedPlayerFrame from './SharedPlayerFrame'
import SharedGameBoard from './SharedGameBoard'
import SetCounter from './SetCounter'
import GameOver from './GameOver'
import styles from './SharedDevice.module.scss'

interface SharedDeviceState {
  numPlayers: number | null
  players: Players
  gameStarted: boolean
  myName: string
  setFound: boolean
  declarer: string | null
  timeDeclared: number | null
  gameOver: string | null
  board: string[]
  deck: string[]
  selected: string[]
}

const CONFIG = {
  declareTime: 4000,
  colors,
  playingTo: 6,
}

const createGameState = () => {
  const initialDeck = makeDeck()
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  }
}

const createPlayers = (num: number): Players => {
  const players: Players = {}
  for (let i = 0; i < num; i++) {
    const playerId = i.toString()
    players[playerId] = {
      score: 0,
      color: CONFIG.colors[i],
      name: playerId, // Use the ID as the name for consistency
    }
  }
  return players
}

const initialState: Omit<SharedDeviceState, 'board' | 'deck'> = {
  numPlayers: null,
  players: createPlayers(2),
  gameStarted: false,
  myName: '0',
  setFound: false,
  declarer: null,
  timeDeclared: null,
  gameOver: null,
  selected: [],
}

const SharedDevice: React.FC = () => {
  const [state, setState] = useState<SharedDeviceState>(() => ({
    ...cloneDeep(initialState),
    ...createGameState(),
  }))

  const undeclareTimeoutRef = useRef<number | null>(null)

  const handleStartGame = (numPlayers: number) => {
    setState((prevState) => ({
      ...prevState,
      numPlayers,
      players: createPlayers(numPlayers),
      gameStarted: true,
    }))
  }

  const updatePlayerScore = (playerName: string, delta: number) => {
    setState((prevState) => {
      const newScore = prevState.players[playerName].score + delta
      const newPlayers = {
        ...prevState.players,
        [playerName]: {
          ...prevState.players[playerName],
          score: newScore,
        },
      }
      const gameOver = newScore >= CONFIG.playingTo ? playerName : null
      return {
        ...prevState,
        players: newPlayers,
        gameOver,
      }
    })
  }

  const expireDeclare = () => {
    setState((prevState) => {
      const { declarer, selected } = prevState
      if (declarer && !isSet(selected)) {
        const penaltyPlayer = declarer
        // Apply penalty
        const newScore = Math.max(0, prevState.players[penaltyPlayer].score - 1)
        const newPlayers = {
          ...prevState.players,
          [penaltyPlayer]: {
            ...prevState.players[penaltyPlayer],
            score: newScore,
          },
        }
        return {
          ...prevState,
          players: newPlayers,
          declarer: null,
          timeDeclared: null,
          selected: [],
        }
      }
      return prevState
    })
  }

  const performDeclare = (declarer: string) => {
    console.log(`performDeclare called with: ${declarer}`) // Debug log

    setState((prevState) => {
      console.log(`Current state declarer: ${prevState.declarer}`) // Debug log

      if (!prevState.declarer) {
        console.log(`Setting new declarer: ${declarer}`) // Debug log
        const timeNow = new Date().getTime()

        // Clear any existing timeout
        if (undeclareTimeoutRef.current) {
          clearTimeout(undeclareTimeoutRef.current)
        }

        // Set new timeout
        undeclareTimeoutRef.current = window.setTimeout(() => {
          console.log(`Declare timeout expired for: ${declarer}`) // Debug log
          expireDeclare()
        }, CONFIG.declareTime)

        return {
          ...prevState,
          declarer,
          timeDeclared: timeNow,
        }
      }
      console.log(`Declarer already set, not changing`) // Debug log
      return prevState
    })
  }

  const handleCardClick = (card: string) => {
    console.log(`Card clicked: ${card}`) // Debug log
    console.log(`Current state - declarer: ${state.declarer}, setFound: ${state.setFound}`) // Debug log

    setState((prevState) => {
      const { setFound, declarer } = prevState
      console.log(`handleCardClick - declarer: ${declarer}, setFound: ${setFound}`) // Debug log

      if (!setFound && declarer !== null) {
        const newSelected = cardToggle(card, prevState.selected)
        const newSetFound = isSet(newSelected)

        console.log(`New selected: ${newSelected}, isSet: ${newSetFound}`) // Debug log

        if (newSetFound) {
          console.log(`Valid set found! Scheduling removal...`) // Debug log
          // Clear the undeclare timeout since they found a valid set
          if (undeclareTimeoutRef.current) {
            clearTimeout(undeclareTimeoutRef.current)
            undeclareTimeoutRef.current = null
          }

          // Schedule set removal
          setTimeout(() => {
            removeSet()
          }, 2000)
        }

        return {
          ...prevState,
          selected: newSelected,
          setFound: newSetFound,
        }
      } else {
        console.log(`Card click ignored - setFound: ${setFound}, declarer: ${declarer}`) // Debug log
      }
      return prevState
    })
  }

  const handlePlayerClick = (clickerName: string) => {
    console.log(`handlePlayerClick called with: ${clickerName}`) // Debug log
    console.log(`Current declarer: ${state.declarer}`) // Debug log

    if (state.declarer === null) {
      console.log(`Setting declarer to: ${clickerName}`) // Debug log
      performDeclare(clickerName)
    } else {
      console.log(`Declarer already set, ignoring click`) // Debug log
    }
  }

  const handleRedeal = () => {
    setState((prevState) => ({
      ...prevState,
      ...reshuffle(prevState),
    }))
  }

  const removeSet = () => {
    setState((prevState) => {
      const { declarer, selected } = prevState
      if (declarer && isSet(selected)) {
        const newScore = prevState.players[declarer].score + 1
        const newPlayers = {
          ...prevState.players,
          [declarer]: {
            ...prevState.players[declarer],
            score: newScore,
          },
        }
        const gameOver = newScore >= CONFIG.playingTo ? declarer : null

        return {
          ...prevState,
          players: newPlayers,
          gameOver,
          setFound: false,
          declarer: null,
          timeDeclared: null,
          selected: [],
          ...removeSelectedCards(prevState),
        }
      }
      return prevState
    })
  }

  const resetGame = () => {
    if (undeclareTimeoutRef.current) {
      clearTimeout(undeclareTimeoutRef.current)
      undeclareTimeoutRef.current = null
    }
    setState({
      ...cloneDeep(initialState),
      ...createGameState(),
    })
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undeclareTimeoutRef.current) {
        clearTimeout(undeclareTimeoutRef.current)
      }
    }
  }, [])

  const { board, deck, selected, declarer, players, numPlayers, setFound, gameOver } = state

  if (!numPlayers) {
    return (
      <div className="container mt-4">
        <div className="text-center mb-4">
          <h3>Local Multiplayer</h3>
          <p className="text-muted">Choose the number of players sharing this device</p>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <h4 className="text-center mb-4">Number of Players:</h4>
            <div className="row">
              {[...Array(6).keys()].map((i) => (
                <div key={`players-${i}`} className="col-4 col-md-2 mb-3">
                  <button
                    onClick={() => handleStartGame(i + 1)}
                    className="btn btn-outline-primary btn-lg w-100"
                    style={{ aspectRatio: '1', fontSize: '1.5rem' }}
                  >
                    {i + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-muted">
            Players take turns declaring "SET!" by clicking their player area, then selecting
            cards.
          </p>
          <p className="text-muted">First to {CONFIG.playingTo} points wins!</p>
        </div>
      </div>
    )
  }

  // Convert players object to array for easier handling
  const playersArray = map(players, (info, name) => ({
    name,
    ...info,
  }))

  // Split players between top and bottom frames
  const topBoxes = Math.ceil(playersArray.length / 2)
  const topPlayers = playersArray.slice(0, topBoxes)
  const bottomPlayers = playersArray.slice(topBoxes)

  // Get border color for selected cards
  const getBorderColor = () => {
    if (declarer) {
      return get(players, `${declarer}.color`, '')
    }
    return '#007bff' // Default blue
  }

  const borderColor = getBorderColor()
  const setsOnBoard = countSets(board, { debug: process.env.NODE_ENV !== 'production' })

  if (gameOver) {
    return <GameOver gameOver={gameOver} myName={state.myName} solo={false} reset={resetGame} />
  }

  return (
    <div className={styles['shared-device-layout']}>
      {/* Top Player Frame */}
      <SharedPlayerFrame
        players={topPlayers}
        declarer={declarer}
        handlePlayerClick={handlePlayerClick}
        position="top"
      />

      {/* Game Area */}
      <div className={styles['shared-game-area']}>
        {/* Set Counter */}
        <SetCounter setCount={setsOnBoard} />

        {/* Game Board */}
        <SharedGameBoard
          board={board}
          selected={selected}
          setFound={setFound}
          handleCardClick={handleCardClick}
          borderColor={borderColor}
        />
      </div>

      {/* Bottom Player Frame */}
      <SharedPlayerFrame
        players={bottomPlayers}
        declarer={declarer}
        handlePlayerClick={handlePlayerClick}
        position="bottom"
      />
    </div>
  )
}

export default SharedDevice
