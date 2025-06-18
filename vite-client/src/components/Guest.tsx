import React, { useEffect, useRef, useState, Fragment } from 'react'
import { cardToggle, handleGoogleSignIn, isSet } from '../utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Modal, ProgressBar, Spinner } from 'react-bootstrap'
import { auth, firestore } from '../firebaseConfig'
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore'
import { isEmpty } from 'lodash'
import { updateNickname, updateUser } from '../features/user/userSlice'
import { RootState } from '../store'
import { Action, MultiPlayers, GameState } from '../utils/models'

import Board from './Board'
import PlayerList from './PlayerList'
import UserInfo from './UserInfo'

interface GuestState {
  popupVisible: boolean
  setFound: boolean
  displayAnimation: boolean
  animatedSet: string[]
  declarer: string
  deck: string[]
  board: string[]
  selected: string[]
  pending: string | null
  gameStarted: boolean
  gameOver: string | boolean
  players?: MultiPlayers // Players can be undefined initially
}

function Guest() {
  const userReducer = useSelector((state: RootState) => state.user)
  const { user, loading: userLoading } = userReducer
  const dispatch = useDispatch()
  const { gameName } = useParams<{ gameName: string }>() // Get gameName from URL params

  const [state, setFullState] = useState<GuestState>({
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
    gameOver: '', // Initialize gameOver
  })
  const [myName, setMyName] = useState('')
  const [modalDelayMsg, setDelayMsg] = useState<string | undefined>(undefined) // Not used in original, but good for type safety

  const myFire = useRef<{
    game?: DocumentReference
    actions?: CollectionReference
  }>({})
  const firebaseRefs = myFire.current

  const currentState = useRef(state)
  currentState.current = state

  // Custom setState to update ref
  const setState = (update: Partial<GuestState>) => {
    setFullState((prevState) => {
      const newState = {
        ...prevState,
        ...update,
      }
      currentState.current = newState
      return newState
    })
  }

  const resetLocalSelected = () => {
    const { declarer, selected } = currentState.current
    if (isEmpty(declarer) && selected.length === 3 && !isSet(selected)) {
      setState({
        selected: [],
      })
    }
  }

  const sendAction = async (action: Action) => {
    if (!firebaseRefs.actions) {
      console.error('Firebase actions reference not set.')
      return
    }

    console.log('Creating action on', firebaseRefs.actions)
    try {
      const docRef = await addDoc(firebaseRefs.actions, {
        ...action,
        created: serverTimestamp(),
      })

      if (action.type === 'found') {
        const docId = docRef.id
        console.log('Document written with ID: ', docId)
        setState({
          pending: docId,
        })
      }
    } catch (error) {
      console.error('Error sending action:', error)

      // Check if this is an authentication error
      if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
        console.log(
          'Firebase requires authentication for write operations. Guest functionality may be limited.',
        )
        // You could show a message to the user here, or try alternative approaches
        setState({
          pending: null, // Clear pending state since the action failed
        })
      }
    }
  }

  const handleCardClick = async (card: string) => {
    const { declarer, selected } = currentState.current
    if (declarer) {
      return
    }
    const newSelected = cardToggle(card, selected)
    if (newSelected.length > 3) {
      return
    }
    const newState: Partial<GuestState> = {}
    if (newSelected.length === 3) {
      if (isSet(newSelected)) {
        const action: Action = {
          type: 'found',
          payload: { selected: newSelected, name: myName },
        }
        console.log('Found set, sending...')
        await sendAction(action)
        newState.popupVisible = true
      } else {
        console.log('Bad set selected!')
        window.setTimeout(resetLocalSelected, 1000)
      }
    }

    setState({
      ...newState,
      selected: newSelected,
    })
  }

  const handleSetName = async (e: React.FormEvent) => {
    e.preventDefault()
    const nameInput = user?.nickname
    if (isEmpty(nameInput)) {
      return
    }
    setMyName(nameInput)
    const action: Action = {
      type: 'join',
      payload: { name: nameInput, uid: user?.uid },
    }
    await sendAction(action)
  }

  const processUpdate = (doc: any) => {
    const updatedState = { ...doc.data() } as GuestState // Cast to GuestState
    const { selected: mySelected } = currentState.current
    if (isEmpty(updatedState)) {
      return
    }
    console.log('Updating guest state with:', updatedState)

    // Log specifically when gameStarted changes
    if (updatedState.gameStarted !== currentState.current.gameStarted) {
      console.log(
        `Game started status changed: ${currentState.current.gameStarted} -> ${updatedState.gameStarted}`,
      )
    }

    const newSelected =
      mySelected.length < 3 && isEmpty(updatedState.declarer) ? mySelected : updatedState.selected
    console.log('New selected', newSelected)
    setState({
      ...updatedState,
      selected: newSelected,
      popupVisible: false,
    })
  }

  useEffect(() => {
    if (!gameName) {
      console.error('Game name is undefined.')
      return
    }

    console.log('Setting up Firebase listeners for game:', gameName)
    console.log('Current Firebase auth state:', auth.currentUser)

    firebaseRefs.game = doc(firestore, 'games', gameName)

    // Test if we can read from Firebase without authentication
    const unsubGames = onSnapshot(
      firebaseRefs.game,
      (doc) => {
        console.log('Successfully received game update')
        processUpdate(doc)
      },
      (error) => {
        console.error('Error listening to game updates:', error)
        if (error.code === 'permission-denied') {
          console.log('Read access denied. Firebase security rules may require authentication.')
        }
      },
    )

    firebaseRefs.actions = collection(firebaseRefs.game, 'actions')

    const unsubActions = onSnapshot(
      firebaseRefs.actions,
      (snapshot) => {
        console.log('Successfully received actions update')
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
      },
      (error) => {
        console.error('Error listening to actions:', error)
        if (error.code === 'permission-denied') {
          console.log('Actions access denied. Firebase security rules may require authentication.')
        }
      },
    )

    return function cleanup() {
      if (firebaseRefs.game) {
        unsubGames()
      }
      if (firebaseRefs.actions) {
        unsubActions()
      }
    }
  }, [gameName])

  const { board, deck, selected, declarer, players, popupVisible } = state

  if (userLoading) {
    return 'Loading profile...'
  }

  // Allow guests to join without authentication
  if (isEmpty(user)) {
    return (
      <div className="container">
        <h4 className="mb-3">Join as guest:</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const nameInput = (e.target as HTMLFormElement).nickname.value
            if (isEmpty(nameInput)) {
              return
            }
            // Create an anonymous user object for the guest
            const guestUser = {
              uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              nickname: nameInput,
              displayName: nameInput,
              isGuest: true,
            }

            // Store guest user in localStorage for persistence
            localStorage.setItem('guestUser', JSON.stringify(guestUser))
            localStorage.setItem('nickname', nameInput)

            dispatch(updateUser({ user: guestUser, loading: false }))
          }}
        >
          <div className="col-12 col-md-4">
            <input
              autoFocus
              type="text"
              name="nickname"
              placeholder="Enter your nickname"
              required
            />
          </div>
          <div className="col-12 col-md-4">
            <input className="btn btn-primary mt-3 ml-md-3" type="submit" value="Join as Guest" />
          </div>
        </form>

        <hr className="my-4" />

        <p>Or sign in with your Google account for a persistent profile:</p>
        <p>
          <button
            onClick={() => {
              // Clear guest data before signing in with Google auth
              localStorage.removeItem('guestUser')
              handleGoogleSignIn()
            }}
            className="btn btn-outline-info"
          >
            Sign in with Google
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
        <UserInfo user={user} />

        <h4 className="mb-3">Choose your nickname:</h4>
        {user?.isGuest && (
          <div className="alert alert-info mb-3">
            <small>
              👋 Welcome back, {user.nickname}! You're playing as a guest.
              <button
                className="btn btn-link btn-sm p-0 ms-2"
                onClick={() => {
                  localStorage.removeItem('guestUser')
                  handleGoogleSignIn()
                }}
              >
                Sign in with Google
              </button>
              for a permanent profile.
            </small>
          </div>
        )}
        <form onSubmit={handleSetName}>
          <div className="col-12 col-md-4">
            <input
              autoFocus
              type="text"
              placeholder="your name"
              value={user?.nickname || ''}
              onChange={(e) => {
                dispatch(updateNickname(e.target.value))
                // Update localStorage for guest users
                if (user?.isGuest) {
                  const updatedGuestUser = {
                    ...user,
                    nickname: e.target.value,
                    displayName: e.target.value,
                  }
                  localStorage.setItem('guestUser', JSON.stringify(updatedGuestUser))
                }
                window.localStorage.setItem('nickname', e.target.value)
              }}
            />
          </div>
          <div className="col-12 col-md-4">
            <input className="btn btn-primary mt-3 ml-md-3" type="submit" value="Join" />
          </div>
        </form>
      </div>
    )
  }

  const { setFound, gameOver, gameStarted } = currentState.current

  if (!gameStarted) {
    return <PlayerList players={players || {}} isHost={false} setState={setState} /> // Pass empty object if players is undefined
  }

  return (
    <Fragment>
      <Modal show={state.pending && popupVisible}>
        <Modal.Header>
          <Modal.Title>Submitting action...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">SET!</p>
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        </Modal.Body>
      </Modal>
      <Board
        board={board}
        deck={deck}
        selected={selected}
        declarer={declarer}
        handleCardClick={handleCardClick}
        handleDeclare={() => {}} // Pass empty function
        players={players || {}} // Pass empty object if players is undefined
        setFound={setFound}
        gameOver={gameOver}
        myName={myName}
        gameMode="versus"
        resetGame={() => {}} // Pass empty function
        solo={false} // Set to false for Guest mode
      />
    </Fragment>
  )
}

export default Guest
