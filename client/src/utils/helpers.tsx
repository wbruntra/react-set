import { shuffle, find, isNil } from 'lodash'
import * as firebase from 'firebase/app'
import { GameState, Player } from './models'

import 'firebase/auth'
import 'firebase/firestore'
import firestore from '../firestore'

export const range = (n: number) => {
  return [...Array(n).keys()]
}

const displaySet = (tuple: Array<number>, rowSize: number = 3) => {
  let matrix
  if (rowSize === 4) {
    matrix = range(3).map((i) => {
      const row = range(4).map((j) => {
        if (tuple.includes(4 * i + j)) {
          return 'x'
        }
        return 'o'
      })
      return row.join('')
    })
  } else {
    matrix = range(4).map((i) => {
      const row = range(3).map((j) => {
        if (tuple.includes(3 * i + j)) {
          return 'x'
        }
        return 'o'
      })
      return row.join('')
    })
  }
  console.log(matrix.join('\n'))
}

export const serializeGame = (state: {
  board: Array<string>
  deck: Array<string>
  selected: Array<string>
}) => {
  const status = JSON.stringify({
    board: state.board,
    deck: state.deck,
    selected: state.selected,
  })
  return status
}

export const countSets = (board: string[], { debug = false, returnWhenFound = false } = {}) => {
  let count = 0
  let candidate = []
  for (let a = 0; a < board.length - 2; a++) {
    for (let b = a + 1; b < board.length - 1; b++) {
      for (let c = b + 1; c < board.length; c++) {
        candidate = [board[a], board[b], board[c]]
        if (isSet(candidate)) {
          if (debug) {
            displaySet([a, b, c])
          }
          count++
          if (returnWhenFound) {
            return count
          }
        }
      }
    }
  }
  return count
}

export const makeDeck = (): string[] => {
  let deck: string[] = []
  range(3).forEach((c) => {
    range(3).forEach((n) => {
      range(3).forEach((s) => {
        range(3).forEach((f) => {
          const card = '' + c + s + n + f
          deck.push(card)
        })
      })
    })
  })
  return deck
}

export const isSet = (selected: Array<string>) => {
  if (selected.length !== 3) {
    return false
  }
  const [a, b, c] = selected
  for (let i = 0; i < 4; i++) {
    const sum = Number(a[i]) + Number(b[i]) + Number(c[i])
    if (sum % 3 !== 0) {
      return false
    }
  }
  return true
}

export const nameThird = (a: string, b: string) => {
  let features
  let missing
  let result = ''
  for (let i = 0; i < 4; i++) {
    if (a[i] === b[i]) {
      result = result + a[i]
    } else {
      features = Number(a[i]) + Number(b[i])
      missing = (3 - features).toString()
      result = result + missing
    }
  }
  return result.trim()
}

export const cardToggle = (card: string, selected: string[]) => {
  if (selected.includes(card)) {
    return selected.filter((c) => c !== card)
  } else {
    return [...selected, card]
  }
}

export const reshuffle = ({ board = [], deck }: GameState, boardSize = 12, minimumSets = 1) => {
  let newDeck = shuffle([...board, ...deck])
  while (
    countSets(newDeck.slice(0, boardSize)) < minimumSets &&
    countSets(newDeck, { returnWhenFound: true }) > 0
  ) {
    newDeck = shuffle(newDeck)
  }
  return {
    deck: newDeck.slice(boardSize),
    board: newDeck.slice(0, boardSize),
  }
}

export const removeSelected = (state: { board: string[]; deck: string[]; selected: string[] }) => {
  const { board, deck, selected } = state
  const newCards = deck.slice(0, 3)
  let newBoard = [...board]
  let newDeck = deck.slice(3)
  selected.forEach((c, i) => {
    let index = newBoard.indexOf(c)
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
  const provider = new firebase.auth.GoogleAuthProvider()
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = result.credential as firebase.auth.OAuthCredential
      var token = credential.accessToken
      // The signed-in user info.
      var user = result.user
      console.log(token, user)
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

export const handleGoogleRedirect = () => {
  const provider = new firebase.auth.GoogleAuthProvider()
  firebase.auth().signInWithRedirect(provider)
}

export const updateGame = (id: string, data: any) => {
  const game = firestore.collection('games').doc(id)
  game.update({
    ...data,
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
  })
}

export const sendAction = (gameId: string, action: any) => {
  const actions = firestore
    .collection('games')
    .doc(gameId)
    .collection('actions')
  actions
    .add({
      ...action,
      created: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(function(docRef) {
      if (action.type === 'found') {
        const docId = docRef.id
        console.log('Document written with ID: ', docId)
        const pendingActionId = docId
        return pendingActionId
        // TODO: Trigger message if action isnt processed in reasonable time
      }
    })
}

export const playerNotRegistered = (players: Player[], name: string) => {
  const player = find(players, ['name', name])
  return isNil(player)
}
