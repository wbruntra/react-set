import type { ServerWebSocket } from 'bun'
import {
  getGame,
  createGame,
  updateGameState,
  addAction,
  addStateUpdate,
  removeAction,
  findResumableGames,
  listJoinableGames,
  deleteGame,
  setGameStarted,
  setGameFinished,
} from './gameStore'

const TOPIC_STATE = (gameId: string) => `game:${gameId}`
const TOPIC_ACTIONS = (gameId: string) => `actions:${gameId}`

function send(ws: ServerWebSocket<unknown>, data: unknown) {
  ws.send(JSON.stringify(data))
}

function sendError(ws: ServerWebSocket<unknown>, requestId: string | undefined, message: string) {
  send(ws, { type: 'error', requestId, message })
}

function generateGameCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase()
}

export async function handleMessage(ws: ServerWebSocket<unknown>, raw: string) {
  let msg: any
  try {
    msg = JSON.parse(raw)
  } catch {
    sendError(ws, undefined, 'Invalid JSON')
    return
  }

  const { type, requestId } = msg

  switch (type) {
    case 'createGame': {
      const { gameId: displayTitle, state, creator_uid } = msg
      if (!displayTitle || !state) {
        sendError(ws, requestId, 'Missing gameId or state')
        return
      }
      let code: string | undefined
      for (let i = 0; i < 5; i++) {
        const candidate = generateGameCode()
        if (!getGame(candidate)) {
          code = candidate
          break
        }
      }
      if (!code) {
        sendError(ws, requestId, 'Could not allocate a game code, try again')
        return
      }
      state.gameTitle = displayTitle
      state.creator_uid = creator_uid
      await createGame(code, state)
      send(ws, { type: 'gameCreated', gameId: code, requestId })
      break
    }

    case 'updateState': {
      const { gameId, partial } = msg
      if (!gameId || !partial) {
        sendError(ws, requestId, 'Missing gameId or partial')
        return
      }

      // Track start/finish timestamps
      if (partial.gameStarted) {
        await setGameStarted(gameId)
      }
      if (partial.gameOver) {
        await setGameFinished(gameId)
      }

      // Log state update as a replayable action
      await addStateUpdate(gameId, partial)

      const updated = await updateGameState(gameId, partial)
      if (!updated) {
        sendError(ws, requestId, 'Game not found')
        return
      }
      ws.publish(
        TOPIC_STATE(gameId),
        JSON.stringify({
          type: 'stateUpdate',
          gameId,
          state: updated,
        }),
      )
      if (requestId) {
        send(ws, { type: 'stateUpdated', gameId, requestId })
      }
      break
    }

    case 'subscribeState': {
      const { gameId } = msg
      if (!gameId) {
        sendError(ws, requestId, 'Missing gameId')
        return
      }
      const stored = getGame(gameId)
      if (!stored) {
        sendError(ws, requestId, 'Game not found')
        return
      }
      ws.subscribe(TOPIC_STATE(gameId))
      send(ws, {
        type: 'stateUpdate',
        gameId,
        state: stored.state,
        requestId,
      })
      break
    }

    case 'unsubscribeState': {
      const { gameId } = msg
      if (gameId) {
        ws.unsubscribe(TOPIC_STATE(gameId))
      }
      break
    }

    case 'sendAction': {
      const { gameId, action } = msg
      if (!gameId || !action) {
        sendError(ws, requestId, 'Missing gameId or action')
        return
      }
      const stored = getGame(gameId)
      if (!stored) {
        sendError(ws, requestId, 'Game not found')
        return
      }
      const actionId = await addAction(gameId, action)
      if (actionId === undefined) {
        sendError(ws, requestId, 'Failed to store action')
        return
      }
      send(ws, { type: 'actionSent', gameId, actionId, requestId })
      ws.publish(
        TOPIC_ACTIONS(gameId),
        JSON.stringify({
          type: 'actionReceived',
          gameId,
          action,
          actionId,
        }),
      )
      break
    }

    case 'subscribeActions': {
      const { gameId } = msg
      if (!gameId) {
        sendError(ws, requestId, 'Missing gameId')
        return
      }
      ws.subscribe(TOPIC_ACTIONS(gameId))
      send(ws, { type: 'actionsSubscribed', gameId, requestId })
      break
    }

    case 'unsubscribeActions': {
      const { gameId } = msg
      if (gameId) {
        ws.unsubscribe(TOPIC_ACTIONS(gameId))
      }
      break
    }

    case 'consumeAction': {
      const { gameId, actionId } = msg
      if (!gameId || !actionId) {
        sendError(ws, requestId, 'Missing gameId or actionId')
        return
      }
      await removeAction(gameId, actionId)
      ws.publish(
        TOPIC_ACTIONS(gameId),
        JSON.stringify({
          type: 'actionConsumed',
          gameId,
          actionId,
        }),
      )
      if (requestId) {
        send(ws, { type: 'actionConsumedAck', gameId, actionId, requestId })
      }
      break
    }

    case 'findResumable': {
      const { ownerUid } = msg
      if (!ownerUid) {
        sendError(ws, requestId, 'Missing ownerUid')
        return
      }
      const games = await findResumableGames(ownerUid)
      send(ws, { type: 'resumableGames', games, requestId })
      break
    }

    case 'deleteGame': {
      const { gameId } = msg
      if (!gameId) {
        sendError(ws, requestId, 'Missing gameId')
        return
      }
      await deleteGame(gameId)
      ws.publish(
        TOPIC_STATE(gameId),
        JSON.stringify({
          type: 'gameDeleted',
          gameId,
        }),
      )
      if (requestId) {
        send(ws, { type: 'gameDeletedAck', gameId, requestId })
      }
      break
    }

    case 'listJoinableGames': {
      const games = await listJoinableGames()
      send(ws, { type: 'joinableGames', games, requestId })
      break
    }

    default:
      sendError(ws, requestId, `Unknown message type: ${type}`)
  }
}
