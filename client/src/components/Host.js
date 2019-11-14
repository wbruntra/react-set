import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateNickname } from '../redux-helpers'
import { isEqual } from 'lodash'

import Signout from './Signout'
import Board from './Board'
import {
  handleGoogleSignIn,
  handleGoogleRedirect,
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected,
  isSet,
} from '../utils/helpers'
import update from 'immutability-helper'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import firestore from '../firestore'
import { colors } from '../config'
import { Link } from 'react-router-dom'

const config = {
  turnTime: 5000,
  colors,
  playingTo: 6,
}

const firebaseRefs = {}

function Host(props) {
  const userReducer = useSelector((state) => state.user)
  const { user, loading: userLoading } = userReducer
  const dispatch = useDispatch()

  const initialDeck = makeDeck()
  const initialGameState = {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  }
  const [state, setFullState] = useState({
    players: {},
    gameTitle: '',
    created: false,
    myName: '',
    inputName: '',
    setFound: false,
    autoplay: false,
    declarer: null,
    gameOver: false,
    ...initialGameState,
  })

  const currentState = useRef(state)
  currentState.current = state

  const setState = (update) => {
    setFullState({
      ...currentState.current,
      ...update,
    })
  }

  const handleCardClick = (card) => {
    const { myName } = state
    if (!state.declarer) {
      const newSelected = cardToggle(card, state.selected)
      if (isSet(newSelected)) {
        updateSelected(newSelected, myName)
      }
      setState({
        selected: newSelected,
      })
    }
  }

  const handleRedeal = () => {
    const newState = reshuffle(state)
    setAndSendState(newState)
  }

  const handleCreateGame = (e) => {
    e.preventDefault()
    const { myName, board, deck, selected } = state
    let gameTitle = state.gameTitle
    if (gameTitle === '') {
      gameTitle = `${myName}'s game`
    }
    firebaseRefs.game = firestore.collection('games').doc(gameTitle)
    firebaseRefs.game.set({
      board,
      deck,
      selected,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    })
    window.activeGameUpdater = window.setInterval(() => {
      firebaseRefs.game.update({
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, 30000)
    firebaseRefs.actions = firebaseRefs.game.collection('actions')
    firebaseRefs.actions.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data())
      })
    })

    firebaseRefs.actions.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const action = change.doc.data()
          console.log(action)
          processAction(action)
          firebaseRefs.actions.doc(change.doc.id).delete()
        }
        if (change.type === 'removed') {
          console.log('Removed action: ', change.doc.data())
        }
      })
    })

    setState({
      created: true,
    })
  }

  const handleSetName = (e) => {
    e.preventDefault()
    setState({
      myName: user.nickname,
      players: {
        [user.nickname]: {
          score: 0,
          color: config.colors[0],
        },
      },
    })
  }

  const markPointForDeclarer = (declarer) => {
    if (!declarer) {
      return {}
    }
    const { players } = currentState.current
    const newScore = players[declarer].score + 1
    const newPlayers = update(players, {
      [declarer]: {
        $merge: {
          score: newScore,
        },
      },
    })
    const gameOver = newScore >= config.playingTo && declarer
    if (gameOver) {
      window.setTimeout(() => {
        firebaseRefs.game.delete()
        clearInterval(window.activeGameUpdater)
      }, 3000)
    }

    return {
      players: newPlayers,
      gameOver,
    }
  }

  const processAction = (action) => {
    const { type, payload } = action
    const { players, declarer } = currentState.current
    switch (type) {
      case 'join':
        if (Object.keys(players).includes(payload.name)) {
          return
        }
        const newPlayers = {
          ...players,
          [payload.name]: {
            score: 0,
            color: config.colors[Object.keys(players).length],
          },
        }
        setAndSendState({ players: newPlayers })
        break
      case 'found':
        if (!declarer) {
          updateSelected(payload.selected, payload.name)
        }
        break
      default:
        return
    }
  }

  const removeSet = (selected, declarer) => {
    if (isSet(selected)) {
      const newScores = markPointForDeclarer(declarer)
      const newState = {
        ...currentState.current,
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...newScores,
        ...removeSelected(currentState.current),
      }
      setAndSendState(newState)
    }
  }

  const setAndSendState = (update) => {
    setState(update)
    firebaseRefs.game.update(update)
  }

  const updateSelected = (newSelected, declarer) => {
    const newState = {
      setFound: isSet(newSelected),
      selected: newSelected,
      declarer,
    }
    setAndSendState(newState)
    if (newState.setFound) {
      setTimeout(() => {
        removeSet(newSelected, declarer)
      }, 4000)
    }
  }

  const { board, deck, selected, declarer, players, gameTitle, created, myName } = state

  if (userLoading) {
    return 'Loading...'
  }

  if (!user) {
    return (
      <div className="container">
        <p>
          To host a game, sign in with your Google account.
        </p>
        <p>
          <button onClick={handleGoogleRedirect} className="btn">
            Sign in
          </button>
        </p>
      </div>
    )
  }

  if (myName === '') {
    return (
      <div className="container">
        <Signout />
        <h4>Enter your nickname:</h4>
        <form onSubmit={handleSetName}>
          <input
            autoFocus
            placeholder="hostname"
            value={user.nickname}
            onChange={(e) => {
              dispatch(updateNickname(e.target.value))
              window.localStorage.setItem('nickname', e.target.value)
            }}
          />
          <button type="submit" className="btn">
            Submit
          </button>
        </form>
        <div>
          <p>
            <Link to="/">Main Menu</Link>
          </p>
        </div>
      </div>
    )
  }

  if (!created) {
    return (
      <div className="container">
        <h4>Name your game:</h4>
        <form onSubmit={handleCreateGame}>
          <input
            placeholder={`${myName}'s game`}
            onChange={(e) => {
              setState({ gameTitle: e.target.value })
            }}
            value={gameTitle}
          />
          <button type="submit" className="btn">
            Create
          </button>
        </form>
      </div>
    )
  }

  return (
    <Board
      board={board}
      deck={deck}
      selected={selected}
      declarer={declarer}
      handleCardClick={handleCardClick}
      // handleDeclare={this.handleDeclare}
      handleRedeal={handleRedeal}
      players={players}
      setFound={state.setFound}
      gameOver={state.gameOver}
      myName={state.myName}
    />
  )
}

