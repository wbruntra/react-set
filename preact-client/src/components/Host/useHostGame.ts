import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import {
  createMultiGame,
  applyJoin,
  applyFound,
  removeSet,
  multiCardClick,
  redealMulti,
  dealNewBoard,
  cardsOnBoard,
  isSet,
  GAME_CONFIG,
  type MultiGameState,
} from '@react-set/common'
import type { GameTransport } from '../../multiplayer/transport'
import { getNickname } from '../../auth'

export interface HostState extends MultiGameState {
  gameTitle: string
  created: boolean
  myName: string
}

interface HostGameOptions {
  transport: GameTransport
  uid: string
}

export interface HostGameReturn {
  state: HostState
  gameInProgress: any
  handlers: {
    handleCardClick: (card: string) => void
    handleRedeal: () => void
    handleCreateGame: (title: string) => void
    handleSetName: (name: string) => void
    handleRejectResume: () => void
    reloadGame: (gameId: string) => void
    setGameTitle: (title: string) => void
    startGame: () => void
  }
}

export function useHostGame({ transport, uid }: HostGameOptions): HostGameReturn {
  const [gameInProgress, setGameInProgress] = useState<any>(undefined)
  const [, setGameTitle] = useState('')

  // State as a signal: every handler/subscription reads `state.value` fresh, so
  // there's no `stateRef`. `transport` is a stable prop (memoized in Host.tsx).
  const state = useSignal<HostState>(
    useMemo(
      () => ({
        ...createMultiGame(getNickname() || 'Host'),
        gameTitle: '',
        created: false,
        myName: '',
      }),
      [],
    ),
  )

  // These stay refs — imperative handles (keepalive interval + unsubscribers).
  const updaterRef = useRef<number | null>(null)
  const actionsUnsubRef = useRef<(() => void) | null>(null)
  const gameUnsubRef = useRef<(() => void) | null>(null)

  function setState(update: Partial<HostState>) {
    state.value = { ...state.value, ...update }
  }

  function setAndSend(update: Partial<HostState>) {
    setState(update)
    // Signals update synchronously, so the title is already current here.
    const s = state.value
    if (s.gameTitle) {
      transport.updateState(s.gameTitle, update)
    }
  }

  function removeCurrentSet(declarer: string) {
    const s = state.value
    if (!isSet(s.selected)) return
    setAndSend(removeSet(s, declarer))
  }

  function processAction(action: any) {
    const { type, payload } = action
    const s = state.value

    if (type === 'join') {
      const next = applyJoin(s, payload.name, payload.uid)
      setAndSend({ players: next.players })
    } else if (type === 'found') {
      if (!s.declarer && cardsOnBoard(s.board, payload.selected)) {
        const next = applyFound(s, payload.selected, payload.name)
        setAndSend({ selected: next.selected, declarer: next.declarer, setFound: next.setFound })

        setTimeout(() => {
          removeCurrentSet(payload.name)
        }, GAME_CONFIG.setDisplayTime)
      }
    }
  }

  function handleCardClick(card: string) {
    const s = state.value
    if (s.declarer) return

    const next = multiCardClick({ ...s, declarer: s.myName }, card)
    setState({ selected: next.selected, setFound: next.setFound })

    if (next.setFound && isSet(next.selected)) {
      setTimeout(() => {
        removeCurrentSet(s.myName)
      }, GAME_CONFIG.setDisplayTime)
    }
  }

  function handleRedeal() {
    setAndSend(redealMulti(state.value))
  }

  function handleSetName(name: string) {
    if (!name.trim()) return

    setState({
      myName: name,
      players: {
        [name]: { name, color: GAME_CONFIG.colors[0], score: 0, host: true, uid },
      },
    })
  }

  async function handleCreateGame(title: string) {
    const s = state.value
    const officialTitle = title.trim() || `${s.myName}'s game`
    setGameTitle(officialTitle)

    const { players, board, deck, selected, gameOver, gameStarted } = s
    await transport.createGame(officialTitle, {
      creator_uid: uid,
      players,
      board,
      deck,
      selected,
      gameOver,
      gameStarted,
    })

    // Keepalive every 30s
    updaterRef.current = window.setInterval(() => {
      transport.updateState(officialTitle, {} as any)
    }, 30000)

    // Subscribe to guest actions
    actionsUnsubRef.current?.()
    actionsUnsubRef.current = transport.subscribeActions(officialTitle, (action, actionId) => {
      processAction(action)
      transport.consumeAction(officialTitle, actionId)
    })

    setState({ created: true, gameTitle: officialTitle })
  }

  function startGame() {
    setAndSend({ ...dealNewBoard(), gameStarted: true })
  }

  function reloadGame(gameId: string) {
    const oldGame = gameInProgress
    if (!oldGame) return

    const host = Object.keys(oldGame.players || {}).find((k: string) => oldGame.players[k]?.host)

    setGameTitle(gameId)
    gameUnsubRef.current?.()
    gameUnsubRef.current = transport.subscribeState(gameId, (remote) => {
      setState({ ...remote, created: true, gameTitle: gameId })
    })

    actionsUnsubRef.current?.()
    actionsUnsubRef.current = transport.subscribeActions(gameId, (action, actionId) => {
      processAction(action)
      transport.consumeAction(gameId, actionId)
    })

    setState({
      myName: host || '',
      created: true,
      gameTitle: gameId,
      ...oldGame,
    })
  }

  async function handleRejectResume() {
    const gip = gameInProgress
    if (gip?.gameTitle) {
      await transport.deleteGame(gip.gameTitle)
    }
    setGameInProgress(undefined)
  }

  // Check for a resumable game when the UID is ready.
  useEffect(() => {
    if (!uid) return
    transport.findResumable(uid).then((games) => {
      if (games.length > 0) {
        setGameInProgress(games[0])
      }
    })
  }, [transport, uid])

  // Cleanup imperative handles on unmount.
  useEffect(() => {
    return () => {
      if (updaterRef.current !== null) clearInterval(updaterRef.current)
      actionsUnsubRef.current?.()
      gameUnsubRef.current?.()
    }
  }, [])

  return {
    state: state.value,
    gameInProgress,
    handlers: {
      handleCardClick,
      handleRedeal,
      handleCreateGame,
      handleSetName,
      handleRejectResume,
      reloadGame,
      setGameTitle,
      startGame,
    },
  }
}
