import 'firebase/compat/auth'
import 'firebase/compat/firestore'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import firebase from 'firebase/compat/app'
import { useDispatch } from 'react-redux'
import { logOut } from '../features/user/userSlice'

function Signout() {
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

  return (
    <div className="my-3" style={{ cursor: 'pointer' }}>
      <p className="text-right text-white">
        <a className="btn btn-danger" onClick={signOut}>
          Sign Out
        </a>
      </p>
    </div>
  )
}

export default Signout