/*


class HostCls extends React.Component {
  constructor(props) {
    super(props)
    const initialDeck = makeDeck()
    const initialGameState = {
      ...reshuffle({
        deck: initialDeck.slice(12),
        board: initialDeck.slice(0, 12),
      }),
      selected: [],
    }
    this.nameInputRef = React.createRef()

    this.state = {
      players: {},
      gameTitle: '',
      created: false,
      myName: '',
      inputName: '',
      setFound: false,
      autoplay: false,
      declarer: null,
      gameOver: false,
      ...initialGameState,
    }
  }

  handleHostName = (e) => {
    e.preventDefault()
    const { inputName } = this.state
    this.setState({
      myName: inputName,
      players: {
        [inputName]: {
          score: 0,
          color: config.colors[0],
        },
      },
    })
  }

  handleCreateGame = (e) => {
    e.preventDefault()
    const { myName, board, deck, selected } = this.state
    let gameTitle = this.state.gameTitle
    if (gameTitle === '') {
      gameTitle = `${myName}'s game`
    }
    this.gameRef = firestore.collection('games').doc(gameTitle)
    this.gameRef.set({
      board,
      deck,
      selected,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    })
    this.activeGameUpdater = window.setInterval(() => {
      this.gameRef.update({
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, 30000)
    this.actionsRef = this.gameRef.collection('actions')
    this.actionsRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data())
      })
    })

    this.actionsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const action = change.doc.data()
          window.created = action.created
          console.log(action)
          this.processAction(action)
          this.actionsRef.doc(change.doc.id).delete()
        }
        if (change.type === 'removed') {
          console.log('Removed action: ', change.doc.data())
        }
      })
    })
    this.setState({
      created: true,
    })
  }

  markPointForDeclarer = (declarer) => {
    if (!declarer) {
      return {}
    }
    const { players } = this.state
    const newScore = players[declarer].score + 1
    const newPlayers = update(players, {
      [declarer]: {
        $merge: {
          score: newScore,
        },
      },
    })
    const gameOver = newScore >= config.playingTo && declarer
    if (gameOver) {
      window.setTimeout(() => {
        this.gameRef.delete()
        clearInterval(this.activeGameUpdater)
      }, 3000)
    }
    return {
      players: newPlayers,
      gameOver,
    }
  }

  processAction = (action) => {
    const { type, payload } = action
    const { players, declarer } = this.state
    switch (type) {
      case 'join':
        if (Object.keys(players).includes(payload.name)) {
          return
        }
        const newPlayers = {
          ...players,
          [payload.name]: {
            score: 0,
            color: config.colors[Object.keys(players).length],
          },
        }
        this.setAndSendState({ players: newPlayers })
        break
      case 'found':
        if (!declarer) {
          this.updateSelected(payload.selected, payload.name)
        }
        break
      default:
        return
    }
  }

  setAndSendState = (update) => {
    this.setState(update)
    this.gameRef.update(update)
  }

  triggerFoundSequence = (selected, name) => {}

  updateSelected = (newSelected, declarer) => {
    const newState = {
      setFound: isSet(newSelected),
      selected: newSelected,
      declarer,
    }
    if (newState.setFound) {
      setTimeout(() => {
        this.removeSet()
      }, 4000)
    }
    this.setAndSendState(newState)
  }

  handleCardClick = (card) => {
    const { myName } = this.state
    if (!this.state.declarer) {
      const newSelected = cardToggle(card, this.state.selected)
      if (isSet(newSelected)) {
        this.updateSelected(newSelected, myName)
      }
      this.setState({
        selected: newSelected,
      })
    }
  }

  handleRedeal = () => {
    const newState = reshuffle(this.state)
    this.setAndSendState(newState)
  }

  removeSet = () => {
    const { declarer, selected } = this.state
    if (isSet(selected)) {
      const newScores = this.markPointForDeclarer(declarer)
      const newState = {
        setFound: false,
        declarer: null,
        timeDeclared: null,
        ...newScores,
        ...removeSelected(this.state),
      }
      this.setAndSendState(newState)
    }
  }

  render() {
    const {
      board,
      deck,
      selected,
      declarer,
      players,
      gameTitle,
      created,
      myName,
      inputName,
    } = this.state

    const { user } = this.props

    if (!user) {
      return (
        <div className="container">
          <button onClick={handleGoogleSignIn} className="btn">
            Sign in
          </button>
        </div>
      )
    }

    if (myName === '') {
      return (
        <div className="container">
          <h4>Enter your name:</h4>
          <form onSubmit={this.handleHostName}>
            <input
              ref={this.nameInputRef}
              autoFocus
              placeholder="hostname"
              value={inputName}
              onChange={(e) => {
                this.setState({ inputName: e.target.value })
              }}
            />
            <button type="submit" className="btn">
              Send
            </button>
          </form>
        </div>
      )
    }
    if (!created) {
      return (
        <div className="container">
          <h4>Name your game:</h4>
          <form onSubmit={this.handleCreateGame}>
            <input
              placeholder={`${myName}'s game`}
              onChange={(e) => {
                this.setState({ gameTitle: e.target.value })
              }}
              value={gameTitle}
            />
            <button type="submit" className="btn">
              Create
            </button>
          </form>
        </div>
      )
    }
    return (
      <Board
        board={board}
        deck={deck}
        selected={selected}
        declarer={declarer}
        handleCardClick={this.handleCardClick}
        // handleDeclare={this.handleDeclare}
        handleRedeal={this.handleRedeal}
        players={players}
        setFound={this.state.setFound}
        gameOver={this.state.gameOver}
        myName={this.state.myName}
      />
    )
  }
}
*/

export default Host
