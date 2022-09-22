import 'firebase/compat/auth'
import 'firebase/compat/firestore'

import {
  Link,
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom'
import React, { useEffect, useState } from 'react'

import Routes from './Routes'
import firebase from 'firebase/compat/app'
import { logOut } from '../redux-helpers'
import { useDispatch } from 'react-redux'

function Signout() {
  const dispatch = useDispatch()
  const history = useHistory()

  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch(logOut())
        console.log('Signed out.')
        history.push('/')
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
