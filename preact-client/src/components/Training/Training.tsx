import { useEffect, useState } from 'preact/hooks'
import { Board } from '@/components/Board'
import { FlashOverlay } from '@/components/FlashOverlay'
import { IntroModal } from './IntroModal'
import { GameOverModal } from './GameOverModal'
import { useTrainingGame } from './useTrainingGame'
import { useTrainingTimer } from './useTrainingTimer'

interface TrainingProps {
  onNavigateHome: () => void
}

export function Training({ onNavigateHome }: TrainingProps) {
  const [showSuccessFlash, setShowSuccessFlash] = useState(false)
  const [showErrorFlash, setShowErrorFlash] = useState(false)

  function triggerSuccessFlash() {
    setShowSuccessFlash(true)
    setTimeout(() => setShowSuccessFlash(false), 500)
  }

  function triggerErrorFlash() {
    setShowErrorFlash(true)
    setTimeout(() => setShowErrorFlash(false), 800)
  }

  const {
    gameState,
    handleCardClick,
    handleGameOver,
    startInitialGame,
    resetGame,
    initializeGame,
  } = useTrainingGame({
    onSuccess: triggerSuccessFlash,
    onError: triggerErrorFlash,
  })

  const { elapsedTime, timeRemaining } = useTrainingTimer({
    gameStartTime: gameState.gameStartTime,
    turnStartTime: gameState.turnStartTime,
    score: gameState.score,
    gameOver: gameState.gameOver,
    setFound: gameState.setFound,
    initialized: gameState.initialized,
    mode: gameState.mode,
    onTimeUp: handleGameOver,
  })

  useEffect(() => {
    initializeGame()
  }, [])

  return (
    <>
      <FlashOverlay showSuccessFlash={showSuccessFlash} showErrorFlash={showErrorFlash} />

      <div class="d-flex flex-column justify-content-between">
        <div>
          <Board
            board={gameState.board}
            selected={gameState.selected}
            setFound={gameState.setFound}
            gameOver={gameState.gameOver}
            score={gameState.score}
            elapsedTime={elapsedTime}
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
        onMainMenu={onNavigateHome}
      />
    </>
  )
}
