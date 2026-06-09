import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import {
  createMultiGame,
  applyFound,
  removeSet,
  applyPenalty,
  multiCardClick,
  redealMulti,
  dealNewBoard,
  GAME_CONFIG,
  isSet,
  type MultiGameState,
  type MultiPlayers,
} from '@react-set/common'

export interface SharedDeviceState extends MultiGameState {
  numPlayers: number | null
}

function createPlayers(num: number): MultiPlayers {
  const players: MultiPlayers = {}
  for (let i = 0; i < num; i++) {
    players[`P${i + 1}`] = {
      name: `P${i + 1}`,
      color: GAME_CONFIG.colors[i % GAME_CONFIG.colors.length],
      score: 0,
      host: false,
    }
  }
  return players
}

export interface SharedDeviceActions {
  startGame: (num: number) => void
  declare: (playerName: string) => void
  handleCardClick: (card: string) => void
  resetGame: () => void
  handleRedeal: () => void
}

export function useSharedDevice(): {
  state: SharedDeviceState
  actions: SharedDeviceActions
} {
  const [state, setState] = useState<SharedDeviceState>(() => ({
    ...createMultiGame('P1'),
    numPlayers: null,
    players: createPlayers(2),
  }))

  const stateRef = useRef(state)
  stateRef.current = state

  const declareTimeoutRef = useRef<number | null>(null)
  const setDisplayTimeoutRef = useRef<number | null>(null)

  const clearDeclareTimeout = useCallback(() => {
    if (declareTimeoutRef.current !== null) {
      clearTimeout(declareTimeoutRef.current)
      declareTimeoutRef.current = null
    }
  }, [])

  const clearSetDisplayTimeout = useCallback(() => {
    if (setDisplayTimeoutRef.current !== null) {
      clearTimeout(setDisplayTimeoutRef.current)
      setDisplayTimeoutRef.current = null
    }
  }, [])

  function expireDeclaration() {
    const s = stateRef.current
    if (s.declarer && !isSet(s.selected)) {
      const penalised = applyPenalty(s, s.declarer)
      setState((prev) => ({ ...prev, players: penalised, declarer: null, selected: [] }))
    }
  }

  function scheduleSetRemoval() {
    clearSetDisplayTimeout()
    setDisplayTimeoutRef.current = window.setTimeout(() => {
      const s = stateRef.current
      if (s.declarer && isSet(s.selected)) {
        setState((prev) => ({ ...prev, ...removeSet(prev, s.declarer!) }))
      }
    }, GAME_CONFIG.setDisplayTime)
  }

  const startGame = useCallback((num: number) => {
    setState((prev) => ({
      ...prev,
      ...dealNewBoard(),
      numPlayers: num,
      players: createPlayers(num),
      gameStarted: true,
    }))
  }, [])

  const declare = useCallback((playerName: string) => {
    const s = stateRef.current
    if (s.declarer !== null) return

    clearDeclareTimeout()
    declareTimeoutRef.current = window.setTimeout(() => {
      expireDeclaration()
    }, GAME_CONFIG.turnTime)

    setState((prev) => ({ ...prev, declarer: playerName }))
  }, [])

  const handleCardClick = useCallback((card: string) => {
    const s = stateRef.current
    if (!s.declarer || s.setFound) return

    const next = multiCardClick(s, card)
    setState((prev) => ({ ...prev, ...next }))

    if (next.setFound && isSet(next.selected)) {
      clearDeclareTimeout()
      scheduleSetRemoval()
    }
  }, [])

  const resetGame = useCallback(() => {
    clearDeclareTimeout()
    clearSetDisplayTimeout()
    setState((prev) => ({
      ...prev,
      ...createMultiGame('P1'),
      numPlayers: null,
      players: createPlayers(2),
      gameStarted: false,
    }))
  }, [])

  const handleRedeal = useCallback(() => {
    setState((prev) => ({ ...prev, ...redealMulti(prev) }))
  }, [])

  useEffect(() => {
    return () => {
      clearDeclareTimeout()
      clearSetDisplayTimeout()
    }
  }, [])

  return {
    state,
    actions: {
      startGame,
      declare,
      handleCardClick,
      resetGame,
      handleRedeal,
    },
  }
}
