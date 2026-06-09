import { GAME_CONFIG } from '@react-set/common'
import type { Players } from './gameState'

interface SoloGameOverProps {
  winner: string | null
  players: Players
  onReset: () => void
  onMainMenu: () => void
}

export function SoloGameOver({ winner, players, onReset, onMainMenu }: SoloGameOverProps) {
  const isYou = winner === 'you'
  const playerScore = players.you?.score ?? 0
  const cpuScore = players.cpu?.score ?? 0

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4 text-center">
      <h2 class="mb-4">{isYou ? 'You Won!' : 'CPU Wins!'}</h2>

      <div class="row justify-content-center mb-4">
        <div class="col-md-6">
          <div class="card mb-3" style="padding: 20px">
            <h5 class={isYou ? 'text-success' : ''}>You: {playerScore}</h5>
            <p class="text-muted small">First to {GAME_CONFIG.playingTo} wins</p>
          </div>
          <div class="card" style="padding: 20px">
            <h5 class={!isYou ? 'text-danger' : ''}>CPU: {cpuScore}</h5>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-3">
        <button class="btn btn-primary" onClick={onReset}>
          Play Again
        </button>
        <button class="btn btn-secondary" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
    </div>
  )
}
