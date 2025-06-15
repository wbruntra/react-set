import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

import { updateUser } from '../features/user/userSlice' // Assuming updateNickname is not used directly here

function Layout() {
  const dispatch = useDispatch()

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const nickname = window.localStorage.getItem('nickname') || user.displayName?.split(' ')[0]
        const myUser = {
          displayName: user.displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
          uid: user.uid,
          providerData: user.providerData,
          nickname,
        }
        dispatch(updateUser({ loading: false, user: myUser }))
        axios
          .get(`/api/user/${user.uid}`)
          .then((result) => {
            console.log('User is registered')
          })
          .catch((err) => {
            if (err.response && err.response.status === 404) {
              console.log('User not registered')
              axios
                .post('/api/user', {
                  uid: user.uid,
                  info: myUser,
                })
                .then(() => {
                  console.log('User registered successfully')
                })
                .catch((err) => {
                  console.log('Error registering user', err)
                })
            } else {
              console.log('An error occurred trying to GET user info')
            }
          })
      } else {
        console.log('Not signed in')
        dispatch(updateUser({ loading: false, user: null }))
      }
    })
  }, [dispatch]) // Add dispatch to dependency array

  return (
    <div>
      {/* You can add common layout elements here, like a header or footer */}
      <Outlet /> {/* This is where nested routes will be rendered */}
    </div>
  )
}

export default Layout
