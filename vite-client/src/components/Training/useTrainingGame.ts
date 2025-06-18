import { useState, useCallback, useMemo } from 'react'
import { getBoardStartingWithSet, isSet, nameThird } from '../../utils/helpers'
import { TRAINING_CONFIG, getHighScoreKey, migrateLegacyHighScore } from './constants'
import type { GameState, TrainingGameHookReturn, TrainingMode } from './types'

export const useTrainingGame = (): TrainingGameHookReturn => {
  const [gameState, setGameState] = useState<GameState>({
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

  const generateNewBoard = useCallback(
    ({
      select = true,
      mode = 'two-card-hint',
    }: { select?: boolean; mode?: TrainingMode } = {}) => {
      const { board: newBoard } = getBoardStartingWithSet({
        boardSize: TRAINING_CONFIG.boardSize,
        commonTraits: null,
      })

      if (mode === 'two-card-hint') {
        // Original mode: show first two cards, blank third, rest of cards (6 total)
        const board = [...newBoard.slice(0, 2), '0333', ...newBoard.slice(2, 8)]
        const selected = select ? newBoard.slice(0, 2) : []
        return { board, selected }
      } else {
        // One card hint mode: show first card, two blanks, then 6 cards including the two correct answers
        const hintCard = newBoard[0]
        const secondCardOfSet = newBoard[1]

        // Find the third card that completes the set with hintCard and secondCardOfSet
        const thirdCardOfSet = nameThird(hintCard, secondCardOfSet)

        // The remaining cards from the original board (excluding the hint card)
        const remainingCards = newBoard.slice(1)

        // Ensure we have the second and third cards of the set in our options
        // and fill the rest with other cards to make 6 total
        const otherCards = remainingCards.filter(
          (card) => card !== secondCardOfSet && card !== thirdCardOfSet,
        )
        const additionalCards = otherCards.slice(0, 4) // Take 4 more to make 6 total

        // Create the options array: the 2 cards that complete the set + 4 other cards = 6 total
        const options = [secondCardOfSet, thirdCardOfSet, ...additionalCards]

        // Shuffle the options to randomize their positions
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5)

        // Board structure: [hint card, blank, blank, ...6 shuffled options]
        const board = [hintCard, '0333', '0333', ...shuffledOptions]
        const selected = select ? [hintCard] : []

        // Verify that the correct set exists on the board
        if (
          !shuffledOptions.includes(secondCardOfSet) ||
          !shuffledOptions.includes(thirdCardOfSet)
        ) {
          console.error('Generated board does not contain the complete set!')
        }

        return { board, selected }
      }
    },
    [],
  )

  const initializeGame = useCallback(() => {
    // Migrate legacy high scores on first run
    migrateLegacyHighScore()

    const { board, selected } = generateNewBoard({ select: false })
    const now = Date.now()

    setGameState({
      board,
      selected,
      score: 0,
      gameStartTime: now,
      turnStartTime: now,
      gameOver: true, // Start with game over until intro modal is closed
      showModal: false,
      setFound: false,
      initialized: false, // Not initialized until intro modal is dismissed
      mode: 'two-card-hint', // Default mode
    })
  }, [generateNewBoard])

  const startTurn = useCallback((currentScore: number) => {
    setGameState((prev) => ({
      ...prev,
      turnStartTime: Date.now(),
      setFound: false,
    }))
  }, [])

  const handleCardClick = useCallback(
    (card: string, onSuccess: () => void, onError: () => void) => {
      setGameState((prev) => {
        if (prev.selected.length === 3 || prev.gameOver) {
          return prev
        }

        // Ignore clicks on blank cards (represented by '0333')
        if (card === '0333') {
          return prev
        }

        // Ignore clicks on already selected cards
        if (prev.selected.includes(card)) {
          return prev
        }

        const newSelected = [...prev.selected, card]

        // For one-card-hint mode, check if third card exists on board when first card is selected
        if (prev.mode === 'one-card-hint' && prev.selected.length === 1) {
          const third = nameThird(prev.selected[0], card)
          const boardWithoutBlanks = prev.board.filter((c) => c !== '0333')

          if (!boardWithoutBlanks.includes(third)) {
            // Third card doesn't exist on board, game over - show a correct set
            onError()

            const hintCard = prev.board[0] // First card is always the hint card

            // Find the first valid set that includes the hint card
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

            // Update high score
            const highScoreKey = getHighScoreKey(prev.mode)
            const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
            if (currentHighScore < prev.score) {
              localStorage.setItem(highScoreKey, prev.score.toString())
            }

            const newState = {
              ...prev,
              gameOver: true,
              selected: validSet,
            }

            // Schedule modal appearance
            setTimeout(() => {
              setGameState((current) => ({ ...current, showModal: true }))
            }, TRAINING_CONFIG.gameOverDelay)

            return newState
          }
        }

        if (isSet(newSelected)) {
          onSuccess()

          const newScore = prev.score + 1
          const newState = {
            ...prev,
            selected: newSelected,
            score: newScore,
            setFound: true,
          }

          // Schedule new board generation
          setTimeout(() => {
            const { board, selected } = generateNewBoard({ mode: prev.mode })
            setGameState((current) => ({
              ...current,
              board,
              selected,
              setFound: false,
              turnStartTime: Date.now(),
            }))
          }, TRAINING_CONFIG.setFoundDelay)

          return newState
        } else {
          // Handle wrong selection
          if (prev.mode === 'two-card-hint' && newSelected.length === 3) {
            // Two-card-hint mode: wrong selection with 3 cards means game over
            onError()

            const third = nameThird(prev.selected[0], prev.selected[1])

            // Update high score
            const highScoreKey = getHighScoreKey(prev.mode)
            const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
            if (currentHighScore < prev.score) {
              localStorage.setItem(highScoreKey, prev.score.toString())
            }

            const newState = {
              ...prev,
              gameOver: true,
              selected: [...prev.selected, third],
            }

            // Schedule modal appearance
            setTimeout(() => {
              setGameState((current) => ({ ...current, showModal: true }))
            }, TRAINING_CONFIG.gameOverDelay)

            return newState
          } else {
            // Handle wrong selection in one-card-hint mode
            if (prev.mode === 'one-card-hint' && newSelected.length >= 2) {
              // In one-card-hint mode, check if we can make a valid set after each selection
              if (newSelected.length === 2) {
                // User selected their first card - check if there's a valid third card on the board
                const third = nameThird(newSelected[0], newSelected[1])
                const boardWithoutBlanks = prev.board.filter((c) => c !== '0333')

                if (boardWithoutBlanks.includes(third)) {
                  // Valid set possible, just add to selection
                  return {
                    ...prev,
                    selected: newSelected,
                  }
                } else {
                  // No valid third card exists, game over - show a correct set
                  onError()

                  const hintCard = prev.board[0] // First card is always the hint card

                  // Find the first valid set that includes the hint card
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

                  // Update high score
                  const highScoreKey = getHighScoreKey(prev.mode)
                  const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
                  if (currentHighScore < prev.score) {
                    localStorage.setItem(highScoreKey, prev.score.toString())
                  }

                  const newState = {
                    ...prev,
                    gameOver: true,
                    selected: validSet,
                  }

                  // Schedule modal appearance
                  setTimeout(() => {
                    setGameState((current) => ({ ...current, showModal: true }))
                  }, TRAINING_CONFIG.gameOverDelay)

                  return newState
                }
              } else if (newSelected.length === 3) {
                // User selected their second card - check if it forms a valid set
                if (isSet(newSelected)) {
                  // Valid set! This should trigger the success path above, but just in case
                  return {
                    ...prev,
                    selected: newSelected,
                  }
                } else {
                  // Invalid set - game over, show a correct set
                  onError()

                  const hintCard = prev.board[0] // First card is always the hint card
                  const boardWithoutBlanks = prev.board.filter((c) => c !== '0333')

                  // Find the first valid set that includes the hint card
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

                  // Update high score
                  const highScoreKey = getHighScoreKey(prev.mode)
                  const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
                  if (currentHighScore < prev.score) {
                    localStorage.setItem(highScoreKey, prev.score.toString())
                  }

                  const newState = {
                    ...prev,
                    gameOver: true,
                    selected: validSet,
                  }

                  // Schedule modal appearance
                  setTimeout(() => {
                    setGameState((current) => ({ ...current, showModal: true }))
                  }, TRAINING_CONFIG.gameOverDelay)

                  return newState
                }
              }
            } else {
              // One-card-hint mode: just add the card to selection, continue game
              return {
                ...prev,
                selected: newSelected,
              }
            }
          }
        }
      })
    },
    [generateNewBoard],
  )

  const handleGameOver = useCallback(() => {
    setGameState((prev) => {
      let finalSelected = prev.selected

      if (prev.mode === 'two-card-hint') {
        // Two-card-hint mode: calculate the third card that would complete the set
        if (prev.selected.length >= 2) {
          const third = nameThird(prev.selected[0], prev.selected[1])
          finalSelected = [...prev.selected, third]
        } else {
          // If somehow we don't have 2 cards, just show what we have
          finalSelected = prev.selected
        }
      } else {
        // One-card-hint mode: show a complete valid set from the board
        const hintCard = prev.board[0] // First card is always the hint card
        const boardWithoutBlanks = prev.board.filter((c) => c !== '0333')

        // Find the first valid set that includes the hint card
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

      // Update high score
      const highScoreKey = getHighScoreKey(prev.mode)
      const currentHighScore = Number(localStorage.getItem(highScoreKey) || '0')
      if (currentHighScore < prev.score) {
        localStorage.setItem(highScoreKey, prev.score.toString())
      }

      const newState = {
        ...prev,
        gameOver: true,
        selected: finalSelected,
      }

      // Schedule modal appearance
      setTimeout(() => {
        setGameState((current) => ({ ...current, showModal: true }))
      }, TRAINING_CONFIG.gameOverDelay)

      return newState
    })
  }, [])

  const resetGame = useCallback(() => {
    setGameState((prev) => {
      const { board, selected } = generateNewBoard({ mode: prev.mode })
      const now = Date.now()

      return {
        board,
        selected,
        score: 0,
        gameStartTime: now,
        turnStartTime: now,
        gameOver: false,
        showModal: false,
        setFound: false,
        initialized: true,
        mode: prev.mode,
      }
    })
  }, [generateNewBoard])

  const startInitialGame = useCallback(
    (mode: TrainingMode) => {
      const { board, selected } = generateNewBoard({ mode })
      const now = Date.now()

      setGameState((prev) => ({
        ...prev,
        board,
        selected,
        gameOver: false,
        initialized: true,
        gameStartTime: now,
        turnStartTime: now,
        mode,
      }))
    },
    [generateNewBoard],
  )

  const actions = useMemo(
    () => ({
      initializeGame,
      handleCardClick,
      handleGameOver,
      resetGame,
      startInitialGame,
      startTurn,
    }),
    [initializeGame, handleCardClick, handleGameOver, resetGame, startInitialGame, startTurn],
  )

  return {
    gameState,
    actions,
  }
}
