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

import { Players, GameState } from '../utils/models'

const debugging = false

const config = {
  turnTime: 4000,
  colors,
  playingTo: 6,
  cpuDelay: 1200,
}

const calculateIntervalFromDifficulty = (d: number) => {
  let diff = Number(d)
  if (Number.isNaN(diff)) {
    diff = 1
  }
  const interval = 24000 / (5 * diff)
  return interval
}

const createGameState = () => {
  const initialDeck = makeDeck()
  const selected: string[] = []
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected,
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
  gameOver: false,
  cpuTurnInterval: 1000,
  startTime: new Date(),
}

interface State extends GameState {
  players: Players
  selected: string[]
  cpuTimer?: number
  gameStarted: boolean
  name: string
  setFound: boolean
  declarer: null | string
  timeDeclared?: number
  gameOver: boolean
  cpuTurnInterval: number
  cpuFound?: string[]
  startTime: Date
  undeclareId?: number
  difficulty?: number
  cpuAnimation?: number
}

class Solo extends Component<any, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      ...cloneDeep(initialState),
      ...createGameState(),
    }
  }

  handleStartGame = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    this.setState({
      gameStarted: true,
      startTime: new Date(),
    })

    console.log(`Turns every ${this.state.cpuTurnInterval} ms`)
    setTimeout(() => {
      const cpuTimer = window.setInterval(this.cpuTurn, this.state.cpuTurnInterval)
      this.setState({
        cpuTimer,
      })
    }, config.cpuDelay)
  }

  componentDidMount = () => {
    const savedDifficulty = window.localStorage.getItem('soloDifficulty')
    let difficulty = savedDifficulty ? Number(savedDifficulty) : 2
    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty)
    this.setState({
      difficulty,
      cpuTurnInterval,
    })
  }

  componentWillUnmount = () => {
    if (this.state.cpuTimer !== null) {
      window.clearInterval(this.state.cpuTimer)
    }
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
      if (this.state.cpuTimer !== null) {
        clearInterval(this.state.cpuTimer)
      }
      this.setState({
        cpuAnimation: window.setInterval(this.animateCpuChoice, 900),
      })
    }
  }

  animateCpuChoice = () => {
    const { selected, cpuFound } = this.state
    const cpuCopy = [...cpuFound]
    if (cpuCopy.length === 0) {
      return
    }
    const newSelected = [...selected, cpuCopy.pop() as string]
    this.setState({
      cpuFound: cpuCopy,
      selected: newSelected,
    })
    if (newSelected.length === 3) {
      if (this.state.cpuAnimation !== null) {
        clearInterval(this.state.cpuAnimation)
      }
      this.updateSelected(newSelected, 'cpu')
    }
  }

  updatePlayerScore = (name: string, delta: number): [Players, number] => {
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
    if (declarer && !isSet(selected)) {
      const [newPlayers] = this.updatePlayerScore(declarer, -0.5)
      this.setState({
        players: newPlayers,
        declarer: null,
        timeDeclared: undefined,
        selected: [],
      })
    }
  }

  markPointForDeclarer = (declarer: string) => {
    const [newPlayers, newScore] = this.updatePlayerScore(declarer, 1)
    const { user } = this.props.userReducer
    const gameOver = !!(newScore >= config.playingTo && declarer)
    const newState = {
      players: newPlayers,
      gameOver,
    }
    if (gameOver) {
      const uid = (user && user.uid) || 'anonymous'
      const player_won = declarer == 'you' ? 1 : 0
      const total_time = Math.round((new Date().getTime() - this.state.startTime.getTime()) / 1000)
      axios
        .post('/api/game', {
          uid,
          total_time,
          player_won,
          difficulty_level: this.state.difficulty,
          winning_score: newScore,
        })
        .then(() => {
          console.log('Game sent')
        })
        .catch((err) => {
          console.log('Error sending game')
        })
    }
    this.setState(newState)
    return newState
  }

  performDeclare = (declarer: string) => {
    if (!this.state.declarer) {
      const timeNow = new Date().getTime()
      const update = {
        declarer,
        timeDeclared: timeNow,
      }
      this.setState(update)
      this.setState({
        undeclareId: window.setTimeout(() => {
          this.expireDeclare()
        }, config.turnTime),
      })
    }
  }

  updateSelected = (newSelected: Array<string>, declarer: string) => {
    const newState = {
      setFound: isSet(newSelected),
      selected: newSelected,
      declarer,
    }
    if (newState.setFound) {
      this.state.undeclareId && clearTimeout(this.state.undeclareId)
      setTimeout(() => {
        this.removeSet()
      }, 2000)
    }
    this.setState(newState)
  }

  handleCardClick = (card: string) => {
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
    if (declarer && isSet(selected)) {
      console.log('Set found, removing')
      this.markPointForDeclarer(declarer)
      const newState = {
        setFound: false,
        declarer: null,
        timeDeclared: undefined,
        ...removeSelectedCards(this.state),
      }
      this.setState(newState)
    }
    this.state.cpuTimer && clearInterval(this.state.cpuTimer)
    setTimeout(() => {
      const cpuTimer = window.setInterval(this.cpuTurn, this.state.cpuTurnInterval)
      this.setState({
        cpuTimer,
      })
    }, config.cpuDelay)
  }

  resetGame = () => {
    this.state.cpuTimer && window.clearInterval(this.state.cpuTimer)
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
                  min={1}
                  max={5}
                  orientation="horizontal"
                  tooltip={true}
                  value={Number(this.state.difficulty)}
                  onChange={(difficulty) => {
                    const cpuTurnInterval = calculateIntervalFromDifficulty(difficulty)
                    window.localStorage.setItem('soloDifficulty', difficulty.toString())
                    this.setState({
                      cpuTurnInterval,
                      difficulty,
                    })
                  }}
                />
                <input type="submit" value="Start" className="btn" />
              </form>
              <p style={{ marginTop: '24px' }}>First to {config.playingTo} points is the winner</p>
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
          handleDeclare={() => {}}
          handleRedeal={this.handleRedeal}
          players={players}
          setFound={this.state.setFound}
          gameOver={this.state.gameOver}
          myName={this.state.name}
          resetGame={this.resetGame}
          solo={true}
          gameMode="versus"
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: any) => ({
  userReducer: state.user,
})

export default connect(mapStateToProps)(Solo)
