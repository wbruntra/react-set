import React, { Fragment, useEffect, useState } from 'react'

import Card from './Card'
import GameOver from './GameOver'
import { Modal } from 'react-bootstrap'
import TopBar from './TopBar'
import { countSets } from '../utils/helpers'
import SharedPlayersDisplay from './SharedPlayersDisplay'
import { Players } from '@/utils/models' // Import Players interface

interface BoardProps {
  board: string[]
  deck: string[]
  selected: string[]
  declarer: string | null
  handleCardClick: (card: string) => void
  handleDeclare: () => void
  handleRedeal?: () => void
  handlePlayerClick?: (playerName: string) => void // For shared device mode
  players: Players // Use Players interface
  setFound: boolean
  gameOver: string | null | boolean
  myName: string
  resetGame: () => void
  solo: boolean
  gameMode: string
  elapsedTime?: number
  timeLeft?: number | string
  gameData?: {
    actions: Array<[number, number, 'h' | 'c']>
    totalTime?: number
    difficulty?: number
    playerWon?: number
  } // Game timeline data for solo mode
}

function Board(props: BoardProps) {
  const [sets, setSets] = useState<number | null>(null)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const { board, selected, deck, declarer, players, gameOver, myName, setFound, solo, gameMode } =
    props

  // Determine if sharedDevice is true based on gameMode
  const sharedDevice = gameMode === 'shared-device'

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWindowHeight(window.innerHeight)
      }, 150)
    }

    window.addEventListener('resize', handleResize)

    return function cleanup() {
      window.removeEventListener('resize', handleResize)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    setSets(countSets(board, { debug: process.env.NODE_ENV !== 'production' }))
  }, [board])

  const getBorderColor = ({
    declarer,
    players,
  }: {
    declarer: string | null
    players: Players
  }) => {
    if (declarer) {
      return players[declarer]?.color ?? ''
    }
    return players[myName]?.color ?? ''
  }

  const borderColor = getBorderColor(props)

  if (gameOver != null && gameOver !== '' && gameOver !== false) {
    const winner = typeof gameOver === 'string' ? gameOver : ''
    return (
      <GameOver
        gameOver={gameOver}
        myName={myName}
        solo={solo}
        finalScore={solo && winner ? players[winner]?.score : undefined}
        reset={props.resetGame}
        gameData={props.gameData}
      />
    )
  }

  const playersArray = Object.entries(players).map(([name, info]) => {
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
      {(Object.keys(players).length === 0 || !Object.keys(players).includes(myName)) && (
        <Modal show>
          <Modal.Header>
            <Modal.Title>Waiting to join...</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Players:</h4>
            <ul className="collection">
              {Object.entries(players).map(([name, info]) => {
                return (
                  <li key={name} className="collection-item">
                    <span className={`player-name`}>
                      {name} {(info as any).host && '(host)'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Modal.Body>
        </Modal>
      )}

      <TopBar {...props} />
      <div className="container bg-light-purple">
        {sharedDevice && (
          <SharedPlayersDisplay
            players={topPlayers}
            declarer={declarer}
            handlePlayerClick={props.handlePlayerClick || (() => {})}
          />
        )}

        <div className="board d-flex flex-column align-items-center">
          <div className="board-main-container">
            {board.map((card, index) => {
              const isSelected = selected.includes(card)
              const cardHolderStyle = isSelected ? { backgroundColor: borderColor } : {}
              return (
                <div
                  key={`${card}-${index}`}
                  className={`card-wrapper`}
                  onClick={() => {
                    props.handleCardClick(card)
                  }}
                >
                  <div className="card-holder" style={cardHolderStyle}>
                    <div
                      className={`card ${
                        setFound && selected.length === 3 && !selected.includes(card)
                          ? 'blurry'
                          : ''
                      }`}
                    >
                      <Card desc={card} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {!sharedDevice && !['puzzle', 'training'].includes(gameMode) && (
            <div className="row my-1 text-center fixed-bottom">
              {Object.entries(players).map(([name, info]) => {
                return (
                  <div key={name} className="col s4 m3">
                    <span className={`player-name bg-${info.color}`}>
                      {name}: {info.score}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {props.handleRedeal && (
            <div className="row mt-3">
              <div className="col mt-3 mt-md-4">
                <button onClick={props.handleRedeal} className="btn btn-primary">
                  Shuffle
                </button>
              </div>
            </div>
          )}
        </div>
        {sharedDevice && (
          <SharedPlayersDisplay
            players={bottomPlayers}
            declarer={declarer}
            handlePlayerClick={props.handlePlayerClick || (() => {})}
          />
        )}
      </div>
    </Fragment>
  )
}

export default Board
