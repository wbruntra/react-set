import { useState, useEffect, useRef } from 'preact/hooks'
import { countSets, isSet, calculateDynamicCPUInterval, GAME_CONFIG } from '@/utils/helpers'
import { Board } from '@/components/Board'
import { FlashOverlay } from '@/components/FlashOverlay'
import { DifficultySetup } from './DifficultySetup'
import { SoloGameOver } from './SoloGameOver'
import {
  createInitialState,
  createGameState,
  handleCardClick,
  handleRedeal,
  handleStartGame,
  handleDifficultyChange,
  resetGame,
  processFoundSet,
  handleCpuFoundSet,
  handleCpuAnimationStep,
  handleDeclarationExpired,
  findCpuSet,
  type GameState,
} from './gameState'

interface SoloProps {
  onNavigateHome: () => void
}

export function Solo({ onNavigateHome }: SoloProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState)
  const [showCpuFlash, setShowCpuFlash] = useState(false)
  const [showUserFlash, setShowUserFlash] = useState(false)
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null)

  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

  const roundStartRef = useRef(roundStartTime)
  roundStartRef.current = roundStartTime

  function triggerCpuFlash() {
    setShowCpuFlash(true)
    setTimeout(() => setShowCpuFlash(false), 800)
  }

  function triggerUserFlash() {
    setShowUserFlash(true)
    setTimeout(() => setShowUserFlash(false), 800)
  }

  function onCardClick(card: string) {
    const newState = handleCardClick(gameStateRef.current, card)
    if (newState.setFound && newState.declarer === newState.myName) {
      triggerUserFlash()
    }
    setGameState(newState)
  }

  function onRedeal() {
    setGameState(handleRedeal(gameStateRef.current))
  }

  function onResetGame() {
    setGameState(resetGame(gameStateRef.current))
    setRoundStartTime(null)
  }

  function onStartGame() {
    const newState = handleStartGame(gameStateRef.current)
    setGameState({ ...newState, ...createGameState() })
    setRoundStartTime(Date.now())
  }

  function onDifficultyChange(newDifficulty: number) {
    setGameState(handleDifficultyChange(gameStateRef.current, newDifficulty))
  }

  // Elapsed time timer
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return

    const timer = window.setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - prev.startTime.getTime()) / 1000),
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.gameStarted, gameState.gameOver])

  // CPU Turn Timer
  useEffect(() => {
    const isActive =
      gameState.gameStarted && !gameState.gameOver && !gameState.declarer && !gameState.setFound

    if (!isActive) return

    const interval = calculateDynamicCPUInterval(gameState.difficulty, countSets(gameState.board))

    const timer = window.setInterval(() => {
      const gs = gameStateRef.current
      if (gs.declarer || gs.gameOver || gs.setFound) return

      const found = findCpuSet(gs.board)
      if (found) {
        triggerCpuFlash()
        setGameState(handleCpuFoundSet(gs, ...found))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [
    gameState.gameStarted,
    gameState.gameOver,
    gameState.declarer,
    gameState.setFound,
    gameState.board,
    gameState.difficulty,
  ])

  // CPU Animation Timer
  useEffect(() => {
    const isAnimating =
      gameState.declarer === 'cpu' && gameState.cpuFound && gameState.cpuFound.length > 0

    if (!isAnimating) return

    const timer = window.setInterval(() => {
      setGameState((prev) => handleCpuAnimationStep(prev))
    }, GAME_CONFIG.cpuDelay)

    return () => clearInterval(timer)
  }, [gameState.declarer, gameState.cpuFound])

  // Set Found Timer
  useEffect(() => {
    if (!gameState.setFound || gameState.selected.length !== 3 || !isSet(gameState.selected))
      return

    const timer = window.setTimeout(() => {
      const gs = gameStateRef.current
      const newState = processFoundSet(gs, gs.selected, gs.declarer!, roundStartRef.current)
      setGameState(newState)
      setRoundStartTime(Date.now())
    }, GAME_CONFIG.setDisplayTime)

    return () => clearTimeout(timer)
  }, [gameState.setFound, gameState.selected])

  // Declaration Expiration Timer
  useEffect(() => {
    if (!gameState.declarer || !gameState.timeDeclared || gameState.setFound) return

    const timer = window.setTimeout(() => {
      setGameState((prev) => handleDeclarationExpired(prev))
    }, GAME_CONFIG.turnTime)

    return () => clearTimeout(timer)
  }, [gameState.declarer, gameState.timeDeclared, gameState.setFound])

  // Track round start when game starts
  useEffect(() => {
    if (gameState.gameStarted && roundStartTime === null) {
      setRoundStartTime(Date.now())
    }
  }, [gameState.gameStarted, roundStartTime])

  if (!gameState.gameStarted) {
    return (
      <DifficultySetup
        difficulty={gameState.difficulty}
        onDifficultyChange={onDifficultyChange}
        onStartGame={onStartGame}
        onNavigateHome={onNavigateHome}
      />
    )
  }

  if (gameState.gameOver) {
    return (
      <SoloGameOver
        winner={gameState.gameOver}
        players={gameState.players}
        onReset={onResetGame}
        onMainMenu={onNavigateHome}
      />
    )
  }

  return (
    <>
      <Board
        board={gameState.board}
        selected={gameState.selected}
        declarer={gameState.declarer}
        gameMode="versus"
        onCardClick={onCardClick}
        setFound={gameState.setFound}
        gameOver={!!gameState.gameOver}
        score={gameState.players.you.score}
        elapsedTime={gameState.elapsedSeconds}
        players={gameState.players as any}
      />

      {showCpuFlash && <div class="flash-overlay cpu-flash" />}
      {showUserFlash && <div class="flash-overlay user-flash" />}
    </>
  )
}
