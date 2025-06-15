import 'firebase/compat/auth'
import 'firebase/compat/firestore'

import { Action, MultiState } from '../utils/models'
import React, { useEffect, useRef, useState } from 'react'
import {
  cardToggle,
  handleGoogleRedirect,
  isSet,
  makeDeck,
  removeSelected,
  reshuffle,
  updateGame,
} from '../utils/helpers'
import { findKey, isEmpty } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import Board from './Board'
import { Link } from 'react-router-dom'
import PlayerList from './PlayerList'
import Signout from './Signout'
import { colors } from '../config'
import firebase from 'firebase/compat/app'
import firestore from '../firestore'
import update from 'immutability-helper'
import { updateNickname } from '../redux-helpers'

const config = {
  turnTime: 5000,
  colors,
  playingTo: 6,
}

function Host() {
  const userReducer = useSelector((state) => state.user)
  const { user, loading: userLoading } = userReducer
  const dispatch = useDispatch()

  const myFire = useRef({})
  const firebaseRefs = myFire.current

  const initialDeck = makeDeck()
  const initialGameState = {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  }

  const [gameInProgress, setGameInProgress] = useState()
  const [gameTitle, setGameTitle] = useState('')
  const [activeGameUpdater, setActiveGameUpdater] = useState()
  const [gameSubscription, setGameSubscription] = useState()
  const [actionsSubscription, setActionSubscription] = useState()

  const [state, setFullState] = useState({
    gameTitle: '',
    players: {},
    created: false,
    gameStarted: false,
    myName: '',
    setFound: false,
    declarer: null,
    gameOver: '',
    ...initialGameState,
  })

  const currentState = useRef(state)
  currentState.current = state

  useEffect(() => {
    if (user && !isEmpty(user.uid)) {
      firestore
        .collection('games')
        .where('creator_uid', '==', user.uid)
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            console.log(doc.id)
            const oldGame = {
              ...doc.data(),
              gameTitle: doc.id,
            }
            console.log('Old game: ', oldGame)
            setGameInProgress(oldGame)
          })
        })
        .catch(function(error) {
          console.log('Error getting documents: ', error)
        })
    }
  }, [user])

  useEffect(() => {
    return () => {
      if (actionsSubscription) {
        // @ts-ignore
        actionsSubscription()
      }
      if (gameSubscription) {
        // @ts-ignore
        gameSubscription()
      }
    }
  }, [gameSubscription, actionsSubscription])

  useEffect(() => {
    return function() {
      window.clearInterval(activeGameUpdater)
    }
  }, [activeGameUpdater])

  const setState = (update) => {
    setFullState({
      ...currentState.current,
      ...update,
    })
  }

  const handleRejectResume = () => {
    // @ts-ignore
    const { gameTitle } = gameInProgress
    firestore
      .collection('games')
      .doc(gameTitle)
      .delete()
      .then(() => {
        console.log('Deleted old game')
        setGameInProgress(undefined)
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

  const actionsSubscribe = (reference) => {
    let doc
    if (typeof reference === 'string') {
      doc = firestore.collection('games').doc(reference)
    } else {
      doc = reference
    }
    const actions = doc.collection('actions')
    console.log(actions)
    actions.onSnapshot((snapshot) => {
      console.log('got action snapshot')
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const action = change.doc.data()
          console.log(action)
          processAction(action)
          actions.doc(change.doc.id).delete()
        }
        if (change.type === 'removed') {
          console.log('Removed action: ', change.doc.data())
        }
      })
    })
    return actions
  }

  const subscribeToGame = async (gameTitle) => {
    firebaseRefs.game = firestore.collection('games').doc(gameTitle)
    const gameUpdateId = window.setInterval(() => {
      updateGame(firebaseRefs.game, {})
    }, 30000)
    // @ts-ignore
    setActiveGameUpdater(gameUpdateId)

    const unsubscribe = actionsSubscribe(firebaseRefs.game)
    setActionSubscription(unsubscribe)
  }

  const reloadGame = () => {
    // @ts-ignore
    const host = findKey(gameInProgress.players, (player) => player.host)
    // @ts-ignore
    const { gameTitle } = gameInProgress
    setState({ gameTitle })
    subscribeToGame(gameTitle)

    setState({
      myName: host,
      created: true,
      ...gameInProgress,
      // @ts-ignore
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    })
  }

  const handleCreateGame = (e) => {
    e.preventDefault()
    const { myName, board, deck, selected, players, gameOver } = state
    const officialTitle = !isEmpty(gameTitle) ? gameTitle : `${myName}'s game`
    setState({ gameTitle: officialTitle })
    firebaseRefs.game = firestore.collection('games').doc(officialTitle)
    firebaseRefs.game.set({
      creator_uid: user.uid,
      players,
      board,
      deck,
      selected,
      gameOver,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    })
    const updateId = window.setInterval(() => {
      firebaseRefs.game.update({
        lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }, 30000)
    // @ts-ignore

    setActiveGameUpdater(updateId)

    firebaseRefs.actions = actionsSubscribe(officialTitle)

    console.log(firebaseRefs.actions)
    // firebaseRefs.actions.onSnapshot((snapshot: any) => {
    //   console.log('got action snapshot')
    //   snapshot.docChanges().forEach((change: any) => {
    //     if (change.type === 'added') {
    //       const action = change.doc.data() as Action
    //       console.log(action)
    //       processAction(action)
    //       firebaseRefs.actions.doc(change.doc.id).delete()
    //     }
    //     if (change.type === 'removed') {
    //       console.log('Removed action: ', change.doc.data())
    //     }
    //   })
    // })

    // const unsubscribe = actionsSubscribe(officialTitle)
    // setActionSubscription(unsubscribe)

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
          host: true,
          uid: user.uid,
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
    const gameOver = newScore >= config.playingTo ? declarer : ''
    if (gameOver) {
      window.setTimeout(() => {
        firebaseRefs.game.delete()
        clearInterval(activeGameUpdater)
      }, 3000)
    }

    return {
      players: newPlayers,
      gameOver,
    }
  }

  const processAction = (action) => {
    const { type, payload } = action
    const { players, declarer, board } = currentState.current
    switch (type) {
      case 'join':
        if (Object.keys(players).includes(payload.name)) {
          return
        }
        const newPlayers = {
          ...players,
          [payload.name]: {
            host: false,
            uid: payload.uid,
            score: 0,
            color: config.colors[Object.keys(players).length],
          },
        }
        setAndSendState({ players: newPlayers })
        break
      case 'found':
        if (!declarer && verifySelectedOnBoard(board, payload.selected)) {
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
        ...newScores,
        ...removeSelected(currentState.current),
      }
      setAndSendState(newState)
    }
  }

  const setAndSendState = (update) => {
    console.log('updating', currentState.current.gameTitle)
    setState(update)
    updateGame(firebaseRefs.game, update)
  }

  const verifySelectedOnBoard = (board, selected) => {
    for (let i = 0; i < selected.length; i++) {
      if (!board.includes(selected[i])) {
        return false
      }
    }
    return true
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

  const { board, deck, selected, declarer, players, created, gameStarted, myName } = state

  if (userLoading) {
    return 'Loading...'
  }

  if (isEmpty(user)) {
    return (
      <div className="container mt-4">
        <p>To host a game, sign in with your Google account.</p>
        <p>
          <button onClick={handleGoogleRedirect} className="btn btn-info">
            Sign in
          </button>
        </p>
      </div>
    )
  }

  if (gameInProgress && !state.created) {
    return (
      <div className="container">
        <p>You are already hosting a game. Return to it?</p>
        <button className="btn btn-primary mr-5" onClick={() => reloadGame()}>
          YES!
        </button>
        <button className="btn btn-danger" onClick={handleRejectResume}>
          No, remove it
        </button>
      </div>
    )
  }

  if (myName === '') {
    return (
      <div className="container">
        <Signout />
        <h4>Enter your nickname:</h4>
        <form onSubmit={handleSetName}>
          <div className="row mb-4">
            <div className="col-md-3 mb-3 mr-md-4">
              <input
                autoFocus
                placeholder="hostname"
                value={user.nickname}
                onChange={(e) => {
                  dispatch(updateNickname(e.target.value))
                  window.localStorage.setItem('nickname', e.target.value)
                }}
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
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
      <div className="container mt-4">
        <h4>Name your game:</h4>
        <form onSubmit={handleCreateGame}>
          <div className="mb-3">
            <input
              autoFocus
              placeholder={`${myName}'s game`}
              onChange={(e) => {
                setGameTitle(e.target.value)
              }}
              value={gameTitle}
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (!gameStarted) {
    return <PlayerList isHost={true} players={players} setState={setAndSendState} />
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
      gameMode="versus"
    />
  )
}

export default Host
