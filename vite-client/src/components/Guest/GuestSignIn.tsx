import React from 'react'
import { Link } from 'react-router-dom'
import { handleGoogleSignIn as googleSignIn } from '../../utils/helpers'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../features/user/userSlice'

interface GuestSignInProps {
  onGuestJoin: (nickname: string) => void
}

/**
 * Component that allows users to join as guest or sign in with Google
 */
export const GuestSignIn: React.FC<GuestSignInProps> = ({ onGuestJoin }) => {
  const dispatch = useDispatch()

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const nameInput = form.nickname.value

    if (!nameInput.trim()) {
      return
    }

    // Create an anonymous user object for the guest
    const guestUser = {
      uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nickname: nameInput,
      displayName: nameInput,
      isGuest: true,
    }

    // Store guest user in localStorage for persistence
    localStorage.setItem('guestUser', JSON.stringify(guestUser))
    localStorage.setItem('nickname', nameInput)

    dispatch(updateUser({ user: guestUser, loading: false }))
    onGuestJoin(nameInput)
  }

  const handleGoogleSignInClick = () => {
    // Clear guest data before signing in with Google auth
    localStorage.removeItem('guestUser')
    googleSignIn()
  }

  return (
    <div className="container">
      <h4 className="mb-3">Join as guest:</h4>
      <form onSubmit={handleGuestSubmit}>
        <div className="col-12 col-md-4">
          <input
            autoFocus
            type="text"
            name="nickname"
            placeholder="Enter your nickname"
            required
          />
        </div>
        <div className="col-12 col-md-4">
          <input className="btn btn-primary mt-3 ml-md-3" type="submit" value="Join as Guest" />
        </div>
      </form>

      <hr className="my-4" />

      <p>Or sign in with your Google account for a persistent profile:</p>
      <p>
        <button onClick={handleGoogleSignInClick} className="btn btn-outline-info">
          Sign in with Google
        </button>
      </p>
      <p>
        <Link to="/lobby">Back</Link>
      </p>
    </div>
  )
}
