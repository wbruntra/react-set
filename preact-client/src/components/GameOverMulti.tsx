import { GAME_CONFIG } from '@react-set/common'

interface PlayerInfo {
  name: string
  score: number
  color: string
}

interface GameOverMultiProps {
  winner: string
  players: Record<string, PlayerInfo>
  isHost: boolean
  onPlayAgain?: () => void
  onMainMenu: () => void
}

export function GameOverMulti({
  winner,
  players,
  isHost,
  onPlayAgain,
  onMainMenu,
}: GameOverMultiProps) {
  const playersArray = Object.entries(players).map(([, info]) => info)

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4 text-center">
      <h2 class="mb-2">{winner} Wins!</h2>
      <p class="text-muted small mb-4">First to {GAME_CONFIG.playingTo} points wins</p>

      <div class="row justify-content-center mb-4">
        <div class="col-md-6">
          {playersArray
            .sort((a, b) => b.score - a.score)
            .map((p) => (
              <div key={p.name} class="card mb-2" style="padding: 12px 20px">
                <div class="d-flex justify-content-between align-items-center">
                  <span style={`color: ${p.color}; font-weight: 600`}>{p.name}</span>
                  <span class="mono-font" style="font-size: 1.2rem">
                    {p.score}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div class="d-flex justify-content-center gap-3">
        {isHost && onPlayAgain && (
          <button class="btn btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
        )}
        <button class="btn btn-secondary" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
    </div>
  )
}
