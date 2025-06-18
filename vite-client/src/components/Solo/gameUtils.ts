import { SoloState, GameState, Players } from '../../utils/models'
import { GAME_CONFIG, DIFFICULTY_CONFIG } from './constants'
import { makeDeck, reshuffle } from '../../utils/helpers'
import { cloneDeep } from 'lodash'

/**
 * Calculate CPU turn interval based on difficulty level
 * New improved curve for better progression
 */
export const calculateIntervalFromDifficulty = (difficulty: number): number => {
  const validDifficulty = Number.isNaN(difficulty) ? DIFFICULTY_CONFIG.default : difficulty

  // New difficulty mapping for better progression
  // Targets: 30s, 25s, 20s, 15s, 10s, 8s, 6s, 4s (approximate)
  const difficultyMap: { [key: number]: number } = {
    1: 1.1, // ~30s
    2: 1.4, // ~25s
    3: 1.7, // ~20s
    4: 2.3, // ~15s
    5: 3.3, // ~10s
    6: 4.0, // ~8s
    7: 6.0, // ~6s
    8: 8.0, // ~4s
  }

  const actualDifficulty =
    difficultyMap[validDifficulty] || difficultyMap[DIFFICULTY_CONFIG.default]
  return 24000 / (5 * actualDifficulty)
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
