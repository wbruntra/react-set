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
  return (
    <div className="row my-4 text-center justify-content-between">
      {players.map((info) => {
        return (
          <div
            className={`col-2 bg-${info.color} ${info.name === declarer ? 'active-player' : ''}`}
            onClick={() => {
              handlePlayerClick(info.name)
            }}
            key={info.name}
          >
            <p className="my-2 align-middle">{info.name === declarer ? 'SET!' : info.score}</p>
          </div>
        )
      })}
    </div>
  )
}

export default SharedPlayersDisplay
