import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import {
  mergeIncomingState,
  guestCardClick,
  resetLocalSelected,
  isSet,
  type MultiGameState,
} from '@react-set/common'
import type { GameTransport } from '../../multiplayer/transport'
import { getNickname } from '../../auth'

export interface GuestState extends MultiGameState {
  pending: string | null
}

interface GuestGameOptions {
  transport: GameTransport
  gameId: string
  myName: string
  onGameOver?: () => void
}

export function useGuestGame({ transport, gameId, myName, onGameOver }: GuestGameOptions) {
  const [state, setFullState] = useState<GuestState>({
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

  const stateRef = useRef(state)
  stateRef.current = state

  const transportRef = useRef(transport)
  transportRef.current = transport

  const myNameRef = useRef(myName)
  myNameRef.current = myName

  const joinSentRef = useRef(false)

  const setState = useCallback((update: Partial<GuestState>) => {
    setFullState((prev) => ({ ...prev, ...update }))
  }, [])

  // Subscribe to game state
  useEffect(() => {
    const unsub = transportRef.current.subscribeState(gameId, (remote) => {
      const local = stateRef.current
      const merged = mergeIncomingState(local, remote, myNameRef.current)
      setFullState((prev) => ({
        ...prev,
        ...merged,
        pending: prev.pending,
      }))
    })
    return unsub
  }, [gameId])

  // Subscribe to actions for ACK
  useEffect(() => {
    const unsub = transportRef.current.subscribeActions(gameId, (_action, actionId) => {
      setFullState((prev) => {
        if (prev.pending === actionId) {
          return { ...prev, pending: null }
        }
        return prev
      })
    })
    return unsub
  }, [gameId])

  // Auto-join when name is set
  useEffect(() => {
    if (myName && !joinSentRef.current) {
      joinSentRef.current = true
      transportRef.current.sendAction(gameId, {
        type: 'join',
        payload: { name: myName },
      })
    }
  }, [myName, gameId])

  const handleCardClick = useCallback(
    (card: string) => {
      const s = stateRef.current
      if (s.declarer || s.gameOver) return

      const { state: next, action } = guestCardClick(s, card, myNameRef.current)
      setState({ selected: next.selected, setFound: next.setFound })

      if (action) {
        transportRef.current.sendAction(gameId, action).then((actionId) => {
          setState({ pending: actionId })
        })
      }
    },
    [gameId, setState],
  )

  // Clear stale bad selection after 1000ms
  useEffect(() => {
    const s = stateRef.current
    if (!s.declarer && s.selected.length === 3 && !isSet(s.selected)) {
      const timer = window.setTimeout(() => {
        const reset = resetLocalSelected(stateRef.current)
        setState({ selected: reset.selected })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.selected.join(','), state.declarer])

  return {
    state,
    myName,
    handleCardClick,
  }
}
