<script lang="ts">
  import { onMount } from 'svelte'
  import Board from '@/components/Board.svelte'
  import FlashOverlay from '@/components/FlashOverlay.svelte'
  import DifficultySetup from './DifficultySetup.svelte'
  import SoloGameOver from './SoloGameOver.svelte'
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
    type GameState,
  } from './gameState'
  import { countSets, nameThird } from '@react-set/common'
  import { GAME_CONFIG, calculateDynamicCPUInterval } from '@react-set/common'

  let gameState: GameState = $state(createInitialState())
  let showCpuFlash = $state(false)
  let showUserFlash = $state(false)
  let roundStartTime: number | null = $state(null)

  // Timer refs
  let elapsedTimer: number | null = null
  let cpuTimer: number | null = null
  let cpuAnimationTimer: number | null = null
  let setFoundTimer: number | null = null
  let declarationTimer: number | null = null

  function triggerCpuFlash() {
    showCpuFlash = true
    setTimeout(() => (showCpuFlash = false), 800)
  }

  function triggerUserFlash() {
    showUserFlash = true
    setTimeout(() => (showUserFlash = false), 800)
  }

  // Elapsed time timer
  $effect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      elapsedTimer = window.setInterval(() => {
        gameState.elapsedSeconds = Math.floor(
          (Date.now() - gameState.startTime.getTime()) / 1000,
        )
      }, 1000)
    } else {
      if (elapsedTimer !== null) {
        clearInterval(elapsedTimer)
        elapsedTimer = null
      }
    }

    return () => {
      if (elapsedTimer !== null) {
        clearInterval(elapsedTimer)
      }
    }
  })

  // CPU Turn Timer
  const isCpuTurn = $derived(
    gameState.gameStarted &&
      !gameState.gameOver &&
      !gameState.declarer &&
      !gameState.setFound,
  )
  const currentBoard = $derived(gameState.board)
  const currentDifficulty = $derived(gameState.difficulty)

  $effect(() => {
    if (isCpuTurn) {
      const interval = calculateDynamicCPUInterval(
        currentDifficulty,
        countSets(currentBoard),
      )

      cpuTimer = window.setInterval(() => {
        const board = gameState.board
        if (gameState.declarer || gameState.gameOver || gameState.setFound) {
          return
        }

        const shuffled = [...board].sort(() => Math.random() - 0.5)
        const a = shuffled[0]
        const b = shuffled[1]
        const c = nameThird(a, b)

        if (board.includes(c)) {
          triggerCpuFlash()
          gameState = handleCpuFoundSet(gameState, a, b, c)
        }
      }, interval)
    } else {
      if (cpuTimer !== null) {
        clearInterval(cpuTimer)
        cpuTimer = null
      }
    }

    return () => {
      if (cpuTimer !== null) {
        clearInterval(cpuTimer)
      }
    }
  })

  // CPU Animation Timer
  const cpuAnimating = $derived(
    gameState.declarer === 'cpu' &&
      gameState.cpuFound &&
      gameState.cpuFound.length > 0,
  )

  $effect(() => {
    if (cpuAnimating) {
      cpuAnimationTimer = window.setInterval(() => {
        gameState = handleCpuAnimationStep(gameState)
      }, GAME_CONFIG.cpuDelay)
    } else {
      if (cpuAnimationTimer !== null) {
        clearInterval(cpuAnimationTimer)
        cpuAnimationTimer = null
      }
    }

    return () => {
      if (cpuAnimationTimer !== null) {
        clearInterval(cpuAnimationTimer)
      }
    }
  })

  // Set Found Timer
  const setFound = $derived(gameState.setFound)
  const selectedForCheck = $derived(gameState.selected)
  const declarerForCheck = $derived(gameState.declarer)

  $effect(() => {
    if (
      setFound &&
      selectedForCheck.length === 3 &&
      isSet(selectedForCheck)
    ) {
      setFoundTimer = window.setTimeout(() => {
        const newState = processFoundSet(
          gameState,
          gameState.selected,
          declarerForCheck!,
          roundStartTime,
        )
        gameState = newState
        roundStartTime = Date.now()
      }, GAME_CONFIG.setDisplayTime)
    } else {
      if (setFoundTimer !== null) {
        clearTimeout(setFoundTimer)
        setFoundTimer = null
      }
    }

    return () => {
      if (setFoundTimer !== null) {
        clearTimeout(setFoundTimer)
      }
    }
  })

  // Declaration Expiration Timer
  const declarationActive = $derived(
    gameState.declarer && gameState.timeDeclared && !gameState.setFound,
  )

  $effect(() => {
    if (declarationActive) {
      declarationTimer = window.setTimeout(() => {
        gameState = handleDeclarationExpired(gameState)
      }, GAME_CONFIG.turnTime)
    }

    return () => {
      if (declarationTimer !== null) {
        clearTimeout(declarationTimer)
      }
    }
  })

  // Reset round start time when game starts
  const gameStarted = $derived(gameState.gameStarted)
  const gameOver = $derived(gameState.gameOver)

  $effect(() => {
    if (gameStarted && roundStartTime === null) {
      roundStartTime = Date.now()
    }
  })

  function onCardClick(card: string) {
    const newState = handleCardClick(gameState, card)
    if (newState.setFound && newState.declarer === newState.myName) {
      triggerUserFlash()
    }
    gameState = newState
  }

  function onRedeal() {
    gameState = handleRedeal(gameState)
  }

  function onResetGame() {
    gameState = resetGame(gameState)
    roundStartTime = null
  }

  function onStartGame() {
    const newState = handleStartGame(gameState)
    gameState = { ...newState, ...createGameState() }
    roundStartTime = Date.now()
  }

  function onDifficultyChange(newDifficulty: number) {
    gameState = handleDifficultyChange(gameState, newDifficulty)
  }

  function isSet(selected: string[]): boolean {
    if (selected.length !== 3) return false
    const [a, b, c] = selected
    for (let i = 0; i < 4; i++) {
      const sum = Number(a[i]) + Number(b[i]) + Number(c[i])
      if (sum % 3 !== 0) return false
    }
    return true
  }
</script>

{#if !gameState.gameStarted}
  <DifficultySetup
    difficulty={gameState.difficulty}
    onDifficultyChange={onDifficultyChange}
    onStartGame={onStartGame}
  />
{:else if gameState.gameOver}
  <SoloGameOver
    winner={gameState.gameOver}
    players={gameState.players}
    onReset={onResetGame}
  />
{:else}
  <FlashOverlay showCpuFlash={showCpuFlash} showUserFlash={showUserFlash} />

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
    players={gameState.players}
  />
{/if}
