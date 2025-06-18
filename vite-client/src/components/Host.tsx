import React, { useEffect, useRef, useState } from 'react'
import {
  cardToggle,
  handleGoogleSignIn,
  isSet,
  makeDeck,
  removeSelected,
  reshuffle,
  updateGame,
} from '../utils/helpers'
import { findKey, isEmpty } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { auth, firestore } from '../firebaseConfig'
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  DocumentReference,
} from 'firebase/firestore'
import update from 'immutability-helper'

import Board from './Board'
import PlayerList from './PlayerList'
import UserInfo from './UserInfo'
import { colors } from '../config'
import { RootState } from '../store'
import { updateNickname } from '../features/user/userSlice'
import { Action, MultiPlayers, GameState } from '../utils/models'

interface HostState {
  gameTitle: string
  players: MultiPlayers
  created: boolean
  gameStarted: boolean
  myName: string
  setFound: boolean
  declarer: string | null
  gameOver: string | boolean
  board: string[]
  deck: string[]
  selected: string[]
}

const config = {
  turnTime: 5000,
  colors,
  playingTo: 6,
}

// Add MessageCard component at the top after imports
const MessageCard: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body text-center p-4">
            {title && <h4 className="card-title mb-4">{title}</h4>}
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
)

function Host() {
  const userReducer = useSelector((state: RootState) => state.user)
  const { user, loading: userLoading } = userReducer
  const dispatch = useDispatch()

  const myFire = useRef<{ game?: DocumentReference; actions?: any }>({})
  const firebaseRefs = myFire.current

  const initialDeck = makeDeck()
  const initialGameState: GameState & { selected: string[] } = {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected: [],
  }

  const [gameInProgress, setGameInProgress] = useState<any>(undefined) // TODO: Define type for gameInProgress
  const [gameTitle, setGameTitle] = useState<string>('')
  const [activeGameUpdater, setActiveGameUpdater] = useState<number | undefined>(undefined)
  const [gameSubscription, setGameSubscription] = useState<(() => void) | undefined>(undefined)
  const [actionsSubscription, setActionSubscription] = useState<(() => void) | undefined>(
    undefined,
  )

  const [state, setFullState] = useState<HostState>({
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

  // Custom setState to update ref
  const setState = (update: Partial<HostState>) => {
    setFullState((prevState) => {
      const newState = {
        ...prevState,
        ...update,
      }
      currentState.current = newState
      return newState
    })
  }

  useEffect(() => {
    if (user && !isEmpty(user.uid)) {
      const gamesQuery = query(
        collection(firestore, 'games'),
        where('creator_uid', '==', user.uid),
      )
      getDocs(gamesQuery)
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            console.log(doc.id)
            const oldGame = {
              ...doc.data(),
              gameTitle: doc.id,
            }
            console.log('Old game: ', oldGame)
            setGameInProgress(oldGame)
          })
        })
        .catch(function (error) {
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
      if (activeGameUpdater !== undefined) {
        window.clearInterval(activeGameUpdater)
      }
    }
  }, [gameSubscription, actionsSubscription, activeGameUpdater])

  const handleRejectResume = () => {
    const { gameTitle } = gameInProgress
    const gameDocRef = doc(firestore, 'games', gameTitle)
    deleteDoc(gameDocRef).then(() => {
      console.log('Deleted old game')
      setGameInProgress(undefined)
    })
  }

  const handleCardClick = (card: string) => {
    const { myName } = currentState.current
    if (!currentState.current.declarer) {
      const newSelected = cardToggle(card, currentState.current.selected)
      if (isSet(newSelected)) {
        updateSelected(newSelected, myName)
      }
      setState({
        selected: newSelected,
      })
    }
  }

  const handleRedeal = () => {
    const newState = reshuffle(currentState.current)
    setAndSendState(newState)
  }

  const actionsSubscribe = (reference: DocumentReference) => {
    const actions = collection(reference, 'actions')
    const unsubscribe = onSnapshot(actions, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const action = change.doc.data() as Action // Assuming Action interface is defined
          processAction(action)
          deleteDoc(doc(actions, change.doc.id))
        }
        if (change.type === 'removed') {
          console.log('Removed action: ', change.doc.data())
        }
      })
    })
    return unsubscribe
  }

  const subscribeToGame = async (gameTitle: string) => {
    firebaseRefs.game = doc(firestore, 'games', gameTitle)
    const gameUpdateId = window.setInterval(() => {
      updateGame(firebaseRefs.game!, {})
    }, 30000)
    setActiveGameUpdater(gameUpdateId)

    const unsubscribe = actionsSubscribe(firebaseRefs.game)
    setActionSubscription(() => unsubscribe) // Store unsubscribe function
  }

  const reloadGame = () => {
    const host = findKey(gameInProgress.players, (player: any) => player.host)
    const { gameTitle } = gameInProgress
    setState({ gameTitle })
    subscribeToGame(gameTitle)

    setState({
      myName: host,
      created: true,
      ...gameInProgress,
      lastUpdate: serverTimestamp(), // This will be handled by updateGame
    })
  }

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault()
    const { myName, board, deck, selected, players, gameOver, gameStarted } = currentState.current
    const officialTitle = !isEmpty(gameTitle) ? gameTitle : `${myName}'s game`
    setGameTitle(officialTitle) // Update local state for gameTitle
    firebaseRefs.game = doc(firestore, 'games', officialTitle)
    setDoc(firebaseRefs.game, {
      creator_uid: user?.uid,
      players,
      board,
      deck,
      selected,
      gameOver,
      gameStarted, // Include gameStarted in the Firebase document
      lastUpdate: serverTimestamp(),
    })
    const updateId = window.setInterval(() => {
      if (firebaseRefs.game) {
        updateDoc(firebaseRefs.game, {
          lastUpdate: serverTimestamp(),
        })
      }
    }, 30000)
    setActiveGameUpdater(updateId)

    const unsubscribe = actionsSubscribe(firebaseRefs.game)
    setActionSubscription(() => unsubscribe)

    setState({
      created: true,
      gameTitle: officialTitle, // Ensure gameTitle is set in state
    })
  }

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.nickname) {
      setState({
        myName: user.nickname,
        players: {
          [user.nickname]: {
            name: user.nickname,
            host: true,
            uid: user.uid,
            score: 0,
            color: config.colors[0],
          },
        },
      })
    }
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
        if (firebaseRefs.game) {
          deleteDoc(firebaseRefs.game)
        }
        if (activeGameUpdater !== undefined) {
          clearInterval(activeGameUpdater)
        }
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

  const setAndSendState = (update: Partial<HostState>) => {
    console.log('updating', currentState.current.gameTitle)
    setState(update)
    updateGame(firebaseRefs.game!, update)
  }

  const verifySelectedOnBoard = (board: string[], selected: string[]): boolean => {
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
      <MessageCard title="Sign In Required">
        <p className="mb-4">To host a game, sign in with your Google account.</p>
        <button onClick={handleGoogleSignIn} className="btn btn-info btn-lg">
          Sign in
        </button>
      </MessageCard>
    )
  }

  if (gameInProgress && !state.created) {
    return (
      <MessageCard title="Existing Game Found">
        <p className="mb-4">You are already hosting a game. Would you like to return to it?</p>
        <div className="d-flex gap-3 justify-content-center">
          <button className="btn btn-primary" onClick={() => reloadGame()}>
            Yes, Resume Game
          </button>
          <button className="btn btn-danger" onClick={handleRejectResume}>
            No, Delete Game
          </button>
        </div>
      </MessageCard>
    )
  }

  if (myName === '') {
    return (
      <MessageCard title="Enter Your Nickname">
        <UserInfo user={user} />
        <form onSubmit={handleSetName}>
          <div className="mb-4">
            <input
              autoFocus
              placeholder="Enter your nickname"
              className="form-control form-control-lg text-center"
              value={user?.nickname || ''}
              onChange={(e) => {
                dispatch(updateNickname(e.target.value))
                window.localStorage.setItem('nickname', e.target.value)
              }}
            />
          </div>
          <div className="mb-4">
            <button type="submit" className="btn btn-primary btn-lg">
              Set Nickname
            </button>
          </div>
        </form>
        <div className="mt-4">
          <Link to="/" className="btn btn-outline-secondary">
            ← Back to Main Menu
          </Link>
        </div>
      </MessageCard>
    )
  }

  if (!created) {
    return (
      <MessageCard title="Create Your Game">
        <form onSubmit={handleCreateGame}>
          <div className="mb-4">
            <input
              autoFocus
              placeholder={`${myName}'s game`}
              className="form-control form-control-lg text-center"
              onChange={(e) => {
                setGameTitle(e.target.value)
              }}
              value={gameTitle}
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary btn-lg">
              Create Game
            </button>
          </div>
        </form>
      </MessageCard>
    )
  }

  if (!gameStarted) {
    return (
      <PlayerList
        isHost={true}
        players={players}
        setState={setState}
        setAndSendState={setAndSendState}
      />
    )
  }

  return (
    <Board
      board={board}
      deck={deck}
      selected={selected}
      declarer={declarer}
      handleCardClick={handleCardClick}
      handleDeclare={() => {}} // Pass empty function
      handleRedeal={handleRedeal}
      players={players}
      setFound={state.setFound}
      gameOver={state.gameOver}
      myName={state.myName}
      resetGame={() => {}} // Pass empty function
      solo={false} // Set to false for Host mode
      gameMode="versus"
    />
  )
}

export default Host
