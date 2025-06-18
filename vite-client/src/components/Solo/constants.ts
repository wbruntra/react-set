import { colors } from '@/config'

// Game configuration constants
export const GAME_CONFIG = {
  turnTime: 4000, // Time allowed to complete a set after declaring
  colors: colors,
  playingTo: 6, // Score needed to win
  cpuDelay: 1200, // Delay between CPU card selection animations
  setDisplayTime: 2000, // Time to display a completed set before removing
} as const

// Difficulty settings
export const DIFFICULTY_CONFIG = {
  min: 1,
  max: 8,
  step: 1,
  default: 2,
} as const
