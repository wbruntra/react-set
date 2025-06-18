import React from 'react'
import { handleGoogleSignIn } from '@/utils/helpers'
import { MessageCard } from './MessageCard'

/**
 * Component that prompts user to sign in with Google
 */
export const SignInPrompt: React.FC = () => (
  <MessageCard title="Sign In Required">
    <p className="mb-4">To host a game, sign in with your Google account.</p>
    <button onClick={handleGoogleSignIn} className="btn btn-info btn-lg">
      Sign in
    </button>
  </MessageCard>
)
