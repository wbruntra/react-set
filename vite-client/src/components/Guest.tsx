import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import { RootState } from '../store'
import { useGuestGame, GuestSignIn, NicknameSetup, GameBoard } from './Guest/index'
import PlayerList from './PlayerList'

function Guest() {
  const userReducer = useSelector((state: RootState) => state.user)
  const { user, loading: userLoading } = userReducer

  // Game logic hook
  const { state, myName, handlers } = useGuestGame(user)
  const { handleCardClick, handleSetName, setState } = handlers
  const { players, gameStarted } = state

  if (userLoading) {
    return 'Loading profile...'
  }

  // Allow guests to join without authentication
  if (isEmpty(user)) {
    return <GuestSignIn onGuestJoin={() => {}} />
  }

  if (!myName) {
    return <NicknameSetup user={user} onSetName={handleSetName} />
  }

  if (!gameStarted) {
    return <PlayerList players={players || {}} isHost={false} setState={setState} />
  }

  return <GameBoard state={state} myName={myName} onCardClick={handleCardClick} />
}

export default Guest
