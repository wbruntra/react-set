import {
  isSet,
  nameThird,
  cardToggle,
  removeSelected,
  reshuffle,
  countSets,
  makeDeck,
} from '@react-set/common'
import { GAME_CONFIG, DIFFICULTY_CONFIG, calculateIntervalFromDifficulty } from '@react-set/common'

export interface Players {
  [key: string]: {
    score: number
    color: string
    name: string
  }
}

export interface GameState {
  board: string[]
  deck: string[]
  selected: string[]
  declarer: string | null
  players: Players
  gameStarted: boolean
  setFound: boolean
  gameOver: string | null
  myName: string
  difficulty: number
  elapsedSeconds: number
  startTime: Date
  cpuTurnInterval: number
  cpuFound: string[]
  timeDeclared: number | undefined
  actions: Array<[number, number, 'h' | 'c']>
}

export const getSavedDifficulty = (): number => {
  const saved = localStorage.getItem('soloDifficulty')
  return saved ? Number(saved) : DIFFICULTY_CONFIG.default
}

export const saveDifficulty = (difficulty: number): void => {
  localStorage.setItem('soloDifficulty', difficulty.toString())
}

export function createInitialState(): GameState {
  const difficulty = getSavedDifficulty()
  return {
    board: [],
    deck: [],
    selected: [],
    declarer: null,
    players: {
      you: { score: 0, color: GAME_CONFIG.colors[0], name: 'you' },
      cpu: { score: 0, color: GAME_CONFIG.colors[1], name: 'cpu' },
    },
    gameStarted: false,
    setFound: false,
    gameOver: null,
    myName: 'you',
    difficulty,
    elapsedSeconds: 0,
    startTime: new Date(),
    cpuTurnInterval: calculateIntervalFromDifficulty(difficulty),
    cpuFound: [],
    timeDeclared: undefined,
    actions: [],
  }
}

export function createGameState(): Pick<GameState, 'board' | 'deck' | 'selected'> {
  const initialDeck = makeDeck()
  const selected: string[] = []
  return {
    ...reshuffle({
      deck: initialDeck.slice(12),
      board: initialDeck.slice(0, 12),
    }),
    selected,
  }
}

export function updatePlayerScore(
  players: Players,
  playerName: string,
  delta: number,
): [Players, number] {
  const newScore = (players[playerName]?.score || 0) + delta
  return [
    {
      ...players,
      [playerName]: {
        ...players[playerName],
        score: newScore,
      },
    },
    newScore,
  ]
}

export function processFoundSet(
  state: GameState,
  selectedCards: string[],
  declarer: string,
  roundStartTime: number | null,
): GameState {
  const setsOnBoard = countSets(state.board)
  const timeElapsed =
    roundStartTime && state.timeDeclared ? (state.timeDeclared - roundStartTime) / 1000 : 0
  const who: 'h' | 'c' = declarer === 'you' ? 'h' : 'c'
  const newAction: [number, number, 'h' | 'c'] = [setsOnBoard, Number(timeElapsed.toFixed(1)), who]

  const [newPlayers, newScore] = updatePlayerScore(state.players, declarer, 1)
  const gameOver = newScore >= GAME_CONFIG.playingTo ? declarer : null

  const removedState = removeSelected({
    board: state.board,
    deck: state.deck,
    selected: selectedCards,
  })

  return {
    ...state,
    ...removedState,
    players: newPlayers,
    gameOver,
    setFound: false,
    declarer: null,
    timeDeclared: undefined,
    selected: [],
    cpuFound: [],
    actions: [...state.actions, newAction],
  }
}

export function handleCardClick(state: GameState, card: string): GameState {
  if (state.setFound || state.declarer === 'cpu' || state.gameOver) {
    return state
  }

  const newSelected = cardToggle(card, state.selected)
  let newDeclarer = state.declarer
  let newTimeDeclared = state.timeDeclared

  if (!state.declarer) {
    newDeclarer = state.myName
    newTimeDeclared = Date.now()
  }

  const setFoundStatus = isSet(newSelected)

  return {
    ...state,
    selected: newSelected,
    declarer: newDeclarer,
    timeDeclared: newTimeDeclared,
    setFound: setFoundStatus,
  }
}

export function handleRedeal(state: GameState): GameState {
  return {
    ...state,
    ...reshuffle(state),
  }
}

export function handleStartGame(state: GameState): GameState {
  return {
    ...state,
    gameStarted: true,
    startTime: new Date(),
    elapsedSeconds: 0,
    actions: [],
  }
}

export function handleDifficultyChange(state: GameState, newDifficulty: number): GameState {
  const cpuTurnInterval = calculateIntervalFromDifficulty(newDifficulty)
  saveDifficulty(newDifficulty)
  return {
    ...state,
    cpuTurnInterval,
    difficulty: newDifficulty,
  }
}

export function resetGame(state: GameState): GameState {
  return {
    ...createInitialState(),
    difficulty: state.difficulty,
    cpuTurnInterval: state.cpuTurnInterval,
  }
}

export function handleDeclarationExpired(state: GameState): GameState {
  if (state.declarer && !isSet(state.selected)) {
    const [newPlayers] = updatePlayerScore(state.players, state.declarer, -0.5)
    return {
      ...state,
      players: newPlayers,
      declarer: null,
      timeDeclared: undefined,
      selected: [],
    }
  }
  return state
}

export function handleCpuFoundSet(state: GameState, a: string, b: string, c: string): GameState {
  return {
    ...state,
    declarer: 'cpu',
    selected: [a],
    cpuFound: [b, c],
    setFound: true,
    timeDeclared: Date.now(),
  }
}

export function handleCpuAnimationStep(state: GameState): GameState {
  if (!state.cpuFound || state.cpuFound.length === 0) {
    return state
  }

  const cpuCopy = [...state.cpuFound]
  const newCard = cpuCopy.pop()
  if (!newCard) return state

  const newSelected = [...state.selected, newCard]

  return {
    ...state,
    cpuFound: cpuCopy,
    selected: newSelected,
    setFound: newSelected.length === 3,
  }
}
