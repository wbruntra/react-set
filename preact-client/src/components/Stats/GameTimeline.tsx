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

export function GameTimeline({
  events,
  totalTime,
  playerWon,
  difficulty,
  winningScore,
}: GameTimelineProps) {
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
    <div class="card p-4">
      <div class="mb-4">
        <h5 class="mb-3">Game Timeline</h5>
        <div class="row g-3">
          <div class="col-6 col-md-3">
            <small class="text-muted d-block">Total Time:</small>
            <div class="fw-bold fs-5">{formatTime(totalTime)}</div>
          </div>
          <div class="col-6 col-md-3">
            <small class="text-muted d-block">Difficulty:</small>
            <div class="fw-bold fs-5">{difficulty}</div>
          </div>
          <div class="col-6 col-md-3">
            <small class="text-muted d-block">Winner:</small>
            <div class={`fw-bold fs-5 ${playerWon === 1 ? 'text-success' : 'text-danger'}`}>
              {playerWon === 1 ? 'Human' : 'Computer'}
            </div>
          </div>
          <div class="col-6 col-md-3">
            <small class="text-muted d-block">Final Score:</small>
            <div class="fw-bold fs-5">{winningScore}</div>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="d-flex justify-content-center">
          <div class="position-relative w-100" style={{ maxWidth: '600px', padding: '20px 0' }}>
            {/* Vertical timeline line */}
            <div
              class="position-absolute bg-secondary"
              style={{
                left: '50%',
                top: '40px',
                bottom: '40px',
                width: '3px',
                transform: 'translateX(-50%)',
                opacity: 0.3,
              }}
            />

            {/* Start marker */}
            <div
              class="d-flex justify-content-center mb-4"
              style={{ position: 'relative', zIndex: 3 }}
            >
              <div class="text-center">
                <div class="badge bg-dark px-3 py-2 border border-secondary">Game Start</div>
                <div class="small text-muted mt-1">0:00</div>
              </div>
            </div>

            {/* Timeline events */}
            {cumulativeEvents.map((event, index) => {
              const isLeftSide = index % 2 === 0

              return (
                <div
                  key={index}
                  class="d-flex align-items-center mb-4"
                  style={{ minHeight: '80px', position: 'relative' }}
                >
                  {/* Left side content */}
                  <div
                    class="flex-fill"
                    style={{ textAlign: isLeftSide ? 'right' : 'left', width: '45%' }}
                  >
                    {isLeftSide && (
                      <div
                        class="card border-0 shadow-sm me-3 bg-dark p-3"
                        style={{ maxWidth: '250px', marginLeft: 'auto' }}
                      >
                        <div class={`badge ${getPlayerColor(event.player)} mb-2`}>
                          {getPlayerLabel(event.player)}
                        </div>
                        <div class="fw-bold mb-1 text-white">
                          {formatTime(event.time)} to find set
                        </div>
                        <div class="small text-muted">{event.sets} sets available on board</div>
                        <div class="small text-muted mt-1">
                          @ {formatTime(event.cumulativeTime)} total
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Center marker */}
                  <div class="position-relative" style={{ zIndex: 5 }}>
                    <div
                      class={`rounded-circle ${getPlayerColor(event.player)} d-flex align-items-center justify-content-center`}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '3px solid #080410',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      <span class="text-white fw-bold" style={{ fontSize: '11px' }}>
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Right side content */}
                  <div class="flex-fill" style={{ width: '45%' }}>
                    {!isLeftSide && (
                      <div
                        class="card border-0 shadow-sm ms-3 bg-dark p-3"
                        style={{ maxWidth: '250px' }}
                      >
                        <div class={`badge ${getPlayerColor(event.player)} mb-2`}>
                          {getPlayerLabel(event.player)}
                        </div>
                        <div class="fw-bold mb-1 text-white">
                          {formatTime(event.time)} to find set
                        </div>
                        <div class="small text-muted">{event.sets} sets available on board</div>
                        <div class="small text-muted mt-1">
                          @ {formatTime(event.cumulativeTime)} total
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* End marker */}
            <div
              class="d-flex justify-content-center mt-4"
              style={{ position: 'relative', zIndex: 3 }}
            >
              <div class="text-center">
                <div class="badge bg-dark px-3 py-2 border border-secondary">Game End</div>
                <div class="small text-muted mt-1">{formatTime(totalTime)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div class="mt-4 d-flex justify-content-center gap-4">
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-success" style={{ width: '12px', height: '12px' }}></div>
            <small class="text-white">Human Found Set</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-danger" style={{ width: '12px', height: '12px' }}></div>
            <small class="text-white">Computer Found Set</small>
          </div>
        </div>
      </div>
    </div>
  )
}
