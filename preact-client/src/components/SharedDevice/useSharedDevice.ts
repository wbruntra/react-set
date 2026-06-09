import { useEffect, useMemo, useRef } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import {
  createMultiGame,
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
  // State as a signal: `state.value` is always current, so timer callbacks
  // read it directly — no `stateRef` stale-closure workaround needed.
  const state = useSignal<SharedDeviceState>(
    useMemo(() => ({ ...createMultiGame('P1'), numPlayers: null, players: createPlayers(2) }), []),
  )

  // These stay refs: they're imperative timer handles, not state.
  const declareTimeoutRef = useRef<number | null>(null)
  const setDisplayTimeoutRef = useRef<number | null>(null)

  function clearDeclareTimeout() {
    if (declareTimeoutRef.current !== null) {
      clearTimeout(declareTimeoutRef.current)
      declareTimeoutRef.current = null
    }
  }

  function clearSetDisplayTimeout() {
    if (setDisplayTimeoutRef.current !== null) {
      clearTimeout(setDisplayTimeoutRef.current)
      setDisplayTimeoutRef.current = null
    }
  }

  function expireDeclaration() {
    const s = state.value
    if (s.declarer && !isSet(s.selected)) {
      const penalised = applyPenalty(s, s.declarer)
      state.value = { ...s, players: penalised, declarer: null, selected: [] }
    }
  }

  function scheduleSetRemoval() {
    clearSetDisplayTimeout()
    setDisplayTimeoutRef.current = window.setTimeout(() => {
      const s = state.value
      if (s.declarer && isSet(s.selected)) {
        state.value = { ...s, ...removeSet(s, s.declarer) }
      }
    }, GAME_CONFIG.setDisplayTime)
  }

  function startGame(num: number) {
    state.value = {
      ...state.value,
      ...dealNewBoard(),
      numPlayers: num,
      players: createPlayers(num),
      gameStarted: true,
    }
  }

  function declare(playerName: string) {
    const s = state.value
    if (s.declarer !== null) return

    clearDeclareTimeout()
    declareTimeoutRef.current = window.setTimeout(() => {
      expireDeclaration()
    }, GAME_CONFIG.turnTime)

    state.value = { ...s, declarer: playerName }
  }

  function handleCardClick(card: string) {
    const s = state.value
    if (!s.declarer || s.setFound) return

    const next = multiCardClick(s, card)
    state.value = { ...s, ...next }

    if (next.setFound && isSet(next.selected)) {
      clearDeclareTimeout()
      scheduleSetRemoval()
    }
  }

  function resetGame() {
    clearDeclareTimeout()
    clearSetDisplayTimeout()
    state.value = {
      ...state.value,
      ...createMultiGame('P1'),
      numPlayers: null,
      players: createPlayers(2),
      gameStarted: false,
    }
  }

  function handleRedeal() {
    state.value = { ...state.value, ...redealMulti(state.value) }
  }

  useEffect(() => {
    return () => {
      clearDeclareTimeout()
      clearSetDisplayTimeout()
    }
  }, [])

  return {
    state: state.value,
    actions: { startGame, declare, handleCardClick, resetGame, handleRedeal },
  }
}
