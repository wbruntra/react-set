import React from 'react'
import { map, findKey } from 'lodash'
import { MultiPlayers } from '../utils/models' // Assuming MultiPlayers is the correct type for players

interface PlayerListProps {
  isHost: boolean
  players: MultiPlayers
  setState: (update: any) => void // setState function from Host or Guest component
  setAndSendState?: (update: any) => void // Optional setAndSendState for Host
}

function PlayerList({ isHost, players, setState, setAndSendState }: PlayerListProps) {
  const host = findKey(players, (player) => player.host)

  return (
    <div className="container mt-4">
      <h4>Players:</h4>
      <ul className="collection">
        {map(players, (info, name) => {
          return (
            <li key={name} className="collection-item">
              <span className={`player-name`}>
                {name} {info.host && '(host)'}
              </span>
            </li>
          )
        })}
      </ul>
      {isHost ? (
        <button
          className="btn btn-primary"
          onClick={() => {
            const update = { gameStarted: true }
            // Use setAndSendState if available (Host), otherwise use setState (Guest)
            if (setAndSendState) {
              setAndSendState(update)
            } else {
              setState(update)
            }
          }}
        >
          Start Game
        </button>
      ) : (
        <p>Waiting for host to start game...</p>
      )}
    </div>
  )
}

export default PlayerList
