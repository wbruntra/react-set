import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash'
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore'
import { cardToggle, isSet } from '../../utils/helpers'
import { auth, firestore } from '../../firebaseConfig'
import { Action, MultiPlayers } from '../../utils/models'

interface User {
  uid?: string
  nickname?: string
  displayName?: string
  email?: string
  isGuest?: boolean
  [key: string]: any
}

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
  players?: MultiPlayers
}

export interface UseGuestGameReturn {
  state: GuestState
  myName: string
  handlers: {
    handleCardClick: (card: string) => void
    handleSetName: (e: React.FormEvent) => void
    setState: (update: Partial<GuestState>) => void
  }
  firebaseRefs: {
    game?: DocumentReference
    actions?: CollectionReference
  }
}

export function useGuestGame(user: User | null): UseGuestGameReturn {
  const { gameName } = useParams<{ gameName: string }>()

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
    gameOver: '',
  })

  const [myName, setMyName] = useState('')

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
        setState({
          pending: null,
        })
      }
    }
  }

  const processUpdate = (doc: any) => {
    const updatedState = { ...doc.data() } as GuestState
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

  // Event handlers
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

  // Firebase listeners setup
  useEffect(() => {
    if (!gameName) {
      console.error('Game name is undefined.')
      return
    }

    console.log('Setting up Firebase listeners for game:', gameName)
    console.log('Current Firebase auth state:', auth.currentUser)

    firebaseRefs.game = doc(firestore, 'games', gameName)

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

  return {
    state,
    myName,
    handlers: {
      handleCardClick,
      handleSetName,
      setState,
    },
    firebaseRefs,
  }
}
