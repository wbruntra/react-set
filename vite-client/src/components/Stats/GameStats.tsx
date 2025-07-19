import React from 'react'
import { Link } from 'react-router-dom'
import GameTimeline from './GameTimeline'

const GameStats: React.FC = () => {
  // Test data as provided
  let testData = {
    uid: 'test-user-123',
    total_time: 120, // 2 minutes
    player_won: 1, // human won
    difficulty_level: 5,
    winning_score: 12,
    data: {
      actions: [
        [4, 9.8, 'h'], // 4 sets on board, 9.8 seconds, human found it
        [3, 15.2, 'c'], // 3 sets on board, 15.2 seconds, computer found it
        [5, 7.1, 'h'], // 5 sets on board, 7.1 seconds, human found it
        [2, 22.5, 'c'], // 2 sets on board, 22.5 seconds, computer found it
      ],
    },
  }

  testData = {
    total_time: 135,
    player_won: 1,
    difficulty_level: 3,
    winning_score: 6,
    uid: '1sGkH0ebN1TF9Wk9cB3m3BoB2s72',
    data: JSON.parse(
      '{"actions":[[2,13.5,"c"],[5,4.3,"h"],[4,2.5,"h"],[2,13.5,"c"],[1,5.4,"h"],[3,19.4,"h"],[3,6.2,"h"],[1,34.3,"c"],[2,8.1,"h"]]}',
    ),
  }

  // Convert the action data to the format expected by GameTimeline
  const timelineEvents = testData.data.actions.map(([sets, time, player]) => ({
    sets: Number(sets),
    time: Number(time),
    player: player as 'h' | 'c',
  }))

  return (
    <div className="container main-content">
      <div className="text-center mb-4">
        <h2>Game Statistics</h2>
        <p className="text-muted">Detailed analysis of your solo game performance</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12">
          <GameTimeline
            events={timelineEvents}
            totalTime={testData.total_time}
            playerWon={testData.player_won}
            difficulty={testData.difficulty_level}
            winningScore={testData.winning_score}
          />
        </div>
      </div>

      {/* Game Summary Statistics */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Performance Summary</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 text-success mb-0">
                      {timelineEvents.filter((e) => e.player === 'h').length}
                    </div>
                    <small className="text-muted">Sets Found by You</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 text-danger mb-0">
                      {timelineEvents.filter((e) => e.player === 'c').length}
                    </div>
                    <small className="text-muted">Sets Found by Computer</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Response Times</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 text-info mb-0">
                      {(
                        timelineEvents
                          .filter((e) => e.player === 'h')
                          .reduce((sum, e) => sum + e.time, 0) /
                        timelineEvents.filter((e) => e.player === 'h').length
                      ).toFixed(1)}
                      s
                    </div>
                    <small className="text-muted">Your Avg Time</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div className="h4 text-warning mb-0">
                      {(
                        timelineEvents
                          .filter((e) => e.player === 'c')
                          .reduce((sum, e) => sum + e.time, 0) /
                        timelineEvents.filter((e) => e.player === 'c').length
                      ).toFixed(1)}
                      s
                    </div>
                    <small className="text-muted">Computer Avg Time</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="text-center mt-5">
        <div className="d-flex justify-content-center gap-3">
          <Link to="/stats" className="btn btn-outline-primary">
            ← Back to All Stats
          </Link>
          <Link to="/solo" className="btn btn-primary">
            Play Another Game
          </Link>
        </div>
      </div>
    </div>
  )
}

export default GameStats
