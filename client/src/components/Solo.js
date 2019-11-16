import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import Board from './Board'
import {
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected as removeSelectedCards,
  isSet,
  nameThird,
  handleGoogleRedirect,
} from '../utils/helpers'
import { shuffle, cloneDeep } from 'lodash'
import { colors } from '../config'
import update from 'immutability-helper'
import Slider from 'react-rangeslider'
import axios from 'axios'
import { connect } from 'react-redux'
import Signout from './Signout'

const debugging = false

const config = {
  turnTime: 4000,
  colors,
  playingTo: 7,
  cpuDelay: 1200,
}

const calculateIntervalFromDifficulty = (d) => {
  return 24000 / (5 * Number(d))
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

const logTime = (msg = '') => {
  const d = new Date()
  const s = (d.getTime() % 10 ** 6) / 1000
  console.log(msg, s.toFixed(1))
}

const initialState = {
  players: {
    you: {
      score: 0,
      color: config.colors[0],
    },
    cpu: {
      score: 0,
      color: config.colors[1],
    },
  },
  gameStarted: false,
  name: 'you',
  setFound: false,
  declarer: null,
  timeDeclared: null,
  gameOver: false,
  cpuTurnInterval: 1000,
  cpuFound: [],
  startTime: null,
}

class Solo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...cloneDeep(initialState),
      ...createGameState(),
    }
  }

  handleStartGame = (e) => {
    e.preventDefault()
    this.setState({
      gameStarted: true,
      startTime: new Date(),
    })

    console.log(`Turns every ${this.state.cpuTurnInterval} ms`)
    setTimeout(() => {
      this.cpuTimer = setInterval(this.cpuTurn, this.state.cpuTurnInterval)
    }, config.cpuDelay)
  }

  componentDidMount = () => {
    const difficulty = window.localStorage.getItem('soloDifficulty') || '2'
    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty)
    this.setState({
      difficulty,
      cpuTurnInterval,
    })
  }

  componentWillUnmount = () => {
    clearInterval(this.cpuTimer)
  }

  cpuTurn = () => {
    const { board, declarer, gameOver } = this.state
    if (declarer || gameOver) {
      return
    }
    if (debugging) {
      logTime('Guess')
    }
    const [a, b] = shuffle(board).slice(0, 2)
    const c = nameThird(a, b)
    if (board.includes(c)) {
      this.setState({
        declarer: 'cpu',
        selected: [a],
        cpuFound: [b, c],
        setFound: true,
      })
      clearInterval(this.cpuTimer)
      this.cpuAnimation = setInterval(this.animateCpuChoice, 900)
    }
  }

  animateCpuChoice = () => {
    const { selected, cpuFound } = this.state
    const cpuCopy = [...cpuFound]
    const newSelected = [...selected, cpuCopy.pop()]
    this.setState({
      cpuFound: cpuCopy,
      selected: newSelected,
    })
    if (newSelected.length === 3) {
      clearInterval(this.cpuAnimation)
      this.updateSelected(newSelected, 'cpu')
    }
  }

  updatePlayerScore = (name: string, delta: number) => {
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
    const { user } = this.props.userReducer
    const gameOver = newScore >= config.playingTo && declarer
    const newState = {
      players: newPlayers,
      gameOver,
    }
    if (gameOver && user !== null) {
      const player_won = declarer == 'you' ? 1 : 0
      const total_time = Math.round((new Date().getTime() - this.state.startTime.getTime()) / 1000)
      axios
        .post('/api/game', {
          uid: user.uid,
          total_time,
          player_won,
          difficulty_level: this.state.difficulty,
          winning_score: newScore,
        })
        .then(() => {
          console.log('Game sent')
        })
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
      }, config.turnTime)
    }
  }

  updateSelected = (newSelected: Array<string>, declarer: string) => {
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
    const { setFound, declarer, name } = this.state
    if (!setFound && declarer !== 'cpu') {
      const newSelected = cardToggle(card, this.state.selected)
      if (!declarer) {
        this.performDeclare(name)
      }
      this.setState({
        selected: newSelected,
      })
      if (isSet(newSelected)) {
        this.updateSelected(newSelected, 'you')
      }
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
    const { board, deck, selected, declarer, players, gameStarted, setFound } = this.state
    const { userReducer } = this.props
    const { user } = userReducer
    if (userReducer.loading) {
      return 'Loading...'
    }
    if (!gameStarted) {
      return (
        <div className="container">
          {user !== null && <Signout />}
          <h3>Solo Play vs. Computer</h3>
          <h4 className="orange-text text-darken-4">Choose difficulty level:</h4>
          <div className="row">
            <div className="col s8 m4">
              <form onSubmit={this.handleStartGame}>
                <Slider
                  ref={(input) => {
                    this.difficultyInput = input
                  }}
                  min={1}
                  max={5}
                  orientation="horizontal"
                  tooltip={true}
                  value={Number(this.state.difficulty)}
                  onChange={(difficulty) => {
                    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty)
                    window.localStorage.setItem('soloDifficulty', difficulty)
                    this.setState({
                      cpuTurnInterval,
                      difficulty,
                    })
                  }}
                />
                <input type="submit" value="Start" className="btn" />
              </form>
            </div>
            <div className="row">
              <div style={{ marginTop: '48px' }} className="col s12">
                <p>
                  <Link to="/local">Local Multiplayer</Link>
                </p>
                <p style={{ marginTop: '36px' }}>
                  <Link to="/">Back to Main Menu</Link>
                </p>
                {!user && (
                  <Fragment>
                    <hr />
                    <p>To save your stats, sign in with your Google account.</p>

                    <p>
                      <button onClick={handleGoogleRedirect} className="btn">
                        Sign in
                      </button>
                    </p>
                  </Fragment>
                )}
              </div>
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
          handleDeclare={this.handleDeclare}
          handleRedeal={this.handleRedeal}
          players={players}
          setFound={this.state.setFound}
          gameOver={this.state.gameOver}
          myName={this.state.name}
          resetGame={this.resetGame}
          solo={true}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  userReducer: state.user,
})

export default connect(mapStateToProps)(Solo)
