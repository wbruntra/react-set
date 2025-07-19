import React from 'react'

interface TimelineEvent {
  sets: number
  time: number
  player: 'h' | 'c' // human or computer
}

interface GameTimelineProps {
  events: TimelineEvent[]
  totalTime: number
  playerWon: number
  difficulty: number
  winningScore: number
}

const GameTimeline: React.FC<GameTimelineProps> = ({
  events,
  totalTime,
  playerWon,
  difficulty,
  winningScore,
}) => {
  // Calculate cumulative times for positioning
  const cumulativeEvents = events.reduce(
    (acc, event, index) => {
      const cumulativeTime = index === 0 ? event.time : acc[index - 1].cumulativeTime + event.time
      acc.push({
        ...event,
        cumulativeTime,
        index,
      })
      return acc
    },
    [] as Array<TimelineEvent & { cumulativeTime: number; index: number }>,
  )

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`
  }

  const getPlayerLabel = (player: 'h' | 'c') => {
    return player === 'h' ? 'Human' : 'Computer'
  }

  const getPlayerColor = (player: 'h' | 'c') => {
    return player === 'h' ? 'bg-success' : 'bg-danger'
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Game Timeline</h5>
        <div className="row mt-2">
          <div className="col-md-3">
            <small className="text-muted">Total Time:</small>
            <div className="fw-bold">{formatTime(totalTime)}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Difficulty:</small>
            <div className="fw-bold">{difficulty}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Winner:</small>
            <div className="fw-bold">{playerWon === 1 ? 'Human' : 'Computer'}</div>
          </div>
          <div className="col-md-3">
            <small className="text-muted">Final Score:</small>
            <div className="fw-bold">{winningScore}</div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-center">
          <div className="position-relative" style={{ width: '100%', maxWidth: '600px' }}>
            {/* Vertical timeline line */}
            <div
              className="position-absolute bg-secondary"
              style={{
                left: '50%',
                top: '20px',
                bottom: '20px',
                width: '3px',
                transform: 'translateX(-50%)',
              }}
            />

            {/* Start marker */}
            <div
              className="d-flex justify-content-center mb-3"
              style={{ position: 'relative', zIndex: 3 }}
            >
              <div className="text-center">
                <div className="badge bg-dark px-3 py-2">Game Start</div>
                <div className="small text-muted mt-1">0:00</div>
              </div>
            </div>

            {/* Timeline events */}
            {cumulativeEvents.map((event, index) => {
              const isLeftSide = index % 2 === 0

              return (
                <div
                  key={index}
                  className="d-flex align-items-center mb-4"
                  style={{ minHeight: '80px' }}
                >
                  {/* Left side content */}
                  <div className="flex-fill" style={{ textAlign: isLeftSide ? 'right' : 'left' }}>
                    {isLeftSide && (
                      <div
                        className="card border-0 shadow-sm me-3"
                        style={{ maxWidth: '250px', marginLeft: 'auto' }}
                      >
                        <div className="card-body p-3">
                          <div className={`badge ${getPlayerColor(event.player)} mb-2`}>
                            {getPlayerLabel(event.player)}
                          </div>
                          <div className="fw-bold mb-1">{formatTime(event.time)} to find set</div>
                          <div className="small text-muted">
                            {event.sets} sets available on board
                          </div>
                          <div className="small text-muted mt-1">
                            @ {formatTime(event.cumulativeTime)} total
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Center marker */}
                  <div className="position-relative">
                    <div
                      className={`rounded-circle ${getPlayerColor(event.player)} d-flex align-items-center justify-content-center`}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 2,
                      }}
                    >
                      <span className="text-white fw-bold" style={{ fontSize: '10px' }}>
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Right side content */}
                  <div className="flex-fill">
                    {!isLeftSide && (
                      <div className="card border-0 shadow-sm ms-3" style={{ maxWidth: '250px' }}>
                        <div className="card-body p-3">
                          <div className={`badge ${getPlayerColor(event.player)} mb-2`}>
                            {getPlayerLabel(event.player)}
                          </div>
                          <div className="fw-bold mb-1">{formatTime(event.time)} to find set</div>
                          <div className="small text-muted">
                            {event.sets} sets available on board
                          </div>
                          <div className="small text-muted mt-1">
                            @ {formatTime(event.cumulativeTime)} total
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* End marker */}
            <div
              className="d-flex justify-content-center mt-3"
              style={{ position: 'relative', zIndex: 3 }}
            >
              <div className="text-center">
                <div className="badge bg-dark px-3 py-2">Game End</div>
                <div className="small text-muted mt-1">{formatTime(totalTime)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 d-flex justify-content-center gap-4">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-success"
              style={{ width: '12px', height: '12px' }}
            ></div>
            <small>Human Found Set</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-danger"
              style={{ width: '12px', height: '12px' }}
            ></div>
            <small>Computer Found Set</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameTimeline
