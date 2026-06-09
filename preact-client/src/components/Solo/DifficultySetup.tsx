import { GAME_CONFIG, calculateDynamicCPUInterval } from '@react-set/common'

interface DifficultySetupProps {
  difficulty: number
  onDifficultyChange: (difficulty: number) => void
  onStartGame: () => void
  onNavigateHome: () => void
}

export function DifficultySetup({
  difficulty,
  onDifficultyChange,
  onStartGame,
  onNavigateHome,
}: DifficultySetupProps) {
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

      <div class="text-center">
        <button class="btn btn-outline-secondary btn-sm me-2" onClick={onNavigateHome}>
          Main Menu
        </button>
        <button
          class="btn btn-outline-info btn-sm"
          onClick={() => {
            window.history.pushState({}, '', '/training')
            const evt = new CustomEvent('navigate-training')
            window.dispatchEvent(evt)
          }}
        >
          Training Mode
        </button>
      </div>
    </div>
  )
}
