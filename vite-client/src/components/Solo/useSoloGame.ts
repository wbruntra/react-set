import { useState, useEffect } from 'react'
import { cloneDeep } from 'lodash'
import { SoloState } from '../../utils/models'
import {
  cardToggle,
  isSet,
  removeSelected as removeSelectedCards,
  reshuffle,
  countSets,
} from '../../utils/helpers'
import {
  createInitialState,
  createGameState,
  getSavedDifficulty,
  saveDifficulty,
  calculateIntervalFromDifficulty,
} from './gameUtils'
import { useGameTimers, updatePlayerScore } from './hooks'
import { useFlashAnimation } from '../../hooks/useFlashAnimation'
import { GAME_CONFIG } from './constants'
import axios from 'axios'

// Action logging types
type GameAction = [number, number, 'h' | 'c'] // [setsOnBoard, timeInSeconds, who]

interface ActionLog {
  actions: GameAction[]
}

export interface UseSoloGameReturn {
  state: SoloState & { difficulty: number; elapsedSeconds: number }
  flashState: {
    showCpuFlash: boolean
    showUserFlash: boolean
  }
  handlers: {
    handleCardClick: (card: string) => void
    handleRedeal: () => void
    resetGame: () => void
    handleStartGame: (e: React.FormEvent) => void
    handleDifficultyChange: (newDifficulty: number) => void
  }
}

/**
 * Main game logic hook for Solo component
 */
