import React from 'react'
import { isEmpty } from 'lodash'
import { useSelector } from 'react-redux'

import Board from './Board'
import PlayerList from './PlayerList'
import { RootState } from '../store'
import {
  useHostGame,
  SignInPrompt,
  GameResumePrompt,
  NicknameSetup,
  GameCreation,
} from './Host/index'

function Host() {
  // User data from Redux
  const userReducer = useSelector((state: RootState) => state.user)
  const { user, loading: userLoading } = userReducer

  // Game logic hook
  const { state, gameInProgress, handlers } = useHostGame(user)

  const {
    board,
    deck,
    selected,
    declarer,
    players,
    created,
    gameStarted,
    myName,
    gameTitle,
    setFound,
    gameOver,
  } = state

  const {
    handleCardClick,
    handleRedeal,
    handleCreateGame,
    handleSetName,
    handleRejectResume,
    reloadGame,
    setGameTitle,
    setState,
    setAndSendState,
  } = handlers

  if (userLoading) {
    return 'Loading...'
  }

  if (isEmpty(user)) {
    return <SignInPrompt />
  }

  if (gameInProgress && !created) {
    return <GameResumePrompt onResumeGame={reloadGame} onDeleteGame={handleRejectResume} />
  }

  if (myName === '') {
    return <NicknameSetup user={user} onSetName={handleSetName} />
  }

  if (!created) {
    return (
      <GameCreation
        myName={myName}
        gameTitle={gameTitle}
        onGameTitleChange={setGameTitle}
        onCreateGame={handleCreateGame}
      />
    )
  }

  if (!gameStarted) {
    return (
      <PlayerList
        isHost={true}
        players={players}
        setState={setState}
        setAndSendState={setAndSendState}
      />
    )
  }

  return (
    <Board
      board={board}
      deck={deck}
      selected={selected}
      declarer={declarer}
      handleCardClick={handleCardClick}
      handleDeclare={() => {}} // Pass empty function
      handleRedeal={handleRedeal}
      players={players}
      setFound={setFound}
      gameOver={gameOver}
      myName={myName}
      resetGame={() => {}} // Pass empty function
      solo={false} // Set to false for Host mode
      gameMode="versus"
    />
  )
}

export default Host
