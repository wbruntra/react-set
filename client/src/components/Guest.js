import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isEmpty } from 'lodash'
import { Link } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'

import { updateNickname } from '../redux-helpers'
import { cardToggle, isSet, handleGoogleSignIn } from '../utils/helpers'
import firestore from '../firestore'
import Modal from './Modal'
import Signout from './Signout'
import Board from './Board'

function Guest(props) {
  const userReducer = useSelector((state) => state.user)
  const { user } = userReducer
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
  })
  const [myName, setMyName] = useState('')
  const [firebaseRefs, setFirebaseRefs] = useState({})

  const setState = (update) => {
    setFullState({
      ...state,
      ...update,
    })
  }

  const handleCardClick = (card) => {
    const { declarer } = state
    if (declarer) {
      return
    }
    const newSelected = cardToggle(card, state.selected)
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
    sendAction({
      type: 'join',
      payload: { name: nameInput },
    })
  }

  const processUpdate = (doc) => {
    const updatedState = { ...doc.data() }
    if (isEmpty(updatedState)) {
      return
    }
    console.log('Updating', updatedState)
    setState({
      ...updatedState,
      popupVisible: false,
    })
  }

  const sendAction = (action) => {
    firebaseRefs.actions.add({
      ...action,
      created: firebase.firestore.FieldValue.serverTimestamp(),
    })
  }

  const togglePopup = () => {
    setState((state) => ({
      popupVisible: !state.popupVisible,
    }))
  }

  useEffect(() => {
    setState({
      popupVisible: false,
    })
  }, [state.declarer])

  useEffect(() => {
    const { gameName } = props.match.params
    firebaseRefs.game = firestore.collection('games').doc(gameName)
    firebaseRefs.game.onSnapshot((doc) => {
      processUpdate(doc)
    })
    firebaseRefs.actions = firebaseRefs.game.collection('actions')

    // return function cleanup() {
    //   if (firebaseRefs.game) {
    //     firebaseRefs.game()
    //   }
    // }
  }, [])

  const { board, deck, selected, declarer, players, popupVisible } = state
  if (userReducer.loading) {
    return 'Loading...'
  }
  if (!user) {
    return (
      <div className="container">
        <p>To join a game, sign in with your Google account.</p>
        <p>
          <button onClick={handleGoogleSignIn} className="btn">
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
          <input className="btn" type="submit" value="Join" />
        </form>
      </div>
    )
  }

  return (
    <React.Fragment>
      <Modal visible={popupVisible}>
        <p className="flow-text center-align">SET!</p>
        <div className="progress">
          <div className="indeterminate" style={{ width: '30%' }} />
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
        setFound={state.setFound}
        gameOver={state.gameOver}
        // syncing={this.state.syncing}
        myName={myName}
      />
    </React.Fragment>
  )
}

export default Guest
