import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { auth } from '../firebaseConfig'
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'

import { updateUser } from '../features/user/userSlice'
import { debugFirebaseAuth, diagnoseRedirectIssues } from '../utils/helpers'

// Firebase is already initialized in firebaseConfig.ts

// Global flag to ensure getRedirectResult is only called once
const redirectResultChecked = false

function Layout() {
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('Layout: Starting authentication setup')
    console.log('Layout: Current URL:', window.location.href)
    console.log('Layout: URL search params:', window.location.search)
    console.log('Layout: URL hash:', window.location.hash)
    console.log('Layout: redirectResultChecked flag:', redirectResultChecked)

    // Check if we're returning from a redirect
    const redirectInitiated = localStorage.getItem('redirectInitiated')
    const preRedirectUrl = localStorage.getItem('preRedirectUrl')

    if (redirectInitiated) {
      const timeElapsed = Date.now() - parseInt(redirectInitiated)
      console.log('🔍 Redirect was initiated', timeElapsed, 'ms ago')
      console.log('🔍 Pre-redirect URL was:', preRedirectUrl)
      console.log('🔍 Current URL is:', window.location.href)

      // Clean up the stored values
      localStorage.removeItem('redirectInitiated')
      localStorage.removeItem('preRedirectUrl')
    } else {
      console.log('🔍 No redirect initiation detected')
    }

    // Set persistence to LOCAL to ensure authentication persists across sessions
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Auth persistence set to LOCAL')
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error)
      })

    // Handle redirect result from Google sign-in - use stored result from main.tsx
    if (window.redirectResult !== undefined) {
      console.log('🔍 Using stored redirect result:', window.redirectResult)
      const result = window.redirectResult

      if (result && result.user) {
        console.log('✅ Sign-in redirect successful:', result.user.displayName)
        console.log('✅ User UID:', result.user.uid)
        console.log('✅ User email:', result.user.email)
      } else {
        console.log('ℹ️ No redirect result from stored data')
      }

      // Clear the stored result
      window.redirectResult = undefined
    } else {
      console.log('🔍 No stored redirect result available')
    }

    // Also call debug function if we detected a redirect
    if (redirectInitiated) {
      console.log('🔍 Running Firebase auth debug...')
      diagnoseRedirectIssues()
        .then((result) => {
          console.log('🔍 Diagnosis result:', result)
        })
        .catch((error) => {
          console.error('🔍 Diagnosis error:', error)
        })
    }

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
