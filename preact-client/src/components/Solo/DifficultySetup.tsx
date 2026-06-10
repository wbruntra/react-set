import { useLocation, Link } from 'wouter-preact'
import { GAME_CONFIG, calculateDynamicCPUInterval } from '@react-set/common'
import { currentUser, handleGoogleSignIn } from '@/auth'

interface DifficultySetupProps {
  difficulty: number
  onDifficultyChange: (difficulty: number) => void
  onStartGame: () => void
}

export function DifficultySetup({
  difficulty,
  onDifficultyChange,
  onStartGame,
}: DifficultySetupProps) {
  const [, navigate] = useLocation()
  const isAnonymous = currentUser.value ? currentUser.value.isAnonymous : true

  return (
    <div class="container mt-3 mt-md-5 p-4">
      <h1 class="text-center mb-3 mb-md-5">Solo Play</h1>

      <div class="row justify-content-center mb-4">
        <div class="col-md-8 text-center">
          <h5 class="mb-3">CPU Difficulty</h5>
          <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
            <button
              class="btn btn-outline-primary btn-sm"
              onClick={() => onDifficultyChange(Math.max(1, difficulty - 1))}
              disabled={difficulty <= 1}
            >
              -
            </button>
            <span class="badge bg-purple px-3 py-2" style="font-size: 1.2rem">
              Level {difficulty}
            </span>
            <button
              class="btn btn-outline-primary btn-sm"
              onClick={() => onDifficultyChange(Math.min(8, difficulty + 1))}
              disabled={difficulty >= 8}
            >
              +
            </button>
          </div>
          <p class="text-muted small">Higher levels mean a faster, smarter CPU opponent</p>
        </div>
      </div>

      <div class="row justify-content-center mb-4">
        <div class="col-md-8 text-center">
          <h6 class="mb-2">CPU speed at this level:</h6>
          <p class="text-muted small">
            ~{Math.round(calculateDynamicCPUInterval(difficulty, 3) / 1000)}s when few sets, ~
            {Math.round(calculateDynamicCPUInterval(difficulty, 6) / 1000)}s when many sets
          </p>
        </div>
      </div>

      <div class="text-center mb-4">
        <button class="btn btn-primary btn-lg" onClick={onStartGame}>
          Start Game
        </button>
      </div>

      {isAnonymous && (
        <div class="row justify-content-center mb-4">
          <div class="col-md-8 col-lg-6">
            <div class="card p-3 text-center bg-dark border-info">
              <h5 class="card-title text-info mb-1">Save Your Progress</h5>
              <p class="text-muted small mb-2">
                Sign in with Google to track your stats and performance timelines!
              </p>
              <button
                onClick={() => handleGoogleSignIn().catch(console.error)}
                class="btn btn-info btn-sm mx-auto"
                style={{ maxWidth: '200px' }}
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      )}

      <div class="text-center">
        <button class="btn btn-outline-secondary btn-sm me-2" onClick={() => navigate('/')}>
          Main Menu
        </button>
        <Link href="/training" class="btn btn-outline-info btn-sm">
          Training Mode
        </Link>
      </div>
    </div>
  )
}
