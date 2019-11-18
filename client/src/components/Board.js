import React, { useEffect, useState, Component, Fragment } from 'react'
import { isEmpty, map, debounce, get } from 'lodash'
import { countSets } from '../utils/helpers'
import Card from './Card'
import GameOver from './GameOver'
import TopBar from './TopBar'

function Board(props) {
  const [sets, setSets] = useState(null)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const {
    board,
    selected,
    deck,
    declarer,
    players,
    gameOver,
    myName,
    setFound,
    sharedDevice,
    solo,
    gameMode,
  } = props

  useEffect(() => {
    const resize = debounce(() => {
      setWindowHeight(window.innerHeight)
    }, 150)

    window.addEventListener('resize', resize)

    return function cleanup() {
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    setSets(countSets(board, { debug: process.env.NODE_ENV !== 'production' }))
  }, [board])

  if (isEmpty(players) || !Object.keys(players).includes(myName)) {
    return null
  }

  const getBorderColor = ({ declarer, players }) => {
    if (declarer) {
      return get(players, `${declarer}.color`, '')
    }
    return get(players, `${myName}.color`, '')
  }

  const borderColor = getBorderColor(props)

  if (gameOver) {
    return <GameOver gameOver={gameOver} myName={myName} solo={solo} />
  }

  const playersArray = map(players, (info, name) => {
    return {
      name,
      ...info,
    }
  })

  const topBoxes = Math.ceil(playersArray.length / 2)
  const topPlayers = playersArray.slice(0, topBoxes)
  const bottomPlayers = playersArray.slice(topBoxes)

  return (
    <Fragment>
      <TopBar {...props} />
      {sharedDevice && (
        <Fragment>
          <div className="player-buttons-container">
            {topPlayers.map((info) => {
              return (
                <div
                  className={`shared-player player-name ${info.color} ${
                    info.name == declarer ? 'active-player' : ''
                  }`}
                  onClick={() => {
                    props.handlePlayerClick(info.name)
                  }}
                  key={info.name}
                >
                  <p className="center-align">{info.name == declarer ? 'SET!' : info.score}</p>
                </div>
              )
            })}
            <div className="player-buttons-container bottom">
              {bottomPlayers.map((info) => {
                return (
                  <div
                    className={`shared-player player-name ${info.color} ${
                      info.name == declarer ? 'active-player' : ''
                    }`}
                    onClick={() => {
                      props.handlePlayerClick(info.name)
                    }}
                    key={info.name}
                  >
                    <p className="center-align">{info.name == declarer ? 'SET!' : info.score}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </Fragment>
      )}

      <div className="container" style={{ maxWidth: window.innerHeight - 48 }}>
        <div className="row">
          {board.map((card) => {
            return (
              <div
                key={card}
                className={`col s4 ${selected.includes(card) ? borderColor : ''}`}
                onClick={() => {
                  props.handleCardClick(card)
                }}
              >
                <div
                  className={`card ${
                    setFound && selected.length === 3 && !selected.includes(card) ? 'blurry' : ''
                  }`}
                >
                  <Card desc={card} />
                </div>
              </div>
            )
          })}
        </div>
        {!sharedDevice && gameMode !== 'puzzle' && (
          <div className="row">
            {map(players, (info, name) => {
              return (
                <div key={name} className="col s4 m3">
                  <span className={`player-name ${info.color}`}>
                    {name}: {info.score}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {props.handleRedeal && (
          <div className="row">
            <button onClick={props.handleRedeal} className="btn">
              Shuffle
            </button>
          </div>
        )}
      </div>
    </Fragment>
  )
}

export default Board
