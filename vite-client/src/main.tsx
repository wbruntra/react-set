import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './styles/main.scss'

// Initialize Firebase before everything else
import { auth } from './firebaseConfig'

import App from './App.tsx'
import { store } from './store'

async function initializeApp() {
  console.log('🔄 Initializing app...')

  try {
    // Wait a moment for Firebase to initialize properly
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Clean up any old redirect-related localStorage items
    localStorage.removeItem('redirectInitiated')
    localStorage.removeItem('preRedirectUrl')
    localStorage.removeItem('authError')

    console.log('🔄 Current auth user:', auth.currentUser)
    console.log('🔄 Firebase initialized and ready')
  } catch (error) {
    console.error('❌ App initialization error:', error)
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

initializeApp()
