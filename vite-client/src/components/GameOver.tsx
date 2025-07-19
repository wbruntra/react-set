import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store' // Assuming RootState is defined in store.ts
import GameTimeline from './Stats/GameTimeline'

interface GameOverProps {
  gameOver: string | boolean | null // Can be winnerName (string), boolean (from Training), or null
  myName: string
  solo: boolean
  finalScore?: number // Optional for solo mode
  reset?: () => void // Optional for solo mode
  gameData?: {
    actions: Array<[number, number, 'h' | 'c']>
    totalTime?: number
    difficulty?: number
    playerWon?: number
  } // Game timeline data for solo mode
}

function GameOver(props: GameOverProps) {
  const { gameOver: winnerName, myName, solo, finalScore, reset, gameData } = props
  const userReducer = useSelector((state: RootState) => state.user)
  const { user } = userReducer

  // Convert game data for timeline if available
  const timelineEvents =
    gameData?.actions?.map(([sets, time, player]) => ({
      sets: Number(sets),
      time: Number(time),
      player: player as 'h' | 'c',
    })) || []

  const hasTimelineData = solo && gameData && gameData.actions && gameData.actions.length > 0

  return (
    <div className="game-over container mt-5">
      <div className="row justify-content-center bg-light-purple">
        <div className={hasTimelineData ? 'col-12 col-lg-10' : 'col col-md-6'}>
          <div className="card shadow p-3 m-2">
            <h3 className="text-center mb-3">GAME OVER!</h3>

            {hasTimelineData ? (
              // Show timeline for solo games with data
              <div className="mb-4">
                <div className="text-center mb-3">
                  <p className="mb-2">
                    Winner: <strong>{winnerName}</strong>
                  </p>
                  <p className="mb-3">
                    Final Score: <strong>{finalScore}</strong>
                  </p>
                </div>

                {/* Action buttons row */}
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <Link to="/" className="btn btn-outline-secondary">
                    Main Menu
                  </Link>
                  <button className="btn btn-primary" onClick={() => reset && reset()}>
                    Play Again
                  </button>
                </div>

                <GameTimeline
                  events={timelineEvents}
                  totalTime={gameData.totalTime || 0}
                  playerWon={gameData.playerWon || 0}
                  difficulty={gameData.difficulty || 1}
                  winningScore={finalScore || 0}
                />
              </div>
            ) : (
              // Original display for non-solo games or games without timeline data
              <>
                {!isNaN(finalScore as number) ? ( // Cast to number for isNaN
                  <div className="d-flex flex-column justify-content-center">
                    <p className="text-center my-2">Final Score: {finalScore} </p>
                  </div>
                ) : (
                  <p className="text-center mb-4">Winner: {winnerName} </p>
                )}

                {/* Action buttons row for non-timeline games */}
                <div className="d-flex justify-content-center gap-3 mb-3">
                  <Link to="/" className="btn btn-outline-secondary">
                    Main Menu
                  </Link>
                  <button className="btn btn-primary" onClick={() => reset && reset()}>
                    Play Again
                  </button>
                </div>
              </>
            )}

            {solo && user && user.uid && hasTimelineData && (
              <div className="text-center mt-3">
                <Link to="/stats" className="btn btn-outline-primary">
                  View All Stats
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameOver
