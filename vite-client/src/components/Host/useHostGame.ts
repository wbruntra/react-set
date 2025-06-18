import { useState, useEffect, useRef } from 'react'
import { findKey, isEmpty } from 'lodash'
import { useDispatch } from 'react-redux'
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
import {
  cardToggle,
  isSet,
  makeDeck,
  removeSelected,
  reshuffle,
  updateGame,
} from '@/utils/helpers'
import { firestore } from '@/firebaseConfig'
import { Action, MultiPlayers, GameState } from '@/utils/models'
import { HOST_CONFIG } from './constants'

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

const config = HOST_CONFIG

export interface UseHostGameReturn {
  state: HostState
  gameInProgress: any
  handlers: {
    handleCardClick: (card: string) => void
    handleRedeal: () => void
    handleCreateGame: (e: React.FormEvent) => void
    handleSetName: (e: React.FormEvent) => void
    handleRejectResume: () => void
    reloadGame: () => void
    setGameTitle: (title: string) => void
    setState: (update: Partial<HostState>) => void
    setAndSendState: (update: Partial<HostState>) => void
  }
}

/**
 * Main game logic hook for Host component
 */
export const useHostGame = (user: any): UseHostGameReturn => {
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

  const [gameInProgress, setGameInProgress] = useState<any>(undefined)
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

  // Check for existing games when user loads
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

  // Cleanup subscriptions on unmount
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

  const actionsSubscribe = (reference: DocumentReference) => {
    const actions = collection(reference, 'actions')
    const unsubscribe = onSnapshot(actions, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const action = change.doc.data() as Action
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
    setActionSubscription(() => unsubscribe)
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

  const verifySelectedOnBoard = (board: string[], selected: string[]): boolean => {
    for (let i = 0; i < selected.length; i++) {
      if (!board.includes(selected[i])) {
        return false
      }
    }
    return true
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

  // Event handlers
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

  const reloadGame = () => {
    const host = findKey(gameInProgress.players, (player: any) => player.host)
    const { gameTitle } = gameInProgress
    setState({ gameTitle })
    subscribeToGame(gameTitle)

    setState({
      myName: host,
      created: true,
      ...gameInProgress,
      lastUpdate: serverTimestamp(),
    })
  }

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault()
    const { myName, board, deck, selected, players, gameOver, gameStarted } = currentState.current
    const officialTitle = !isEmpty(gameTitle) ? gameTitle : `${myName}'s game`
    setGameTitle(officialTitle)
    firebaseRefs.game = doc(firestore, 'games', officialTitle)
    setDoc(firebaseRefs.game, {
      creator_uid: user?.uid,
      players,
      board,
      deck,
      selected,
      gameOver,
      gameStarted,
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
      gameTitle: officialTitle,
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

  return {
    state,
    gameInProgress,
    handlers: {
      handleCardClick,
      handleRedeal,
      handleCreateGame,
      handleSetName,
      handleRejectResume,
      reloadGame,
      setGameTitle,
      setState,
      setAndSendState,
    },
  }
}
