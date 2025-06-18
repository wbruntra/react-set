import React from 'react'
import { useNavigate } from 'react-router-dom'
import firebase from 'firebase/compat/app'
import { useDispatch } from 'react-redux'
import { logOut } from '../features/user/userSlice'

interface UserInfoProps {
  user: any
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
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
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="user-display-name">Signed in as {user.displayName || 'User'}</div>
          {user.email && <div className="user-email">{user.email}</div>}
        </div>
        <button className="btn btn-danger btn-sm" onClick={signOut}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default UserInfo
