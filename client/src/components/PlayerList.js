import React from 'react'
import { map } from 'lodash'

function PlayerList({ isHost, players, setState }) {
  return (
    <div className="container">
      <h4>Players:</h4>
      <ul className="collection">
        {map(players, (info, name) => {
          return (
            <li key={name} className="collection-item">
              <span className={`player-name`}>{name}</span>
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
