import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import Board from '@/components/Board.tsx'
import DifficultySetup from './Solo/DifficultySetup'
import FlashOverlay from './FlashOverlay'
import { useSoloGame } from './Solo/useSoloGame'
import { RootState } from '../store'

function Solo() {
  // User data from Redux
  const userReducer = useSelector((state: RootState) => state.user)
  const { user } = userReducer

  // Game logic hook
  const { state, flashState, handlers } = useSoloGame(user)

  // Debug logging for user state
  useEffect(() => {
    console.log(
      'Solo component - user state:',
      user ? `${user.displayName} (${user.uid})` : 'No user',
    )
  }, [user])

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
    elapsedSeconds,
  } = state

  const { showCpuFlash, showUserFlash } = flashState
  const { handleCardClick, handleRedeal, resetGame, handleStartGame, handleDifficultyChange } =
    handlers

  if (userReducer.loading) {
    return 'Loading...'
  }

  if (!gameStarted) {
    return (
      <DifficultySetup
        user={user}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        onStartGame={handleStartGame}
      />
    )
  }

  return (
    <>
      <FlashOverlay showCpuFlash={showCpuFlash} showUserFlash={showUserFlash} />

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
        elapsedTime={elapsedSeconds}
      />
    </>
  )
}

export default Solo
