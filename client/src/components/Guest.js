import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateNickname } from '../redux-helpers'

import Board from './Board'
import { isEmpty } from 'lodash'
import { cardToggle, isSet, handleGoogleSignIn } from '../utils/helpers'
import firebase from 'firebase/app'
import 'firebase/firestore'
import firestore from '../firestore'
import Modal from './Modal'
import { Link } from 'react-router-dom'
import Signout from './Signout'

function GuestFn(props) {
  const userReducer = useSelector((state) => state.user)
  const { user } = userReducer
  const dispatch = useDispatch()
  console.log(user)

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
    // localStorage.setItem('nickname', nameInput)
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

class Guest extends React.Component {
  constructor(props) {
    super(props)
    const initialGameState = {
      deck: [],
      board: [],
      selected: [],
    }
    this.state = {
      popupVisible: false,
      name: '',
      nameInput: '',
      setFound: false,
      displayAnimation: false,
      animatedSet: [],
      declarer: '',
      ...initialGameState,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.declarer && this.state.declarer) {
      this.setState({
        popupVisible: false,
      })
    }
  }

  componentDidMount() {
    const previousNickname = localStorage.getItem('nickname')
    const { gameName } = this.props.match.params
    if (previousNickname) {
      this.setState({
        nameInput: previousNickname,
      })
    }
    this.gameRef = firestore.collection('games').doc(gameName)
    this.gameRef.onSnapshot((doc) => {
      this.processUpdate(doc)
    })
    this.actionsRef = this.gameRef.collection('actions')
  }

  componentWillUnmount = () => {
    if (this.gameRef) {
      this.gameRef()
    }
  }

  processUpdate = (doc) => {
    const updatedState = { ...doc.data() }
    if (isEmpty(updatedState)) {
      return
    }
    console.log('Updating', updatedState)
    this.setState({
      ...updatedState,
      popupVisible: false,
    })
  }

  animate = () => {
    const animatedSet = [...this.state.animatedSet]
    const newSelected = [...this.state.selected, animatedSet.shift()]
    const newState = {
      selected: newSelected,
      animatedSet,
    }
    if (newSelected.length === 3) {
      clearInterval(this.animationId)
      Object.assign(newState, { displayAnimation: false })
    }
    this.setState(newState)
  }

  handleNickname = (e) => {
    e.preventDefault()
    const { nameInput } = this.state
    const playerName = isEmpty(nameInput) ? 'guest' : nameInput
    localStorage.setItem('nickname', playerName)
    this.setState({
      name: playerName,
    })
    this.sendAction({
      type: 'join',
      payload: { name: playerName },
    })
  }

  handleCardClick = (card) => {
    const { name, declarer } = this.state
    if (declarer) {
      return
    }
    const newSelected = cardToggle(card, this.state.selected)
    const newState = {}
    if (newSelected.length === 3) {
      if (isSet(newSelected)) {
        const action = {
          type: 'found',
          payload: { selected: newSelected, name },
        }
        this.sendAction(action)
        newState.popupVisible = true
      } else {
        console.log('Bad set selected!')
        window.setTimeout(this.resetLocalSelected, 1000)
      }
    }

    this.setState({
      ...newState,
      selected: newSelected,
    })
  }

  handleGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken
        // The signed-in user info.
        var user = result.user
        console.log(token, user)
        // ...
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code
        var errorMessage = error.message
        // The email of the user's account used.
        var email = error.email
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential
        // ...
      })
  }

  sendAction = (action) => {
    this.actionsRef.add({
      ...action,
      created: firebase.firestore.FieldValue.serverTimestamp(),
    })
  }

  togglePopup = () => {
    this.setState((state) => ({
      popupVisible: !state.popupVisible,
    }))
  }

  resetLocalSelected = () => {
    // NOTE: Need to be sure a real set wasn't found during the delay
    const { declarer, selected } = this.state
    if (isSet(selected)) {
      return
    }
    if (selected.length === 3 && !declarer) {
      this.setState({
        selected: [],
      })
    }
  }

  render() {
    const { board, deck, selected, name, declarer, players, popupVisible } = this.state
    if (!name) {
      return (
        <div className="container">
          <button onClick={this.handleGoogleSignIn} className="btn">
            Sign in
          </button>
        </div>
      )
    }
    if (!name) {
      return (
        <div className="container">
          <h4>Choose nickname</h4>
          <form onSubmit={this.handleNickname}>
            <input
              type="text"
              placeholder="your name"
              value={this.state.nameInput}
              onChange={(e) => this.setState({ nameInput: e.target.value })}
            />
            <input className="btn" type="submit" />
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
          handleCardClick={this.handleCardClick}
          // handleDeclare={this.handleDeclare}
          players={players}
          setFound={this.state.setFound}
          gameOver={this.state.gameOver}
          // syncing={this.state.syncing}
          myName={this.state.name}
        />
      </React.Fragment>
    )
  }
}

export default GuestFn
