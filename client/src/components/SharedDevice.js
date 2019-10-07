import React, { Component } from 'react'
import Board from './Board'
import {
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected as removeSelectedCards,
  isSet,
  nameThird,
} from '../utils/helpers'
import { shuffle, cloneDeep } from 'lodash'
import { colors } from '../config'
import update from 'immutability-helper'
import Slider from 'react-rangeslider'

const debugging = false

const config = {
  declareTime: 4000,
  colors,
  playingTo: 6,
  cpuDelay: 1200,
}

const createGameState = () => {
  const initialDeck = makeDeck()
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  }
}

const createPlayers = (num) => {
  const players = {}
  for (let i = 0; i < num; i++) {
    players[i] = {
      score: 0,
      color: config.colors[i],
    }
  }
  return players
}

const initialState = {
  numPlayers: null,
  players: createPlayers(2),
  gameStarted: false,
  name: '1',
  setFound: false,
  declarer: null,
  timeDeclared: null,
  gameOver: false,
  difficulty: 2,
  cpuTurnInterval: 1000,
  cpuFound: [],
}

class SharedDevice extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...cloneDeep(initialState),
      ...createGameState(),
    }
  }

  handleStartGame = (numPlayers) => {
    this.setState({
      numPlayers,
      players: createPlayers(numPlayers),
    })
    this.setState({
      gameStarted: true,
    })
  }

  updatePlayerScore = (name, delta) => {
    const { players } = this.state
    const newScore = players[name].score + delta
    const newPlayers = update(players, {
      [name]: {
        $merge: {
          score: newScore,
        },
      },
    })
    return [newPlayers, newScore]
  }

  expireDeclare = () => {
    const { declarer, selected } = this.state
    if (!isSet(selected)) {
      const [newPlayers] = this.updatePlayerScore(declarer, -1)
      this.setState({
        players: newPlayers,
        declarer: null,
        timeDeclared: null,
        selected: [],
      })
    }
  }

  markPointForDeclarer = (declarer) => {
    const [newPlayers, newScore] = this.updatePlayerScore(declarer, 1)
    const gameOver = newScore >= config.playingTo && declarer
    const newState = {
      players: newPlayers,
      gameOver,
    }
    this.setState(newState)
  }

  performDeclare = (declarer) => {
    if (!this.state.declarer) {
      const timeNow = new Date().getTime()
      const update = {
        declarer,
        timeDeclared: timeNow,
      }
      this.setState(update)

      this.undeclareID = setTimeout(() => {
        this.expireDeclare()
      }, config.declareTime)
    }
  }

  updateSelected = (newSelected, declarer) => {
    const newState = {
      setFound: isSet(newSelected),
      selected: newSelected,
      declarer,
    }
    if (newState.setFound) {
      clearTimeout(this.undeclareID)
      setTimeout(() => {
        this.removeSet()
      }, 2000)
    }
    this.setState(newState)
  }

  handleCardClick = (card) => {
    const { setFound, declarer } = this.state
    if (!setFound && declarer !== null) {
      const newSelected = cardToggle(card, this.state.selected)
      this.setState({
        selected: newSelected,
      })
      if (isSet(newSelected)) {
        this.updateSelected(newSelected, declarer)
      }
    }
  }

  handlePlayerClick = (clickerName) => {
    const { declarer } = this.state
    if (declarer === null) {
      console.log(clickerName)
      this.performDeclare(clickerName)
    }
  }

  handleRedeal = () => {
    const newState = reshuffle(this.state)
    this.setState(newState)
  }

  removeSet = () => {
    const { declarer, selected } = this.state
    if (isSet(selected)) {
      console.log('Set found, removing')
      const newScores = this.markPointForDeclarer(declarer)
      const newState = {
        ...newScores,
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...removeSelectedCards(this.state),
      }
      this.setState(newState)
    }
    clearInterval(this.cpuTimer)
    setTimeout(() => {
      this.cpuTimer = setInterval(this.cpuTurn, this.state.cpuTurnInterval)
    }, config.cpuDelay)
  }

  resetGame = () => {
    clearInterval(this.cpuTimer)
    this.setState({
      ...cloneDeep(initialState),
      ...createGameState(),
    })
  }

  render() {
    const { board, deck, selected, declarer, players, numPlayers, setFound } = this.state
    if (!numPlayers) {
      return (
        <div className="container">
          <h4>Choose Number of Players</h4>
          <div className="row">
            <div className="col s12">
              {[...Array(6).keys()].map((i) => {
                return (
                  <div key={`players-${i}`} className="col s4 player-number">
                    <div
                      onClick={() => {
                        this.handleStartGame(i + 1)
                      }}
                      className="btn-large"
                    >
                      {i + 1}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }
    return (
      <React.Fragment>
        <Board
          board={board}
          deck={deck}
          selected={selected}
          declarer={declarer}
          handleCardClick={this.handleCardClick}
          handlePlayerClick={this.handlePlayerClick}
          handleDeclare={this.handleDeclare}
          players={players}
          setFound={this.state.setFound}
          gameOver={this.state.gameOver}
          myName={this.state.name}
          resetGame={this.resetGame}
          solo={true}
          sharedDevice={true}
        />
      </React.Fragment>
    )
  }
}

export default SharedDevice
