import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './styles/main.scss'

// Initialize Firebase before everything else
import { auth } from './firebaseConfig'
import { getRedirectResult } from 'firebase/auth'

import App from './App.tsx'
import { store } from './store'

async function initializeApp() {
  console.log('🔄 Initializing app and checking for redirect result...')

  try {
    // Wait a moment for Firebase to initialize properly
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Check the auth state first
    const currentUser = auth.currentUser
    console.log('🔄 Current auth user before getRedirectResult:', currentUser)

    // Check for redirect result immediately on page load
    const result = await getRedirectResult(auth)
    console.log('🔄 Main.tsx redirect result:', result)
    console.log('🔄 Redirect result details:', {
      user: result?.user,
      operationType: result?.operationType,
      providerId: result?.providerId,
    })

    if (result && result.user) {
      console.log('✅ Main.tsx redirect successful:', result.user.displayName)
      console.log('✅ User UID:', result.user.uid)
      console.log('✅ User email:', result.user.email)
      console.log('✅ User provider data:', result.user.providerData)
      // Store the result so Layout can access it
      window.redirectResult = result
    } else if (result && result.user === null) {
      console.log('ℹ️ Main.tsx: Redirect result exists but no user/credential')
      console.log('ℹ️ This might indicate a configuration issue with Firebase Auth')
      console.log('ℹ️ Check Firebase Console for authorized domains and OAuth configuration')
      window.redirectResult = result
    } else {
      console.log('ℹ️ Main.tsx: No redirect result')
      window.redirectResult = null
    }

    // Check auth state again after redirect processing
    const currentUserAfter = auth.currentUser
    console.log('🔄 Current auth user after getRedirectResult:', currentUserAfter)
  } catch (error) {
    console.error('❌ Main.tsx redirect error:', error)
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      email: error.email,
      credential: error.credential,
    })
    window.redirectResult = null
  }

  // Now start the React app
  createRoot(document.getElementById('root')!).render(
    // <StrictMode> - Temporarily disabled to test Firebase redirect
    <Provider store={store}>
      <App />
    </Provider>,
    // </StrictMode>,
  )
}

// Add type declaration for the global variable
declare global {
  interface Window {
    redirectResult: any
  }
}

initializeApp()
