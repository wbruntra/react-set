<script lang="ts">
  import Board from '@/components/Board.svelte'
  import FlashOverlay from '@/components/FlashOverlay.svelte'
  import IntroModal from './IntroModal.svelte'
  import GameOverModal from './GameOverModal.svelte'
  import { getBoardStartingWithSet, isSet, nameThird } from '@/utils/helpers'
  import { TRAINING_CONFIG, getHighScoreKey, migrateLegacyHighScore } from './constants'
  import type { TrainingMode } from './types'

  interface GameState {
    board: string[]
    selected: string[]
    score: number
    gameStartTime: number
    turnStartTime: number
    gameOver: boolean
    showModal: boolean
    setFound: boolean
    initialized: boolean
    mode: TrainingMode
  }

  let gameState: GameState = $state({
    board: [],
    selected: [],
    score: 0,
    gameStartTime: Date.now(),
    turnStartTime: Date.now(),
    gameOver: true,
    showModal: false,
    setFound: false,
    initialized: false,
    mode: 'two-card-hint',
  })

  let showSuccessFlash = $state(false)
  let showErrorFlash = $state(false)
  let elapsedTime = $state(0)
  let timeRemaining = $state(0)

  function generateNewBoard(
    select = true,
    mode: TrainingMode = 'two-card-hint',
  ): { board: string[]; selected: string[] } {
    const { board: newBoard } = getBoardStartingWithSet({
      boardSize: TRAINING_CONFIG.boardSize,
      commonTraits: null,
    })

    if (mode === 'two-card-hint') {
      const board = [...newBoard.slice(0, 2), '0333', ...newBoard.slice(2, 8)]
      const selected = select ? newBoard.slice(0, 2) : []
      return { board, selected }
    } else {
      const hintCard = newBoard[0]
      const secondCardOfSet = newBoard[1]
      const thirdCardOfSet = nameThird(hintCard, secondCardOfSet)

      const remainingCards = newBoard.slice(1)
      const otherCards = remainingCards.filter(
        (card) => card !== secondCardOfSet && card !== thirdCardOfSet,
      )
      const additionalCards = otherCards.slice(0, 4)

      const options = [secondCardOfSet, thirdCardOfSet, ...additionalCards]
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5)

      const board = [hintCard, '0333', '0333', ...shuffledOptions]
      const selected = select ? [hintCard] : []

      if (
        !shuffledOptions.includes(secondCardOfSet) ||
        !shuffledOptions.includes(thirdCardOfSet)
      ) {
        console.error('Generated board does not contain the complete set!')
      }

      return { board, selected }
    }
  }

  function initializeGame() {
    migrateLegacyHighScore()
    const { board, selected } = generateNewBoard(false)
    const now = Date.now()

    gameState = {
      board,
      selected,
      score: 0,
      gameStartTime: now,
      turnStartTime: now,
      gameOver: true,
      showModal: false,
      setFound: false,
      initialized: false,
      mode: 'two-card-hint',
    }
  }

  function calculateTurnTime(currentScore: number, gameMode: TrainingMode): number {
    const config =
      gameMode === 'one-card-hint'
        ? {
            initial: TRAINING_CONFIG.oneCardHintInitialTurnTime,
            minimum: TRAINING_CONFIG.oneCardHintMinimumTurnTime,
          }
        : {
            initial: TRAINING_CONFIG.initialTurnTime,
            minimum: TRAINING_CONFIG.minimumTurnTime,
          }

    const calc = Math.round(config.initial - 1100 * Math.log2(currentScore + 1))
    return Math.max(calc, config.minimum)
  }

  function triggerSuccessFlash() {
    showSuccessFlash = true
    setTimeout(() => (showSuccessFlash = false), 500)
  }

  function triggerErrorFlash() {
    showErrorFlash = true
    setTimeout(() => (showErrorFlash = false), 800)
  }

  function handleGameOver() {
    let finalSelected = gameState.selected

    if (gameState.mode === 'two-card-hint') {
      if (gameState.selected.length >= 2) {
        const third = nameThird(gameState.selected[0], gameState.selected[1])
        finalSelected = [...gameState.selected, third]
      } else {
        finalSelected = gameState.selected
      }
    } else {
      const hintCard = gameState.board[0]
      const boardWithoutBlanks = gameState.board.filter((c) => c !== '0333')

      let validSet = [hintCard]
      for (let i = 1; i < boardWithoutBlanks.length; i++) {
        for (let j = i + 1; j < boardWithoutBlanks.length; j++) {
          const card1 = boardWithoutBlanks[i]
          const card2 = boardWithoutBlanks[j]
          const testSet = [hintCard, card1, card2]
          if (isSet(testSet)) {
            validSet = testSet
            break
          }
        }
        if (validSet.length === 3) break
      }

      finalSelected = validSet
    }

    const highScoreKey = getHighScoreKey(gameState.mode)
    const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
    if (currentHighScore < gameState.score) {
      localStorage.setItem(highScoreKey, gameState.score.toString())
    }

    gameState = {
      ...gameState,
      gameOver: true,
      selected: finalSelected,
    }

    setTimeout(() => {
      gameState = { ...gameState, showModal: true }
    }, TRAINING_CONFIG.gameOverDelay)
  }

  function handleCardClick(card: string) {
    if (gameState.gameOver) {
      return
    }

    if (gameState.mode === 'two-card-hint' && gameState.selected.length === 3) {
      return
    }

    if (gameState.mode === 'one-card-hint' && gameState.selected.length === 3) {
      return
    }

    if (gameState.selected.length === 3 || gameState.gameOver) {
      return
    }

    if (card === '0333') {
      return
    }

    if (gameState.selected.includes(card)) {
      return
    }

    const newSelected = [...gameState.selected, card]

    if (gameState.mode === 'one-card-hint' && gameState.selected.length === 1) {
      const third = nameThird(gameState.selected[0], card)
      const boardWithoutBlanks = gameState.board.filter((c) => c !== '0333')

      if (!boardWithoutBlanks.includes(third)) {
        triggerErrorFlash()

        const hintCard = gameState.board[0]

        let validSet = [hintCard]
        for (let i = 1; i < boardWithoutBlanks.length; i++) {
          for (let j = i + 1; j < boardWithoutBlanks.length; j++) {
            const card1 = boardWithoutBlanks[i]
            const card2 = boardWithoutBlanks[j]
            const testSet = [hintCard, card1, card2]
            if (isSet(testSet)) {
              validSet = testSet
              break
            }
          }
          if (validSet.length === 3) break
        }

        const highScoreKey = getHighScoreKey(gameState.mode)
        const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
        if (currentHighScore < gameState.score) {
          localStorage.setItem(highScoreKey, gameState.score.toString())
        }

        gameState = {
          ...gameState,
          gameOver: true,
          selected: validSet,
        }

        setTimeout(() => {
          gameState = { ...gameState, showModal: true }
        }, TRAINING_CONFIG.gameOverDelay)

        return
      }
    }

    if (isSet(newSelected)) {
      triggerSuccessFlash()

      const newScore = gameState.score + 1
      gameState = {
        ...gameState,
        selected: newSelected,
        score: newScore,
        setFound: true,
      }

      setTimeout(() => {
        const { board, selected } = generateNewBoard(true, gameState.mode)
        gameState = {
          ...gameState,
          board,
          selected,
          setFound: false,
          turnStartTime: Date.now(),
        }
      }, TRAINING_CONFIG.setFoundDelay)
    } else {
      if (gameState.mode === 'two-card-hint' && newSelected.length === 3) {
        triggerErrorFlash()

        const third = nameThird(gameState.selected[0], gameState.selected[1])

        const highScoreKey = getHighScoreKey(gameState.mode)
        const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
        if (currentHighScore < gameState.score) {
          localStorage.setItem(highScoreKey, gameState.score.toString())
        }

        gameState = {
          ...gameState,
          gameOver: true,
          selected: [...gameState.selected, third],
        }

        setTimeout(() => {
          gameState = { ...gameState, showModal: true }
        }, TRAINING_CONFIG.gameOverDelay)
      } else {
        if (gameState.mode === 'one-card-hint' && newSelected.length >= 2) {
          if (newSelected.length === 2) {
            const third = nameThird(newSelected[0], newSelected[1])
            const boardWithoutBlanks = gameState.board.filter((c) => c !== '0333')

            if (boardWithoutBlanks.includes(third)) {
              gameState = {
                ...gameState,
                selected: newSelected,
              }
            } else {
              triggerErrorFlash()

              const hintCard = gameState.board[0]

              let validSet = [hintCard]
              for (let i = 1; i < boardWithoutBlanks.length; i++) {
                for (let j = i + 1; j < boardWithoutBlanks.length; j++) {
                  const card1 = boardWithoutBlanks[i]
                  const card2 = boardWithoutBlanks[j]
                  const testSet = [hintCard, card1, card2]
                  if (isSet(testSet)) {
                    validSet = testSet
                    break
                  }
                }
                if (validSet.length === 3) break
              }

              const highScoreKey = getHighScoreKey(gameState.mode)
              const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
              if (currentHighScore < gameState.score) {
                localStorage.setItem(highScoreKey, gameState.score.toString())
              }

              gameState = {
                ...gameState,
                gameOver: true,
                selected: validSet,
              }

              setTimeout(() => {
                gameState = { ...gameState, showModal: true }
              }, TRAINING_CONFIG.gameOverDelay)
            }
          } else if (newSelected.length === 3) {
            if (isSet(newSelected)) {
              gameState = {
                ...gameState,
                selected: newSelected,
              }
            } else {
              triggerErrorFlash()

              const hintCard = gameState.board[0]
              const boardWithoutBlanks = gameState.board.filter((c) => c !== '0333')

              let validSet = [hintCard]
              for (let i = 1; i < boardWithoutBlanks.length; i++) {
                for (let j = i + 1; j < boardWithoutBlanks.length; j++) {
                  const card1 = boardWithoutBlanks[i]
                  const card2 = boardWithoutBlanks[j]
                  const testSet = [hintCard, card1, card2]
                  if (isSet(testSet)) {
                    validSet = testSet
                    break
                  }
                }
                if (validSet.length === 3) break
              }

              const highScoreKey = getHighScoreKey(gameState.mode)
              const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
              if (currentHighScore < gameState.score) {
                localStorage.setItem(highScoreKey, gameState.score.toString())
              }

              gameState = {
                ...gameState,
                gameOver: true,
                selected: validSet,
              }

              setTimeout(() => {
                gameState = { ...gameState, showModal: true }
              }, TRAINING_CONFIG.gameOverDelay)
            }
          }
        } else {
          gameState = {
            ...gameState,
            selected: newSelected,
          }
        }
      }
    }
  }

  function startInitialGame(mode: TrainingMode) {
    const { board, selected } = generateNewBoard(true, mode)
    const now = Date.now()

    gameState = {
      ...gameState,
      board,
      selected,
      gameOver: false,
      initialized: true,
      gameStartTime: now,
      turnStartTime: now,
      mode,
    }
  }

  function resetGame() {
    const { board, selected } = generateNewBoard(true, gameState.mode)
    const now = Date.now()

    gameState = {
      board,
      selected,
      score: 0,
      gameStartTime: now,
      turnStartTime: now,
      gameOver: false,
      showModal: false,
      setFound: false,
      initialized: true,
      mode: gameState.mode,
    }
  }

  $effect(() => {
    initializeGame()
  })

  $effect(() => {
    let timerInterval: number | null = null

    if (!gameState.gameOver && !gameState.setFound && gameState.initialized) {
      timerInterval = window.setInterval(() => {
        const now = Date.now()
        const elapsed = Math.round((now - gameState.gameStartTime) / 1000)
        const timeSinceTurnStart = now - gameState.turnStartTime
        const newTimeRemaining = calculateTurnTime(gameState.score, gameState.mode) - timeSinceTurnStart

        elapsedTime = elapsed
        timeRemaining = Math.max(0, Math.round((newTimeRemaining / 1000) * 10) / 10)

        if (newTimeRemaining <= 0 && !gameState.setFound) {
          handleGameOver()
          triggerErrorFlash()
        }
      }, TRAINING_CONFIG.timerUpdateInterval)
    }

    return () => {
      if (timerInterval !== null) {
        clearInterval(timerInterval)
      }
    }
  })
</script>

<FlashOverlay {showSuccessFlash} {showErrorFlash} />

<div class="d-flex flex-column justify-content-between">
  <div>
    <Board
      board={gameState.board}
      selected={gameState.selected}
      setFound={gameState.setFound}
      gameOver={gameState.gameOver}
      score={gameState.score}
      {elapsedTime}
      timeLeft={timeRemaining}
      onCardClick={handleCardClick}
    />
  </div>
</div>

<IntroModal show={!gameState.initialized} onStart={startInitialGame} />

<GameOverModal
  show={gameState.initialized && gameState.gameOver && gameState.showModal}
  finalScore={gameState.score}
  mode={gameState.mode}
  onRestart={resetGame}
/>

<style>
  :global(.container) {
    background-color: #f7f8fa;
    border-radius: 8px;
  }

  :global(.bg-light-purple) {
    background-color: #e4deff;
  }
</style>
