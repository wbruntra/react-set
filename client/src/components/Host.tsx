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
  handleGoogleRedirect,
  makeDeck,
  cardToggle,
  reshuffle,
  removeSelected,
  isSet,
  updateGame,
} from '../utils/helpers'
import { colors } from '../config'
import PlayerList from './PlayerList'
import { findKey, isEmpty } from 'lodash'
import { Action, MultiState } from '../utils/models'

const config = {
  turnTime: 5000,
  colors,
  playingTo: 6,
}

// const firebaseRefs = {}

interface FirebaseRefs {
  game: any
  actions: any
}

function Host() {
  const userReducer = useSelector((state: any) => state.user)
  const { user, loading: userLoading } = userReducer
  const dispatch = useDispatch()

  const myFire = useRef({})
  const firebaseRefs = myFire.current as FirebaseRefs

  const initialDeck = makeDeck()
  const initialGameState: {
    deck: string[]
    board: string[]
    selected: string[]
  } = {
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

  const [state, setFullState] = useState<MultiState>({
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
        actionsSubscription()
      }
      if (gameSubscription) {
        gameSubscription()
      }
    }
  }, [gameSubscription, actionsSubscription])

  useEffect(() => {
    return function() {
      window.clearInterval(activeGameUpdater)
    }
  }, [activeGameUpdater])

  const setState = (update: Partial<MultiState>) => {
    setFullState({
      ...currentState.current,
      ...update,
    })
  }

  const handleRejectResume = () => {
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

  const handleCardClick = (card: string) => {
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

  const actionsSubscribe = (reference: string | any) => {
    let doc
    if (typeof reference === 'string') {
      doc = firestore.collection('games').doc(reference)
    } else {
      doc = reference
    }
    const actions = doc.collection('actions')
    console.log(actions)
    actions.onSnapshot((snapshot: any) => {
      console.log('got action snapshot')
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added') {
          const action = change.doc.data() as Action
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
    const actionSubscription = actions.onSnapshot((snapshot: any) => {
      console.log('got snapshot')
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added') {
          const action = change.doc.data() as Action
          console.log(action)
          processAction(action)
          actions.doc(change.doc.id).delete()
        }
        if (change.type === 'removed') {
          console.log('Removed action: ', change.doc.data())
        }
      })
    })
    setActionSubscription(actions)
  }

  const subscribeToGame = async (gameTitle: string) => {
    firebaseRefs.game = firestore.collection('games').doc(gameTitle)
    const gameUpdateId = window.setInterval(() => {
      updateGame(firebaseRefs.game, {})
    }, 30000)
    setActiveGameUpdater(gameUpdateId)

    const unsubscribe = actionsSubscribe(firebaseRefs.game)
    setActionSubscription(unsubscribe)
  }

  const reloadGame = () => {
    const host = findKey(gameInProgress.players, (player) => player.host)

    const { gameTitle } = gameInProgress
    setState({ gameTitle })
    subscribeToGame(gameTitle)
    setState({
      myName: host,
      created: true,
      ...gameInProgress,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
    })
  }

  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleSetName = (e: React.FormEvent<HTMLFormElement>) => {
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

  const markPointForDeclarer = (declarer: string) => {
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
        firestore
          .collection('games')
          .doc(gameTitle)
          .delete()
        clearInterval(activeGameUpdater)
      }, 3000)
    }

    return {
      players: newPlayers,
      gameOver,
    }
  }

  const processAction = (action: Action) => {
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

  const removeSet = (selected: string[], declarer: string) => {
    if (isSet(selected)) {
      const newScores = markPointForDeclarer(declarer)
      const newState: Partial<MultiState> = {
        ...currentState.current,
        setFound: false,
        declarer: null,
        ...newScores,
        ...removeSelected(currentState.current),
      }
      setAndSendState(newState)
    }
  }

  const setAndSendState = (update: Partial<MultiState>) => {
    console.log('updating', currentState.current.gameTitle)
    setState(update)
    updateGame(firebaseRefs.game, update)
  }

  const verifySelectedOnBoard = (board: string[], selected: string[]) => {
    for (let i = 0; i < selected.length; i++) {
      if (!board.includes(selected[i])) {
        return false
      }
    }
    return true
  }

  const updateSelected = (newSelected: string[], declarer: string) => {
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
            <div className="col-3 mr-4">
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
            <div className="col-3">
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
