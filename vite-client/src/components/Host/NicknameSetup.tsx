import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { updateNickname } from '../../features/user/userSlice'
import { MessageCard } from './MessageCard'
import UserInfo from '../UserInfo'

interface NicknameSetupProps {
  user: any
  onSetName: (e: React.FormEvent) => void
}

/**
 * Component for setting up user nickname
 */
export const NicknameSetup: React.FC<NicknameSetupProps> = ({ user, onSetName }) => {
  const dispatch = useDispatch()

  return (
    <MessageCard title="Enter Your Nickname">
      <UserInfo user={user} />
      <form onSubmit={onSetName}>
        <div className="mb-4">
          <input
            autoFocus
            placeholder="Enter your nickname"
            className="form-control form-control-lg text-center"
            value={user?.nickname || ''}
            onChange={(e) => {
              dispatch(updateNickname(e.target.value))
              window.localStorage.setItem('nickname', e.target.value)
            }}
          />
        </div>
        <div className="mb-4">
          <button type="submit" className="btn btn-primary btn-lg">
            Set Nickname
          </button>
        </div>
      </form>
      <div className="mt-4">
        <Link to="/" className="btn btn-outline-secondary">
          ← Back to Main Menu
        </Link>
      </div>
    </MessageCard>
  )
}
