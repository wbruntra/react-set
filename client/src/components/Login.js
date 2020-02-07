import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Signout from './Signout'
import { handleGoogleRedirect } from '../utils/helpers'
import * as firebase from 'firebase/app'
import 'firebase/auth'

function Login(props) {
  const user = useSelector((state) => state.user)

  useEffect(() => {
    firebase
      .auth()
      .getRedirectResult()
      .then(function(result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken
          // ...
        }
        // The signed-in user info.
        var user = result.user
        console.log(token, user)
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message
        // The email of the user's account used.
        var email = error.email
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential
        // ...
      })
  }, [])

  if (!user) {
    return (
      <div className="container">
        <button onClick={handleGoogleRedirect} className="btn">
          Sign in
        </button>
      </div>
    )
  }
  return (
    <div className="container">
      <Signout />
    </div>
  )
}

export default Login
