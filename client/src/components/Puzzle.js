import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { shuffle, cloneDeep, isEqual } from 'lodash'
import { connect } from 'react-redux'
import update from 'immutability-helper'
import axios from 'axios'

import {
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected as removeSelectedCards,
  isSet,
  nameThird,
  countSets,
  handleGoogleRedirect,
} from '../utils/helpers'
import { colors } from '../config'
import Board from './Board'
import Signout from './Signout'

const debugging = false

const config = {
  turnTime: 4000,
  colors,
  playingTo: 6,
  cpuDelay: 1200,
}

const createGameState = (cards = 12) => {
  const initialDeck = makeDeck()
  return {
    ...reshuffle({
      deck: initialDeck.slice(cards),
      board: initialDeck.slice(0, cards),
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
  },
  gameStarted: false,
  name: 'you',
  setFound: false,
  gameOver: false,
  startTime: null,
  setsFound: [],
  setsOnBoard: null,
}

const sortSet = (set) => {
  return set.sort()
}

class Puzzle extends Component {
  constructor(props) {
    super(props)
    const game = createGameState()
    this.state = {
      ...cloneDeep(initialState),
      ...game,
      setsOnBoard: countSets(game.board),
    }
  }

  handleStartGame = (e) => {
    e.preventDefault()
    this.setState({
      gameStarted: true,
      startTime: new Date(),
    })
  }

  componentDidMount = () => {}

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

  handleDeclare = () => {
    return
  }

  resetLocalSelected = (noCheck = false) => {
    this.setState((currentState) => {
      if (currentState.selected.length === 3) {
        if (noCheck || !isSet(currentState.selected)) {
          return {
            selected: [],
          }
        }
      }
    })
  }

  handleCardClick = (card) => {
    const newSelected = cardToggle(card, this.state.selected)
    const newState = {}
    if (newSelected.length === 3) {
      if (isSet(newSelected)) {
        console.log('Set found')
        this.setState((currentState) => {
          window.setTimeout(() => {
            this.resetLocalSelected(true)
          }, 3000)
          const { setsFound } = currentState
          const isNewSet = setsFound
            .map((set) => {
              const result = isEqual(newSelected.sort(), set)
              return !result
            })
            .every((result) => result)
          console.log('Is new?', isNewSet)
          if (!isNewSet) {
            return
          }
          const newSetsFound = [...setsFound, newSelected.sort()]
          return {
            setsFound: newSetsFound,
          }
        })
      } else {
        console.log('Bad set selected!')
        window.setTimeout(this.resetLocalSelected, 1200)
      }
    }

    this.setState({
      ...newState,
      selected: newSelected,
    })
  }

  handleRedeal = () => {
    return
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
    const {
      board,
      deck,
      selected,
      declarer,
      players,
      gameStarted,
      setFound,
      setsFound,
    } = this.state
    console.log(setsFound)
    const { userReducer } = this.props
    const { user } = userReducer
    if (userReducer.loading) {
      return 'Loading...'
    }
    if (!gameStarted) {
      return (
        <div className="container">
          {user !== null && <Signout />}
          <h3>Puzzle Mode</h3>
          <p>Find as many sets as you can</p>
          <div className="row">
            <div className="col s8 m4">
              <form onSubmit={this.handleStartGame}>
                <input type="submit" value="Start" className="btn" />
              </form>
            </div>
            <div className="row">
              <div style={{ marginTop: '48px' }} className="col s12">
                <p style={{ marginTop: '36px' }}>
                  <Link to="/solo">Back to Solo Menu</Link>
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
        <p>Sets on Board: {this.state.setsOnBoard}</p>
        <p>Sets founds: {this.state.setsFound.length}</p>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  userReducer: state.user,
})

export default connect(mapStateToProps)(Puzzle)
