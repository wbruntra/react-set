import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import {
  createMultiGame,
  applyJoin,
  applyFound,
  removeSet,
  markPoint,
  applyPenalty,
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
  const [gameTitle, setGameTitle] = useState('')
  const [readyToPlay, setReadyToPlay] = useState(false)

  const [state, setFullState] = useState<HostState>(() => ({
    ...createMultiGame(getNickname() || 'Host'),
    gameTitle: '',
    created: false,
    myName: '',
  }))

  const stateRef = useRef(state)
  stateRef.current = state

  const transportRef = useRef(transport)
  transportRef.current = transport

  const updaterRef = useRef<number | null>(null)
  const actionsUnsubRef = useRef<(() => void) | null>(null)
  const gameUnsubRef = useRef<(() => void) | null>(null)

  const setState = useCallback((update: Partial<HostState>) => {
    setFullState((prev) => {
      const next = { ...prev, ...update }
      stateRef.current = next
      return next
    })
  }, [])

  const setAndSend = useCallback(
    (update: Partial<HostState>) => {
      setState(update)
      const s = stateRef.current
      if (s.gameTitle) {
        transportRef.current.updateState(s.gameTitle, update)
      }
    },
    [setState],
  )

  const removeCurrentSet = useCallback(
    (declarer: string) => {
      const s = stateRef.current
      if (!isSet(s.selected)) return

      const next = removeSet(s, declarer)
      setAndSend(next)
    },
    [setAndSend],
  )

  const processAction = useCallback(
    (action: any) => {
      const { type, payload } = action
      const s = stateRef.current

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
    },
    [setAndSend, removeCurrentSet],
  )

  const handleCardClick = useCallback(
    (card: string) => {
      const s = stateRef.current
      if (s.declarer) return

      const next = multiCardClick({ ...s, declarer: s.myName }, card)
      setState({ selected: next.selected, setFound: next.setFound })

      if (next.setFound && isSet(next.selected)) {
        setTimeout(() => {
          removeCurrentSet(s.myName)
        }, GAME_CONFIG.setDisplayTime)
      }
    },
    [setState, removeCurrentSet],
  )

  const handleRedeal = useCallback(() => {
    const next = redealMulti(stateRef.current)
    setAndSend(next)
  }, [setAndSend])

  const handleSetName = useCallback(
    (name: string) => {
      if (!name.trim()) return

      setState({
        myName: name,
        players: {
          [name]: {
            name,
            color: GAME_CONFIG.colors[0],
            score: 0,
            host: true,
            uid,
          },
        },
      })
    },
    [setState, uid],
  )

  const handleCreateGame = useCallback(
    async (title: string) => {
      const s = stateRef.current
      const officialTitle = title.trim() || `${s.myName}'s game`
      setGameTitle(officialTitle)

      const { players, board, deck, selected, gameOver, gameStarted } = s
      await transportRef.current.createGame(officialTitle, {
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
        transportRef.current.updateState(officialTitle, {} as any)
      }, 30000)

      // Subscribe to guest actions
      actionsUnsubRef.current?.()
      actionsUnsubRef.current = transportRef.current.subscribeActions(
        officialTitle,
        (action, actionId) => {
          processAction(action)
          transportRef.current.consumeAction(officialTitle, actionId)
        },
      )

      setState({ created: true, gameTitle: officialTitle })
    },
    [uid, processAction],
  )

  const startGame = useCallback(() => {
    const next = dealNewBoard()
    setAndSend({ ...next, gameStarted: true })
  }, [setAndSend])

  const reloadGame = useCallback(
    (gameId: string) => {
      const oldGame = gameInProgress
      if (!oldGame) return

      const host = Object.keys(oldGame.players || {}).find((k: string) => oldGame.players[k]?.host)

      setGameTitle(gameId)
      gameUnsubRef.current?.()
      gameUnsubRef.current = transportRef.current.subscribeState(gameId, (remote) => {
        setState({ ...remote, created: true, gameTitle: gameId })
      })

      actionsUnsubRef.current?.()
      actionsUnsubRef.current = transportRef.current.subscribeActions(
        gameId,
        (action, actionId) => {
          processAction(action)
          transportRef.current.consumeAction(gameId, actionId)
        },
      )

      setState({
        myName: host || '',
        created: true,
        gameTitle: gameId,
        ...oldGame,
      })
    },
    [gameInProgress, processAction],
  )

  const handleRejectResume = useCallback(async () => {
    const gip = gameInProgress
    if (gip?.gameTitle) {
      await transportRef.current.deleteGame(gip.gameTitle)
    }
    setGameInProgress(undefined)
  }, [gameInProgress])

  // Check for resumable game when UID is ready
  useEffect(() => {
    if (!uid) return
    transportRef.current.findResumable(uid).then((games) => {
      if (games.length > 0) {
        setGameInProgress(games[0])
      }
    })
  }, [uid])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updaterRef.current !== null) clearInterval(updaterRef.current)
      actionsUnsubRef.current?.()
      gameUnsubRef.current?.()
    }
  }, [])

  return {
    state,
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
