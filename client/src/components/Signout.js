import React, { useState, useEffect } from 'react'
import Routes from './Routes'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/auth'
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
    <div style={{ marginBottom: '16px' }}>
      <p className="right-align">
        <a onClick={signOut}>Sign Out</a>
      </p>
    </div>
  )
}

export default Signout
