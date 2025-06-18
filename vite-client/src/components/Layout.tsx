import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { auth } from '../firebaseConfig'
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'

import { updateUser } from '../features/user/userSlice'

// Firebase is already initialized in firebaseConfig.ts

function Layout() {
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('Layout: Starting authentication setup')
    console.log('Layout: Current URL:', window.location.href)

    // Set persistence to LOCAL to ensure authentication persists across sessions
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Auth persistence set to LOCAL')
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error)
      })

    // Check for existing guest user in localStorage before Firebase auth
    const storedGuestUser = localStorage.getItem('guestUser')
    if (storedGuestUser) {
      try {
        const guestUser = JSON.parse(storedGuestUser)
        console.log('🔍 Found stored guest user:', guestUser.nickname)
        dispatch(updateUser({ loading: false, user: guestUser }))
      } catch (error) {
        console.error('Error parsing stored guest user:', error)
        localStorage.removeItem('guestUser')
      }
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 Auth state changed:', user ? `${user.displayName} (${user.uid})` : 'No user')

      if (user) {
        console.log('User authenticated, updating Redux store')

        // If user is authenticated with Google/etc, clear any guest data
        if (!user.isAnonymous) {
          localStorage.removeItem('guestUser')
        }

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

        // Try to register/check user with API - this might fail in development
        axios
          .get(`/api/user/${user.uid}`)
          .then((result) => {
            console.log('User is registered')
          })
          .catch((err) => {
            console.log('API call failed (expected in development):', err.message)
            if (err.response && err.response.status === 404) {
              console.log('User not registered, attempting to register...')
              axios
                .post('/api/user', {
                  uid: user.uid,
                  info: myUser,
                })
                .then(() => {
                  console.log('User registered successfully')
                })
                .catch((err) => {
                  console.log('Error registering user (expected in development):', err.message)
                })
            } else {
              console.log('API error (expected in development):', err.message)
            }
          })
      } else {
        console.log('🔥 No user authenticated')
        dispatch(updateUser({ loading: false, user: null }))
      }
    })

    // Return cleanup function
    return () => {
      unsubscribe()
    }
  }, [dispatch])

  return (
    <div>
      {/* You can add common layout elements here, like a header or footer */}
      <Outlet /> {/* This is where nested routes will be rendered */}
    </div>
  )
}

export default Layout
