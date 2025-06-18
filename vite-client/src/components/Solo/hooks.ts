import { useState, useEffect } from 'react'
import { shuffle } from 'lodash'
import {
  nameThird,
  isSet,
  cardToggle,
  removeSelected as removeSelectedCards,
} from '../../utils/helpers'
import { SoloState, Players } from '../../utils/models'
import { GAME_CONFIG } from './constants'
import update from 'immutability-helper'

export interface GameTimersHook {
  startCpuTimer: (
    gameState: SoloState & { difficulty: number },
    setState: React.Dispatch<React.SetStateAction<SoloState & { difficulty: number }>>,
    triggerFlash: () => void,
  ) => number
  startCpuAnimation: (
    gameState: SoloState & { difficulty: number },
    setState: React.Dispatch<React.SetStateAction<SoloState & { difficulty: number }>>,
  ) => number
  startSetFoundTimer: (
    gameState: SoloState & { difficulty: number },
    processFoundSet: (selectedCards: string[], declarer: string) => void,
  ) => number
  startDeclarationTimer: (
    gameState: SoloState & { difficulty: number },
    setState: React.Dispatch<React.SetStateAction<SoloState & { difficulty: number }>>,
  ) => number
}

/**
 * Update player score utility function
 */
export const updatePlayerScore = (
  players: Players,
  playerName: string,
  delta: number,
): [Players, number] => {
  const newScore = (players[playerName]?.score || 0) + delta
  const newPlayers = update(players, {
    [playerName]: {
      $merge: {
        score: newScore,
      },
    },
  })
  return [newPlayers as Players, newScore]
}

/**
 * Custom hook for managing all game timers
 */
export const useGameTimers = (): GameTimersHook => {
  const startCpuTimer = (
    gameState: SoloState & { difficulty: number },
    setState: React.Dispatch<React.SetStateAction<SoloState & { difficulty: number }>>,
    triggerFlash: () => void,
  ) => {
    return window.setInterval(() => {
      setState((prevState) => {
        const { board, declarer, gameOver } = prevState
        if (declarer || gameOver) {
          return prevState
        }

        // Try to find a set
        const [a, b] = shuffle(board).slice(0, 2)
        const c = nameThird(a, b)
        if (board.includes(c)) {
          // Found a set, trigger flash animation and start the selection
          triggerFlash()

          return {
            ...prevState,
            declarer: 'cpu',
            selected: [a],
            cpuFound: [b, c],
            setFound: true,
          }
        }
        return prevState
      })
    }, gameState.cpuTurnInterval)
  }

  const startCpuAnimation = (
    gameState: SoloState & { difficulty: number },
    setState: React.Dispatch<React.SetStateAction<SoloState & { difficulty: number }>>,
  ) => {
    return window.setInterval(() => {
      setState((prevState) => {
        const { selected, cpuFound } = prevState
        if (!cpuFound || cpuFound.length === 0) {
          return prevState
        }

        const cpuCopy = [...cpuFound]
        const newSelected = [...selected, cpuCopy.pop()!]

        // If we've selected all 3 cards, mark the set as complete
        if (newSelected.length === 3) {
          return {
            ...prevState,
            cpuFound: cpuCopy,
            selected: newSelected,
            setFound: true,
          }
        }

        return {
          ...prevState,
          cpuFound: cpuCopy,
          selected: newSelected,
        }
      })
    }, GAME_CONFIG.cpuDelay)
  }

  const startSetFoundTimer = (
    gameState: SoloState & { difficulty: number },
    processFoundSet: (selectedCards: string[], declarer: string) => void,
  ) => {
    return window.setTimeout(() => {
      processFoundSet(gameState.selected, gameState.declarer!)
    }, GAME_CONFIG.setDisplayTime)
  }

  const startDeclarationTimer = (
    gameState: SoloState & { difficulty: number },
    setState: React.Dispatch<React.SetStateAction<SoloState & { difficulty: number }>>,
  ) => {
    return window.setTimeout(() => {
      setState((prevState) => {
        if (prevState.declarer && !isSet(prevState.selected)) {
          const [newPlayers] = updatePlayerScore(prevState.players, prevState.declarer, -0.5)
          return {
            ...prevState,
            players: newPlayers,
            declarer: null,
            timeDeclared: undefined,
            selected: [],
          }
        }
        return prevState
      })
    }, GAME_CONFIG.turnTime)
  }

  return {
    startCpuTimer,
    startCpuAnimation,
    startSetFoundTimer,
    startDeclarationTimer,
  }
}
