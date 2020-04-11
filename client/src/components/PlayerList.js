import React from 'react'
import { map, findKey } from 'lodash'

function PlayerList({ isHost, players, setState }) {
  const host = findKey(players, (player) => player.host)

  return (
    <div className="container">
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
          className="btn"
          onClick={() => {
            setState({
              started: true,
            })
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
