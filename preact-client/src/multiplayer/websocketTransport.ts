import type { GameTransport, GameSummary, Unsubscribe, ActionId } from './transport'
import type { GameAction, MultiGameState } from '@react-set/common'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectDelay = 1000
let requestCounter = 0
const pendingRequests = new Map<
  string,
  { resolve: (value: any) => void; reject: (err: Error) => void }
>()
const stateCallbacks = new Map<string, Set<(state: MultiGameState) => void>>()
const actionCallbacks = new Map<string, Set<(action: GameAction, actionId: string) => void>>()
const pendingMessages: string[] = []

function getWsUrl(): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${location.host}/ws`
}

function flushQueue() {
  const socket = ws
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  while (pendingMessages.length > 0) {
    socket.send(pendingMessages.shift()!)
  }
}

function connect(): WebSocket {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws
  }

  ws = new WebSocket(getWsUrl())

  ws.addEventListener('message', (event) => {
    let msg: any
    try {
      msg = JSON.parse(event.data as string)
    } catch {
      return
    }

    if (msg.requestId && pendingRequests.has(msg.requestId)) {
      const { resolve, reject } = pendingRequests.get(msg.requestId)!
      pendingRequests.delete(msg.requestId)
      if (msg.type === 'error') {
        reject(new Error(msg.message))
      } else {
        resolve(msg)
      }
    }

    if (msg.type === 'stateUpdate' && msg.gameId) {
      const cbs = stateCallbacks.get(msg.gameId)
      if (cbs) {
        cbs.forEach((cb) => cb(msg.state))
      }
    }

    if (msg.type === 'actionReceived' && msg.gameId) {
      const cbs = actionCallbacks.get(msg.gameId)
      if (cbs) {
        cbs.forEach((cb) => cb(msg.action, msg.actionId))
      }
    }

    if (msg.type === 'actionConsumed' && msg.gameId) {
      const cbs = actionCallbacks.get(msg.gameId)
      if (cbs) {
        cbs.forEach((cb) => cb({ type: 'consumed' } as any, msg.actionId))
      }
    }
  })

  ws.addEventListener('close', () => {
    ws = null
    if (reconnectTimer === null) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        reconnectDelay = Math.min(reconnectDelay * 2, 30000)
        connect()
      }, reconnectDelay)
    }
  })

  ws.addEventListener('open', () => {
    reconnectDelay = 1000
    flushQueue()

    for (const gameId of stateCallbacks.keys()) {
      safeSend({ type: 'subscribeState', gameId })
    }
    for (const gameId of actionCallbacks.keys()) {
      safeSend({ type: 'subscribeActions', gameId })
    }
  })

  return ws
}

function safeSend(msg: Record<string, unknown>) {
  const data = JSON.stringify(msg)
  const socket = connect()
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(data)
  } else {
    pendingMessages.push(data)
  }
}

function sendMessage(msg: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = String(++requestCounter)
    const fullMsg = { ...msg, requestId }

    pendingRequests.set(requestId, { resolve, reject })
    safeSend(fullMsg)
  })
}

function sendMessageFireAndForget(msg: Record<string, unknown>): void {
  safeSend(msg)
}

export function createWebSocketTransport(): GameTransport {
  connect()

  return {
    async createGame(id, state) {
      const resp = await sendMessage({ type: 'createGame', gameId: id, state })
      return resp.gameId as string
    },

    async updateState(id, partial) {
      sendMessageFireAndForget({ type: 'updateState', gameId: id, partial })
    },

    subscribeState(id, cb) {
      if (!stateCallbacks.has(id)) {
        stateCallbacks.set(id, new Set())
      }
      stateCallbacks.get(id)!.add(cb)

      sendMessage({ type: 'subscribeState', gameId: id }).catch(() => {})

      return () => {
        const cbs = stateCallbacks.get(id)
        if (cbs) {
          cbs.delete(cb)
          if (cbs.size === 0) {
            stateCallbacks.delete(id)
            sendMessageFireAndForget({ type: 'unsubscribeState', gameId: id })
          }
        }
      }
    },

    async sendAction(id, action) {
      const resp = await sendMessage({ type: 'sendAction', gameId: id, action })
      return resp.actionId as ActionId
    },

    subscribeActions(id, cb) {
      if (!actionCallbacks.has(id)) {
        actionCallbacks.set(id, new Set())
      }
      actionCallbacks.get(id)!.add(cb)

      sendMessage({ type: 'subscribeActions', gameId: id }).catch(() => {})

      return () => {
        const cbs = actionCallbacks.get(id)
        if (cbs) {
          cbs.delete(cb)
          if (cbs.size === 0) {
            actionCallbacks.delete(id)
            sendMessageFireAndForget({ type: 'unsubscribeActions', gameId: id })
          }
        }
      }
    },

    async consumeAction(id, actionId) {
      await sendMessage({ type: 'consumeAction', gameId: id, actionId })
    },

    async findResumable(ownerUid) {
      const resp = await sendMessage({ type: 'findResumable', ownerUid })
      return resp.games as GameSummary[]
    },

    async deleteGame(id) {
      await sendMessage({ type: 'deleteGame', gameId: id })
    },

    async listJoinableGames() {
      const resp = await sendMessage({ type: 'listJoinableGames' })
      return resp.games as GameSummary[]
    },
  }
}
