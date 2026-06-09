import { useRef, useState } from 'preact/hooks'
import {
  TRAINING_CONFIG,
  createInitialTrainingState,
  initTraining,
  nextBoard,
  reduceCardClick,
  reduceTimeout,
  resetTraining,
  startTraining,
  type TrainingGameState,
  type TrainingMode,
} from '@react-set/common'
import { migrateLegacyHighScore, saveHighScore } from './constants'

interface TrainingGameCallbacks {
  onSuccess: () => void
  onError: () => void
}

/**
 * Thin client wrapper around the shared Training state machine. Owns the
 * effects the pure reducers can't: React state, flash callbacks, high-score
 * persistence, and the scheduled board/modal transitions.
 */
export function useTrainingGame({ onSuccess, onError }: TrainingGameCallbacks) {
  const [gameState, setGameState] = useState<TrainingGameState>(createInitialTrainingState)

  // Latest state for event handlers, without re-binding them every render.
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

  function scheduleModal() {
    setTimeout(() => {
      setGameState((s) => ({ ...s, showModal: true }))
    }, TRAINING_CONFIG.gameOverDelay)
  }

  /** Apply a game-over state from the reducers: persist, flash, queue the modal. */
  function applyGameOver(state: TrainingGameState) {
    saveHighScore(state.mode, state.score)
    onError()
    setGameState(state)
    scheduleModal()
  }

  function handleCardClick(card: string) {
    const outcome = reduceCardClick(gameStateRef.current, card)

    switch (outcome.kind) {
      case 'ignored':
        return
      case 'select':
        setGameState(outcome.state)
        return
      case 'set-found':
        onSuccess()
        setGameState(outcome.state)
        setTimeout(() => {
          setGameState((s) => nextBoard(s))
        }, TRAINING_CONFIG.setFoundDelay)
        return
      case 'game-over':
        applyGameOver(outcome.state)
        return
    }
  }

  function handleGameOver() {
    const next = reduceTimeout(gameStateRef.current)
    if (next) applyGameOver(next)
  }

  function startInitialGame(mode: TrainingMode) {
    setGameState((s) => startTraining(s, mode))
  }

  function resetGame() {
    setGameState((s) => resetTraining(s))
  }

  function initializeGame() {
    migrateLegacyHighScore()
    setGameState(initTraining())
  }

  return {
    gameState,
    handleCardClick,
    handleGameOver,
    startInitialGame,
    resetGame,
    initializeGame,
  }
}
