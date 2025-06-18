import React, { Fragment, useEffect } from 'react'
import { colors } from '../../config'
import scssColors from '@/styles/bts/colors.module.scss'

import Board from '../Board'
import FlashOverlay from '../FlashOverlay'
import { useFlashAnimation } from '../../hooks/useFlashAnimation'
import { IntroModal } from './IntroModal'
import { GameOverModal } from './GameOverModal'
import { useTrainingGame } from './useTrainingGame'
import { useTrainingTimer } from './useTrainingTimer'

const Training: React.FC = () => {
  const { gameState, actions } = useTrainingGame()
  const { showSuccessFlash, showErrorFlash, triggerSuccessFlash, triggerErrorFlash } =
    useFlashAnimation()

  const handleTimeUp = () => {
    actions.handleGameOver()
    triggerErrorFlash()
  }

  const { elapsedTime, timeRemaining } = useTrainingTimer({
    gameStartTime: gameState.gameStartTime,
    turnStartTime: gameState.turnStartTime,
    score: gameState.score,
    gameOver: gameState.gameOver,
    setFound: gameState.setFound,
    initialized: gameState.initialized,
    mode: gameState.mode,
    onTimeUp: handleTimeUp,
  })

  // Initialize game on mount
  useEffect(() => {
    actions.initializeGame()
  }, []) // Empty dependency array is intentional - we only want to initialize once

  const handleCardClick = (card: string) => {
    if (gameState.gameOver) {
      return
    }

    // For two-card-hint mode, prevent selection when already have 3 cards
    if (gameState.mode === 'two-card-hint' && gameState.selected.length === 3) {
      return
    }

    // For one-card-hint mode, prevent selection when already have 3 cards
    if (gameState.mode === 'one-card-hint' && gameState.selected.length === 3) {
      return
    }

    actions.handleCardClick(
      card,
      () => triggerSuccessFlash(), // onSuccess
      () => triggerErrorFlash(), // onError
    )
  }

  const playerInfo = {
    you: {
      name: 'you',
      score: gameState.score,
      color: gameState.gameOver ? scssColors.errorRed : scssColors.lightBlue,
    },
  }

  return (
    <Fragment>
      <FlashOverlay showSuccessFlash={showSuccessFlash} showErrorFlash={showErrorFlash} />

      <div className="d-flex flex-column justify-content-between">
        <div>
          <Board
            board={gameState.board}
            deck={[]}
            selected={gameState.selected}
            declarer={null}
            handleCardClick={handleCardClick}
            handleDeclare={() => {}}
            players={playerInfo}
            setFound={false}
            gameOver={gameState.gameOver}
            myName="you"
            resetGame={() => {}}
            solo={true}
            gameMode="training"
            elapsedTime={elapsedTime}
            timeLeft={timeRemaining}
          />
        </div>
      </div>

      <IntroModal show={!gameState.initialized} onClose={actions.startInitialGame} />

      <GameOverModal
        show={gameState.initialized && gameState.gameOver && gameState.showModal}
        finalScore={gameState.score}
        mode={gameState.mode}
        onRestart={actions.resetGame}
      />
    </Fragment>
  )
}

export default Training
