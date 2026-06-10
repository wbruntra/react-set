import { GAME_CONFIG } from '@react-set/common'
import type { Players } from './gameState'
import { GameTimeline } from '../Stats/GameTimeline'
import { getUserId } from '@/auth'

interface SoloGameOverProps {
  winner: string | null
  players: Players
  onReset: () => void
  onMainMenu: () => void
  difficulty: number
  startTime: Date
  actions: Array<[number, number, 'h' | 'c']>
}

export function SoloGameOver({
  winner,
  players,
  onReset,
  onMainMenu,
  difficulty,
  startTime,
  actions,
}: SoloGameOverProps) {
  const isYou = winner === 'you'
  const playerScore = players.you?.score ?? 0
  const cpuScore = players.cpu?.score ?? 0
  const uid = getUserId()

  // Convert actions data to timeline events format
  const timelineEvents = actions.map(([sets, time, player]) => ({
    sets: Number(sets),
    time: Number(time),
    player: player as 'h' | 'c',
  }))

  const playerWon = winner === 'you' ? 1 : 0
  const totalTime = Math.round((Date.now() - startTime.getTime()) / 1000)
  const winningScore = players[winner ?? 'you']?.score ?? 0

  return (
    <div class="container bg-light-purple mt-3 mt-md-5 p-4 text-center">
      <h2 class="mb-4">{isYou ? '🎉 You Won!' : '🤖 CPU Wins!'}</h2>

      <div class="row justify-content-center mb-4">
        <div class="col-md-6 col-lg-5">
          <div class="card mb-3 p-3 bg-dark">
            <h5 class={isYou ? 'text-success' : 'text-white'}>You: {playerScore}</h5>
            <p class="text-muted small mb-0">First to {GAME_CONFIG.playingTo} wins</p>
          </div>
        </div>
        <div class="col-md-6 col-lg-5">
          <div class="card mb-3 p-3 bg-dark">
            <h5 class={!isYou ? 'text-danger' : 'text-white'}>CPU: {cpuScore}</h5>
            <p class="text-muted small mb-0">First to {GAME_CONFIG.playingTo} wins</p>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-3 mb-4">
        <button class="btn btn-primary" onClick={onReset}>
          Play Again
        </button>
        <button class="btn btn-secondary" onClick={onMainMenu}>
          Main Menu
        </button>
        {uid && (
          <a href="#/stats" class="btn btn-outline-primary">
            View All Stats
          </a>
        )}
      </div>

      {timelineEvents.length > 0 && (
        <div class="row justify-content-center mt-4 text-start">
          <div class="col-12 col-lg-10">
            <GameTimeline
              events={timelineEvents}
              totalTime={totalTime}
              playerWon={playerWon}
              difficulty={difficulty}
              winningScore={winningScore}
            />
          </div>
        </div>
      )}
    </div>
  )
}
