import React from 'react'

interface PlayerInfo {
  name: string
  color: string
  score: number
  host?: boolean
}

interface SharedPlayersDisplayProps {
  players: PlayerInfo[]
  declarer: string | null
  handlePlayerClick: (playerName: string) => void
}

function SharedPlayersDisplay({
  players,
  declarer,
  handlePlayerClick,
}: SharedPlayersDisplayProps) {
  // For shared device, we want to position players around the edges
  // Top row gets even indices, bottom row gets odd indices for better distribution
  return (
    <div className="shared-players-container">
      <div className="row my-3 text-center justify-content-center">
        {players.map((info) => {
          const isActive = info.name === declarer
          const displayName = `Player ${parseInt(info.name) + 1}` // Convert ID back to display name
          return (
            <div className="col-auto mx-2" key={info.name}>
              <div
                className={`shared-player-button bg-${info.color} ${isActive ? 'active-player' : ''}`}
                onClick={() => {
                  console.log(`Player clicked: ${info.name}, declarer: ${declarer}`) // Debug log
                  handlePlayerClick(info.name)
                }}
                style={{
                  cursor: 'pointer',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  minHeight: '80px',
                  minWidth: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isActive ? '4px solid #000' : '3px solid rgba(0,0,0,0.2)',
                  boxShadow: isActive
                    ? '0 6px 16px rgba(0,0,0,0.4)'
                    : '0 3px 8px rgba(0,0,0,0.15)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.3s ease-in-out',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.9)' : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: isActive ? '1.4rem' : '1.1rem',
                    fontWeight: 'bold',
                    color: isActive ? '#000' : '#fff',
                    textShadow: isActive ? 'none' : '1px 1px 2px rgba(0,0,0,0.7)',
                    marginBottom: isActive ? '0' : '8px',
                  }}
                >
                  {isActive ? 'SET!' : displayName}
                </div>
                {!isActive && (
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#fff',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {info.score}
                  </div>
                )}
                {isActive && (
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    Select cards!
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SharedPlayersDisplay
