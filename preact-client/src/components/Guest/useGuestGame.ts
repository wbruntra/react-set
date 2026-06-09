import { useEffect, useRef } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import {
  mergeIncomingState,
  guestCardClick,
  resetLocalSelected,
  isSet,
  type MultiGameState,
} from '@react-set/common'
import type { GameTransport } from '../../multiplayer/transport'

export interface GuestState extends MultiGameState {
  pending: string | null
}

interface GuestGameOptions {
  transport: GameTransport
  gameId: string
  myName: string
  onGameOver?: () => void
}

export function useGuestGame({ transport, gameId, myName }: GuestGameOptions) {
  // State as a signal — subscription callbacks read `state.value` (always
  // current) instead of a `stateRef`. `transport` is a stable prop (memoized by
  // the component) and `myName` rides in the effect deps, so no refs for those.
  const state = useSignal<GuestState>({
    board: [],
    deck: [],
    selected: [],
    declarer: null,
    players: {},
    setFound: false,
    gameStarted: false,
    gameOver: null,
    pending: null,
  })

  // One-shot latch: stays a ref (it's an imperative "already fired" guard).
  const joinSentRef = useRef(false)

  // Subscribe to host state. Re-subscribes if myName arrives later, so the
  // merge always has the right name without a `myNameRef`.
  useEffect(() => {
    return transport.subscribeState(gameId, (remote) => {
      const merged = mergeIncomingState(state.value, remote, myName)
      state.value = { ...state.value, ...merged } // pending preserved (merged has none)
    })
  }, [transport, gameId, myName])

  // Subscribe to actions to clear our pending marker once the host consumes it.
  useEffect(() => {
    return transport.subscribeActions(gameId, (_action, actionId) => {
      if (state.value.pending === actionId) {
        state.value = { ...state.value, pending: null }
      }
    })
  }, [transport, gameId])

  // Auto-join once the name is set.
  useEffect(() => {
    if (myName && !joinSentRef.current) {
      joinSentRef.current = true
      transport.sendAction(gameId, { type: 'join', payload: { name: myName } })
    }
  }, [transport, myName, gameId])

  function handleCardClick(card: string) {
    const s = state.value
    if (s.declarer || s.gameOver) return

    const { state: next, action } = guestCardClick(s, card, myName)
    state.value = { ...s, selected: next.selected, setFound: next.setFound }

    if (action) {
      transport.sendAction(gameId, action).then((actionId) => {
        state.value = { ...state.value, pending: actionId }
      })
    }
  }

  // Clear a stale bad selection after a beat.
  useEffect(() => {
    const s = state.value
    if (!s.declarer && s.selected.length === 3 && !isSet(s.selected)) {
      const timer = window.setTimeout(() => {
        state.value = { ...state.value, ...resetLocalSelected(state.value) }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.value.selected.join(','), state.value.declarer])

  return {
    state: state.value,
    myName,
    handleCardClick,
  }
}
