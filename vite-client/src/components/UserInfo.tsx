import React from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebaseConfig'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { logOut } from '../features/user/userSlice'

interface UserInfoProps {
  user: any
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const signOut = () => {
    firebaseSignOut(auth).then(() => {
      dispatch(logOut())
      // Clear guest user data from localStorage
      localStorage.removeItem('guestUser')
      localStorage.removeItem('nickname')
      console.log('Signed out.')
      navigate('/')
    })
  }

  if (!user || !user.uid) {
    return null
  }

  return (
    <div className="user-info-section">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="flex-grow-1 min-width-0">
          <div className="user-display-name text-truncate">
            Signed in as {user.displayName || 'User'}
          </div>
          {user.email && (
            <div className="user-email text-truncate small text-muted">{user.email}</div>
          )}
        </div>
        <button
          className="btn btn-danger btn-sm flex-shrink-0"
          onClick={signOut}
          style={{ minWidth: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default UserInfo
