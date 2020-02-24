import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isEmpty } from 'lodash'
import { Link } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'

import { updateNickname } from '../redux-helpers'
import { cardToggle, isSet, handleGoogleSignIn, handleGoogleRedirect } from '../utils/helpers'
import firestore from '../firestore'
import Modal from './Modal'
import Signout from './Signout'
import Board from './Board'
import PlayerList from './PlayerList'
import ProgressBar from 'react-bootstrap/ProgressBar'

function Guest(props) {
  const userReducer = useSelector((state) => state.user)
  const { user, loading: userLoading } = userReducer
  const dispatch = useDispatch()

  const [state, setFullState] = useState({
    popupVisible: false,
    setFound: false,
    displayAnimation: false,
    animatedSet: [],
    declarer: '',
    deck: [],
    board: [],
    selected: [],
    pending: null,
    gameStarted: false,
  })
  const [myName, setMyName] = useState('')
  const [modalDelayMsg, setDelayMsg] = useState()

  const myFire = useRef({})
  const firebaseRefs = myFire.current
  // const [firebaseRefs, setFirebaseRefs] = useState({})

  const currentState = useRef(state)
  currentState.current = state

  const setState = (update) => {
    setFullState({
      ...currentState.current,
      ...update,
    })
  }

  const handleCardClick = (card) => {
    const { declarer, selected } = currentState.current
    if (declarer) {
      return
    }
    const newSelected = cardToggle(card, selected)
    const newState = {}
    if (newSelected.length === 3) {
      if (isSet(newSelected)) {
        const action = {
          type: 'found',
          payload: { selected: newSelected, name: myName },
        }
        sendAction(action)
        newState.popupVisible = true
      } else {
        console.log('Bad set selected!')
        window.setTimeout(this.resetLocalSelected, 1000)
      }
    }

    setState({
      ...newState,
      selected: newSelected,
    })
  }

  const handleSetName = (e) => {
    e.preventDefault()
    const nameInput = user.nickname
    if (isEmpty(nameInput)) {
      return
    }
    setMyName(nameInput)
    const action = {
      type: 'join',
      payload: { name: nameInput, uid: user.uid },
    }
    sendAction(action)
  }

  const processUpdate = (doc) => {
    const updatedState = { ...doc.data() }
    if (isEmpty(updatedState)) {
      return
    }
    console.log('Updating', updatedState)
    // Don't mess with selected cards unless necessary
    const newSelected = isEmpty(updatedState.declarer)
      ? currentState.current.selected
      : updatedState.selected
    setState({
      ...updatedState,
      selected: newSelected,
      popupVisible: false,
    })
  }

  const sendAction = (action) => {
    firebaseRefs.actions
      .add({
        ...action,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(function(docRef) {
        if (action.type === 'found') {
          const docId = docRef.id
          console.log('Document written with ID: ', docId)
          setState({
            pending: docId,
          })
          // TODO: Trigger message if action isnt processed in reasonable time
        }
      })
  }

  useEffect(() => {
    const { gameName } = props.match.params
    firebaseRefs.game = firestore.collection('games').doc(gameName)
    const unsubGames = firebaseRefs.game.onSnapshot((doc) => {
      processUpdate(doc)
    })
    firebaseRefs.actions = firebaseRefs.game.collection('actions')

    const unsubActions = firebaseRefs.actions.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          const { pending } = currentState.current
          if (pending === change.doc.id) {
            console.log('Pending action removed!')
            setState({
              pending: null,
            })
          }
        }
      })
    })

    return function cleanup() {
      if (firebaseRefs.game) {
        unsubGames()
      }
      if (firebaseRefs.actions) {
        unsubActions()
      }
    }
  }, [])

  const { board, deck, selected, declarer, players, popupVisible } = state

  if (userReducer.loading) {
    return 'Loading profile...'
  }

  if (isEmpty(user)) {
    return (
      <div className="container">
        <p>To join a game, sign in with your Google account.</p>
        <p>
          <button onClick={handleGoogleRedirect} className="btn btn-info">
            Sign in
          </button>
        </p>
        <p>
          <Link to="/lobby">Back</Link>
        </p>
      </div>
    )
  }
  if (!myName) {
    return (
      <div className="container">
        <Signout />

        <h4>Choose nickname</h4>
        <form onSubmit={handleSetName}>
          <input
            autoFocus
            type="text"
            placeholder="your name"
            value={user.nickname}
            onChange={(e) => {
              dispatch(updateNickname(e.target.value))
              window.localStorage.setItem('nickname', e.target.value)
            }}
          />
          <input className="btn btn-primary ml-3" type="submit" value="Join" />
        </form>
      </div>
    )
  }

  const { setFound, gameOver, gameStarted } = currentState.current

  if (!gameStarted) {
    return <PlayerList players={players} isHost={false} />
  }

  return (
    <React.Fragment>
      <Modal visible={state.pending && popupVisible}>
        <p className="text-center">SET!</p>
        <div>
          <ProgressBar animated now={100} />
        </div>
      </Modal>
      <Board
        board={board}
        deck={deck}
        selected={selected}
        declarer={declarer}
        handleCardClick={handleCardClick}
        // handleDeclare={this.handleDeclare}
        players={players}
        setFound={setFound}
        gameOver={gameOver}
        // syncing={this.state.syncing}
        myName={myName}
        gameMode="versus"
      />
    </React.Fragment>
  )
}

export default Guest
