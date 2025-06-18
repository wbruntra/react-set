import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebaseConfig'
import { getRedirectResult } from 'firebase/auth'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔄 AuthCallback component mounted')

    getRedirectResult(auth)
      .then((result) => {
        console.log('🔄 AuthCallback redirect result:', result)

        if (result.user) {
          console.log('✅ AuthCallback redirect successful:', result.user.displayName)
          // Redirect to the original page or default page
          const returnUrl = localStorage.getItem('preRedirectUrl') || '/solo'
          navigate(returnUrl, { replace: true })
        } else {
          console.log('ℹ️ AuthCallback: No user in redirect result')
          navigate('/solo', { replace: true })
        }
      })
      .catch((error) => {
        console.error('❌ AuthCallback redirect error:', error)
        navigate('/solo', { replace: true })
      })
  }, [navigate])

  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Completing sign-in...</p>
      </div>
    </div>
  )
}

export default AuthCallback
