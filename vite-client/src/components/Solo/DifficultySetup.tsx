import React from 'react'
import { Link } from 'react-router-dom'
import { handleGoogleSignIn, handleGoogleRedirect, handleGooglePopup } from '../../utils/helpers'
import { GAME_CONFIG, DIFFICULTY_CONFIG } from './constants'
import Signout from '../Signout'

interface DifficultySetupProps {
  user: any
  difficulty: number
  onDifficultyChange: (difficulty: number) => void
  onStartGame: (e: React.FormEvent) => void
}

const DifficultySetup: React.FC<DifficultySetupProps> = ({
  user,
  difficulty,
  onDifficultyChange,
  onStartGame,
}) => {
  return (
    <div className="container main-content">
      {user && user.uid ? <Signout /> : null}

      <h3 className="text-center mb-4">Solo Play vs. Computer</h3>
      <h4 className="mb-4">Choose difficulty level:</h4>

      <div className="row">
        <div className="col-12">
          <form onSubmit={onStartGame}>
            <div className="col-10 col-md-6 mb-5">
              <input
                type="range"
                min={DIFFICULTY_CONFIG.min}
                max={DIFFICULTY_CONFIG.max}
                step={DIFFICULTY_CONFIG.step}
                value={difficulty}
                onChange={(e) => onDifficultyChange(Number(e.target.value))}
                className="form-range"
              />
              <p>Difficulty: {difficulty}</p>
            </div>
            <input type="submit" value="Start" className="btn btn-primary" />
          </form>
          <p style={{ marginTop: '24px' }}>
            First to {GAME_CONFIG.playingTo} points is the winner
          </p>
        </div>

        <GameModeLinks />
      </div>

      {(!user || !user.uid) && <AuthenticationSection />}
    </div>
  )
}

const GameModeLinks: React.FC = () => (
  <div className="row mt-4">
    <p>Other Game Options:</p>
    <ul style={{ listStyleType: 'none' }}>
      <li className="mb-4">
        <Link to="/local">Local Multiplayer</Link>
      </li>
      <li className="mb-4">
        <Link to="/training">Training</Link>
      </li>
      <hr />
      <li>
        <Link to="/">Back to Main Menu</Link>
      </li>
    </ul>
  </div>
)

const AuthenticationSection: React.FC = () => (
  <div className="row mt-4">
    <div>
      <p>To save your game statistics, sign in with your Google account.</p>
      <p>
        <button
          onClick={() => {
            const result = handleGoogleSignIn()
            if (result && typeof result.catch === 'function') {
              result.catch(console.error)
            }
          }}
          className="btn btn-info me-2"
        >
          Sign in with Google
        </button>
      </p>
      <details>
        <summary>Advanced options</summary>
        <div className="mt-2">
          <button onClick={handleGoogleRedirect} className="btn btn-outline-secondary btn-sm me-2">
            Force Redirect
          </button>
          <button
            onClick={() => {
              handleGooglePopup().catch(console.error)
            }}
            className="btn btn-outline-success btn-sm"
          >
            Force Popup
          </button>
        </div>
      </details>
    </div>
  </div>
)

export default DifficultySetup
