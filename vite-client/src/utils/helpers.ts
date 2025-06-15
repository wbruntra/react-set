import 'firebase/compat/auth'
import 'firebase/compat/firestore'

import { CommonState, GameState, Player } from './models'
import { find, isNil, shuffle } from 'lodash'

import _ from 'lodash'
import firebase from 'firebase/compat/app'
import firestore from '../firestore'

export const range = (n: number): number[] => {
  return [...Array(n).keys()]
}

const displaySet = (tuple: number[], rowSize = 3) => {
  let matrix: string[]
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

export const serializeGame = (state: CommonState) => {
  const status = JSON.stringify({
    board: state.board,
    deck: state.deck,
    selected: state.selected,
  })
  return status
}

export const countSets = (
  board: string[],
  { debug = false, returnWhenFound = false } = {},
): number => {
  let count = 0
  let candidate: string[] = []
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

export const isSet = (selected: string[]): boolean => {
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

export const nameThird = (a: string, b: string): string => {
  let result = ''
  for (let i = 0; i < 4; i++) {
    if (a[i] === b[i]) {
      result = result + a[i]
    } else {
      const features = Number(a[i]) + Number(b[i])
      const missing = (3 - features).toString()
      result = result + missing
    }
  }
  return result.trim()
}

export const cardToggle = (card: string, selected: string[]): string[] => {
  if (selected.includes(card)) {
    return selected.filter((c) => c !== card)
  } else {
    return [...selected, card]
  }
}

export const reshuffle = (
  { board = [], deck }: { board: string[]; deck: string[] },
  boardSize = 12,
  minimumSets = 1,
): { board: string[]; deck: string[] } => {
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

export const getRandomSet = (common_traits: number | null = null): string[] => {
  if (common_traits === null) {
    const deck = _.shuffle(makeDeck())
    let board = [...deck.slice(0, 2)]
    const third = nameThird(board[0], board[1])
    return [board[0], board[1], third]
  }

  const result: string[] = ['', '', '']
  let common: (string | boolean)[] = [false, false, false, false]
  const common_indices = _.sampleSize(_.range(4), common_traits)
  common_indices.forEach((i) => {
    common[i] = Math.floor(Math.random() * 3).toString()
  })
  common.forEach((c, index) => {
    const potentialOrder = _.shuffle(['0', '1', '2'])
    for (let j = 0; j < 3; j++) {
      if (c === false) {
        result[j] = result[j] + potentialOrder[j].toString()
      } else {
        result[j] = result[j] + c
      }
    }
  })
  return result
}

export const getBoardStartingWithSet = ({
  startingSetCards = 2,
  boardSize = 12,
  commonTraits,
}: { startingSetCards?: number; boardSize?: number; commonTraits?: number } = {}): {
  board: string[]
  deck: string[]
} => {
  let deck = _.shuffle(makeDeck())
  let set = _.shuffle(getRandomSet(commonTraits))
  let board = set.slice(0, 2)
  const third = set[2]
  deck = deck.filter((c) => !set.includes(c))
  let restBoard = _.shuffle([third, ...deck.slice(0, boardSize - 3)])
  board = [...board, ...restBoard]
  deck = deck.slice(boardSize - 3)
  return {
    board,
    deck,
  }
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
      const credential = result.credential
      var token = (credential as any).accessToken // Type assertion for accessToken
      var user = result.user
      console.log(token, user)
    })
    .catch(function(error) {
      var errorCode = error.code
      var errorMessage = error.message
      var email = error.email
      var credential = error.credential
      console.error(errorCode, errorMessage, email, credential)
    })
}

export const handleGoogleRedirect = () => {
  const provider = new firebase.auth.GoogleAuthProvider()
  firebase.auth().signInWithRedirect(provider)
}

export const updateGame = (
  reference: string | firebase.firestore.DocumentReference,
  data: any,
) => {
  let game: firebase.firestore.DocumentReference
  if (typeof reference === 'string') {
    game = firestore.collection('games').doc(reference)
  } else {
    game = reference
  }
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
      }
    })
}

export const playerNotRegistered = (players: Player[], name: string): boolean => {
  const player = find(players, ['name', name])
  return isNil(player)
}
