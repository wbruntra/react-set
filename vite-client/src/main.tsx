import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './styles/main.scss'

// Initialize Firebase before everything else
import './firestore'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

import App from './App.tsx'
import { store } from './store'

async function initializeApp() {
  console.log('🔄 Initializing app and checking for redirect result...')

  try {
    // Check for redirect result immediately on page load
    const result = await firebase.auth().getRedirectResult()
    console.log('🔄 Main.tsx redirect result:', result)

    if (result && result.user) {
      console.log('✅ Main.tsx redirect successful:', result.user.displayName)
      // Store the result so Layout can access it
      window.redirectResult = result
    } else {
      console.log('ℹ️ Main.tsx: No redirect result')
      window.redirectResult = null
    }
  } catch (error) {
    console.error('❌ Main.tsx redirect error:', error)
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
