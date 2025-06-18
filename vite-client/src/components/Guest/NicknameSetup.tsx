import React from 'react'
import { useDispatch } from 'react-redux'
import { handleGoogleSignIn } from '../../utils/helpers'
import { updateNickname } from '../../features/user/userSlice'
import UserInfo from '../UserInfo'

interface User {
  uid?: string
  nickname?: string
  displayName?: string
  email?: string
  isGuest?: boolean
  [key: string]: any
}

interface NicknameSetupProps {
  user: User
  onSetName: (e: React.FormEvent) => void
}

/**
 * Component for setting up user nickname before joining game
 */
export const NicknameSetup: React.FC<NicknameSetupProps> = ({ user, onSetName }) => {
  const dispatch = useDispatch()

  const handleNicknameChange = (value: string) => {
    dispatch(updateNickname(value))

    // Update localStorage for guest users
    if (user?.isGuest) {
      const updatedGuestUser = {
        ...user,
        nickname: value,
        displayName: value,
      }
      localStorage.setItem('guestUser', JSON.stringify(updatedGuestUser))
    }
    window.localStorage.setItem('nickname', value)
  }

  return (
    <div className="container">
      <UserInfo user={user} />

      <h4 className="mb-3">Choose your nickname:</h4>
      {user?.isGuest && (
        <div className="alert alert-info mb-3">
          <small>
            👋 Welcome back, {user.nickname}! You're playing as a guest.
            <button
              className="btn btn-link btn-sm p-0 ms-2"
              onClick={() => {
                localStorage.removeItem('guestUser')
                handleGoogleSignIn()
              }}
            >
              Sign in with Google
            </button>
            for a permanent profile.
          </small>
        </div>
      )}
      <form onSubmit={onSetName}>
        <div className="col-12 col-md-4">
          <input
            autoFocus
            type="text"
            placeholder="your name"
            value={user?.nickname || ''}
            onChange={(e) => handleNicknameChange(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-4">
          <input className="btn btn-primary mt-3 ml-md-3" type="submit" value="Join" />
        </div>
      </form>
    </div>
  )
}