export const useSoloGame = (user: any): UseSoloGameReturn => {
  // Initialize state
  const [state, setState] = useState<SoloState & { difficulty: number; elapsedSeconds: number }>(
    () => ({
      ...cloneDeep(createInitialState()),
      ...createGameState(),
      difficulty: getSavedDifficulty(),
      elapsedSeconds: 0,
    }),
  )

  // Action logging state
  const [actionLog, setActionLog] = useState<ActionLog>({ actions: [] })
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null)

  // Flash animations
  const { showCpuFlash, showUserFlash, triggerCpuFlash, triggerUserFlash } = useFlashAnimation()

  // Game timers
  const { startCpuTimer, startCpuAnimation, startSetFoundTimer, startDeclarationTimer } =
    useGameTimers()

  // Track when rounds start for accurate timing
  useEffect(() => {
    if (state.gameStarted && roundStartTime === null) {
      // Set the round start time when the game starts
      setRoundStartTime(Date.now())
    }
  }, [state.gameStarted, roundStartTime])

  // Elapsed time timer effect
  useEffect(() => {
    let elapsedTimer: number | null = null

    if (state.gameStarted && !state.gameOver) {
      elapsedTimer = window.setInterval(() => {
        setState((prevState) => ({
          ...prevState,
          elapsedSeconds: Math.floor((Date.now() - prevState.startTime.getTime()) / 1000),
        }))
      }, 1000)
    }

    return () => {
      if (elapsedTimer !== null) {
        clearInterval(elapsedTimer)
      }
    }
  }, [state.gameStarted, state.gameOver])

  // Load saved difficulty on mount
  useEffect(() => {
    const difficulty = getSavedDifficulty()
    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty)
    setState((prevState) => ({
      ...prevState,
      difficulty,
      cpuTurnInterval,
    }))
  }, [])

  // CPU Turn Timer Effect
  useEffect(() => {
    let cpuTurnTimer: number | null = null

    if (state.gameStarted && !state.gameOver && !state.declarer && !state.setFound) {
      cpuTurnTimer = startCpuTimer(state, setState, triggerCpuFlash)
    }

    return () => {
      if (cpuTurnTimer !== null) {
        clearInterval(cpuTurnTimer)
      }
    }
  }, [
    state.gameStarted,
    state.gameOver,
    state.declarer,
    state.setFound,
    state.board,
    state.difficulty,
  ])

  // CPU Animation Effect
  useEffect(() => {
    let animationTimer: number | null = null

    if (state.declarer === 'cpu' && state.cpuFound && state.cpuFound.length > 0) {
      animationTimer = startCpuAnimation(state, setState)
    }

    return () => {
      if (animationTimer !== null) {
        clearInterval(animationTimer)
      }
    }
  }, [state.declarer, state.cpuFound])

  // Set Found Effect
  useEffect(() => {
    let setFoundTimer: number | null = null

    if (state.setFound && state.selected.length === 3 && isSet(state.selected)) {
      setFoundTimer = startSetFoundTimer(state, processFoundSet)
    }

    return () => {
      if (setFoundTimer !== null) {
        clearTimeout(setFoundTimer)
      }
    }
  }, [state.setFound, state.selected])

  // Declaration Expiration Effect
  useEffect(() => {
    let declarationTimer: number | null = null

    if (state.declarer && state.timeDeclared && !state.setFound) {
      declarationTimer = startDeclarationTimer(state, setState)
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
      if (!prevState.setFound) return prevState

      // Log the action
      const setsOnBoard = countSets(prevState.board)
      // Calculate time from round start to declaration
      const timeElapsed =
        roundStartTime && prevState.timeDeclared
          ? (prevState.timeDeclared - roundStartTime) / 1000
          : 0
      const who = declarer === 'you' ? 'h' : 'c'

      const newAction: GameAction = [setsOnBoard, Number(timeElapsed.toFixed(1)), who]
      const updatedActionLog = {
        actions: [...actionLog.actions, newAction],
      }
      setActionLog(updatedActionLog)

      // Start a new round after this set is processed
      setRoundStartTime(Date.now())

      const [newPlayers, newScore] = updatePlayerScore(prevState.players, declarer, 1)
      const gameOver = newScore >= GAME_CONFIG.playingTo ? declarer : ''

      // Handle game completion
      if (gameOver) {
        const uid = (user && user.uid) || 'anonymous'
        const player_won = declarer === 'you' ? 1 : 0
        const total_time = Math.round(
          (new Date().getTime() - prevState.startTime.getTime()) / 1000,
        )

        // Include action log in game data
        const gameData = updatedActionLog

        // Report game stats asynchronously
        setTimeout(() => {
          axios
            .post('/api/game', {
              uid,
              total_time,
              player_won,
              difficulty_level: prevState.difficulty,
              winning_score: newScore,
              data: gameData,
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

  // Event handlers
  const handleCardClick = (card: string) => {
    setState((prevState) => {
      const { setFound, declarer, myName, selected } = prevState

      if (setFound || declarer === 'cpu') {
        return prevState
      }

      const newSelected = cardToggle(card, selected)
      let newDeclarer = declarer
      let newTimeDeclared = prevState.timeDeclared

      if (!declarer) {
        newDeclarer = myName
        newTimeDeclared = new Date().getTime()
      }

      const setFoundStatus = isSet(newSelected)

      if (setFoundStatus && newDeclarer === myName) {
        triggerUserFlash()
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

  const handleRedeal = () => {
    setState((prevState) => ({
      ...prevState,
      ...reshuffle(prevState),
    }))
  }

  const resetGame = () => {
    setState((prevState) => ({
      ...cloneDeep(createInitialState()),
      ...createGameState(),
      difficulty: prevState.difficulty,
      cpuTurnInterval: prevState.cpuTurnInterval,
      elapsedSeconds: 0,
    }))
    // Reset action log
    setActionLog({ actions: [] })
    setRoundStartTime(null)
  }

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault()
    setState((prevState) => ({
      ...prevState,
      gameStarted: true,
      startTime: new Date(),
      elapsedSeconds: 0,
    }))
    // Reset action log for new game
    setActionLog({ actions: [] })
    setRoundStartTime(null)
  }

  const handleDifficultyChange = (newDifficulty: number) => {
    const cpuTurnInterval = calculateIntervalFromDifficulty(newDifficulty)
    saveDifficulty(newDifficulty)
    setState((prevState) => ({
      ...prevState,
      cpuTurnInterval,
      difficulty: newDifficulty,
    }))
  }

  return {
    state,
    flashState: { showCpuFlash, showUserFlash },
    handlers: {
      handleCardClick,
      handleRedeal,
      resetGame,
      handleStartGame,
      handleDifficultyChange,
    },
  }
}
