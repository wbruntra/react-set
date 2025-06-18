import { SoloState, GameState, Players } from '../../utils/models'
import { GAME_CONFIG, DIFFICULTY_CONFIG } from './constants'
import { makeDeck, reshuffle } from '../../utils/helpers'
import { cloneDeep } from 'lodash'

/**
 * Calculate CPU turn interval based on difficulty level
 */
export const calculateIntervalFromDifficulty = (difficulty: number): number => {
  const validDifficulty = Number.isNaN(difficulty) ? DIFFICULTY_CONFIG.default : difficulty
  return 24000 / (5 * validDifficulty)
}

/**
 * Create initial game state with a shuffled deck and board
 */
export const createGameState = (): GameState & { selected: string[] } => {
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

/**
 * Create initial solo game state
 */
export const createInitialState = (): SoloState => ({
  players: {
    you: {
      score: 0,
      color: GAME_CONFIG.colors[0],
      name: 'you',
    },
    cpu: {
      score: 0,
      color: GAME_CONFIG.colors[1],
      name: 'cpu',
    },
  },
  gameStarted: false,
  myName: 'you',
  setFound: false,
  declarer: null,
  gameOver: null,
  cpuTurnInterval: calculateIntervalFromDifficulty(DIFFICULTY_CONFIG.default),
  startTime: new Date(),
  deck: [],
  board: [],
  selected: [],
  cpuFound: [],
})

/**
 * Get saved difficulty from localStorage or return default
 */
export const getSavedDifficulty = (): number => {
  const saved = window.localStorage.getItem('soloDifficulty')
  return saved ? Number(saved) : DIFFICULTY_CONFIG.default
}

/**
 * Save difficulty to localStorage
 */
export const saveDifficulty = (difficulty: number): void => {
  window.localStorage.setItem('soloDifficulty', difficulty.toString())
}
