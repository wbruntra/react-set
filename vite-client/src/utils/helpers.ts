import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth'
import { auth, firestore } from '../firebaseConfig'
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  DocumentReference,
} from 'firebase/firestore'

import { CommonState, GameState, Player } from './models'
import {
  range,
  countSets,
  makeDeck,
  isSet,
  nameThird,
  cardToggle,
  reshuffle,
  getRandomSet,
  getBoardStartingWithSet,
} from '@react-set/common'

export {
  range,
  countSets,
  makeDeck,
  isSet,
  nameThird,
  cardToggle,
  reshuffle,
  getRandomSet,
  getBoardStartingWithSet,
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const serializeGame = (state: CommonState) => {
  const status = JSON.stringify({
    board: state.board,
    deck: state.deck,
    selected: state.selected,
  })
  return status
}

export const removeSelected = (state: {
  board: string[]
  deck: string[]
  selected: string[]
}): { board: string[]; deck: string[]; selected: string[] } => {
  const { board, deck, selected } = state
  const newCards = deck.slice(0, 3)
  let newBoard = [...board]
  let newDeck = deck.slice(3)
  selected.forEach((c, i) => {
    const index = newBoard.indexOf(c)
    newBoard[index] = newCards[i]
  })
  while (countSets(newBoard) === 0) {
    ;({ deck: newDeck, board: newBoard } = reshuffle({
      board: newBoard,
      deck: newDeck,
    }))
  }

  return {
    deck: newDeck,
    board: newBoard,
    selected: [],
  }
}

export const handleGoogleSignIn = () => {
  console.log('🚀 Using popup authentication')
  return handleGooglePopup()
}

export const handleGooglePopup = () => {
  console.log('🚀 handleGooglePopup called')
  const provider = new GoogleAuthProvider()

  provider.addScope('email')
  provider.addScope('profile')

  return signInWithPopup(auth, provider)
    .then(function (result) {
      console.log('✅ Popup sign-in successful:', result.user.displayName)
      console.log('✅ User UID:', result.user.uid)
      console.log('✅ User email:', result.user.email)
      return result
    })
    .catch(function (error) {
      console.error('❌ Popup sign-in error:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      throw error
    })
}

export const updateGame = (reference: string | DocumentReference, data: any) => {
  let game: DocumentReference
  if (typeof reference === 'string') {
    game = doc(firestore, 'games', reference)
  } else {
    game = reference
  }
  updateDoc(game, {
    ...data,
    lastUpdate: serverTimestamp(),
  })
}

export const sendAction = (gameId: string, action: any) => {
  const actions = collection(firestore, 'games', gameId, 'actions')
  addDoc(actions, {
    ...action,
    created: serverTimestamp(),
  }).then(function (docRef) {
    if (action.type === 'found') {
      const docId = docRef.id
      console.log('Document written with ID: ', docId)
      const pendingActionId = docId
      return pendingActionId
    }
  })
}

export const playerNotRegistered = (players: Player[], name: string): boolean => {
  const player = players.find((p) => p.name === name)
  return player == null
}
