import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleGoogleSignIn } from '../../utils/helpers'
import { GAME_CONFIG, DIFFICULTY_CONFIG } from './constants'
import {
  calculateCPUPerformanceTime,
  calculateDynamicCPUInterval,
  formatTimeString,
  getCPUPerformanceForSets,
} from './cpuPerformance'
import CPUAnalysisModal from './CPUAnalysisModal'
import UserInfo from '../UserInfo'

interface DifficultySetupProps {
  user: any
  difficulty: number
  onDifficultyChange: (difficulty: number) => void
  onStartGame: (e: React.FormEvent) => void
}

interface CPUPerformanceDisplayProps {
  difficulty: number
  onShowDetails: () => void
}

const CPUPerformanceDisplay: React.FC<CPUPerformanceDisplayProps> = ({
  difficulty,
  onShowDetails,
}) => {
  // Calculate timing for different scenarios to show adaptation
  const scenarios = [
    { sets: 1, label: 'Few' },
    { sets: 3, label: 'Normal' },
    { sets: 6, label: 'Many' },
  ]

  const timings = scenarios
    .map((scenario) => ({
      ...scenario,
      dynamicInterval: calculateDynamicCPUInterval(difficulty, scenario.sets),
      avgAttempts: getCPUPerformanceForSets(scenario.sets).averageAttempts,
    }))
    .map((scenario) => ({
      ...scenario,
      totalTime: Math.round((scenario.avgAttempts * scenario.dynamicInterval) / 1000),
    }))

  const normalTiming = timings.find((t) => t.sets === 3)!

  // Helper function to get difficulty description
  const getDifficultyDescription = (avgTime: number) => {
    if (avgTime <= 10) return { text: 'Very Fast', color: 'danger' }
    if (avgTime <= 20) return { text: 'Fast', color: 'warning' }
    if (avgTime <= 40) return { text: 'Moderate', color: 'info' }
    if (avgTime <= 60) return { text: 'Slow', color: 'secondary' }
    return { text: 'Very Slow', color: 'dark' }
  }

  const difficultyDesc = getDifficultyDescription(normalTiming.totalTime)

  return (
    <div className="mt-3 p-3 border rounded bg-light">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="text-center flex-grow-1">
          <div className="mb-2">
            <small className="text-muted">Adaptive CPU timing:</small>
          </div>
          <div className="text-center">
            <div className="d-flex d-md-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-1">
              <span className="fw-bold text-primary fs-5">
                {formatTimeString(normalTiming.totalTime)}
              </span>
              <span
                className={`badge bg-${difficultyDesc.color} fs-6`}
                title="CPU difficulty level - adapts to board conditions"
              >
                {difficultyDesc.text}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <div className="row text-center">
              {timings.map((timing) => (
                <div key={timing.sets} className="col-4">
                  <small className="text-muted d-block">{timing.label}</small>
                  <small className="fw-bold">{formatTimeString(timing.totalTime)}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={onShowDetails}
            className="btn btn-outline-info btn-sm"
            title="View detailed CPU performance analysis"
          >
            <i className="bi bi-graph-up me-1"></i>
            <span className="d-none d-sm-inline">Detailed Analysis</span>
            <span className="d-inline d-sm-none">Details</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const DifficultySetup: React.FC<DifficultySetupProps> = ({
  user,
  difficulty,
  onDifficultyChange,
  onStartGame,
}) => {
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  return (
    <div className="container main-content">
      <UserInfo user={user} />

      <div className="text-center mb-4">
        <h3 className="mb-3">Solo Play vs. Computer</h3>
        <h4 className="mb-4">Choose difficulty level:</h4>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <form onSubmit={onStartGame} className="mb-4">
            <div className="mb-4">
              <input
                type="range"
                min={DIFFICULTY_CONFIG.min}
                max={DIFFICULTY_CONFIG.max}
                step={DIFFICULTY_CONFIG.step}
                value={difficulty}
                onChange={(e) => onDifficultyChange(Number(e.target.value))}
                className="form-range"
              />
              <div className="text-center mt-2">
                <span className="badge bg-primary fs-6">Difficulty: {difficulty}</span>
              </div>

              {/* Adaptive CPU Performance Display */}
              <CPUPerformanceDisplay
                difficulty={difficulty}
                onShowDetails={() => setShowAnalysisModal(true)}
              />
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-primary btn-lg px-5">
                Start Game
              </button>
              <p className="mt-3 text-muted">
                First to {GAME_CONFIG.playingTo} points is the winner
              </p>
            </div>
          </form>

          <GameModeLinks />
        </div>
      </div>

      {(!user || !user.uid) && <AuthenticationSection />}

      {/* CPU Analysis Modal */}
      <CPUAnalysisModal
        currentDifficulty={difficulty}
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />
    </div>
  )
}

const GameModeLinks: React.FC = () => (
  <div className="mt-5">
    <h5 className="mb-3 text-center">Other Game Options</h5>
    <div className="row">
      <div className="col-md-6">
        <div className="d-grid gap-2">
          <Link to="/local" className="btn btn-outline-primary">
            Local Multiplayer
          </Link>
          <Link to="/training" className="btn btn-outline-primary">
            Training Mode
          </Link>
        </div>
      </div>
    </div>
    <hr className="my-4" />
    <div className="text-center">
      <Link to="/" className="btn btn-outline-secondary">
        ← Back to Main Menu
      </Link>
    </div>
  </div>
)

const AuthenticationSection: React.FC = () => (
  <div className="row justify-content-center mt-5">
    <div className="col-12 col-md-8">
      <div className="card border-info">
        <div className="card-body text-center">
          <h5 className="card-title">Save Your Progress</h5>
          <p className="card-text">
            Sign in with your Google account to track your game statistics and progress.
          </p>
          <button
            onClick={() => {
              const result = handleGoogleSignIn()
              if (result && typeof result.catch === 'function') {
                result.catch(console.error)
              }
            }}
            className="btn btn-info btn-lg"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  </div>
)

export default DifficultySetup
