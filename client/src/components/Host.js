import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateNickname } from '../redux-helpers'
import { Link } from 'react-router-dom'
import update from 'immutability-helper'
import firebase from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'
import firestore from '../firestore'

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
import { colors } from '../config'

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
        <p>To host a game, sign in with your Google account.</p>
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

export default Host
