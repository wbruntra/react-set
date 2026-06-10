import type { GameTransport } from './transport'
import { createFirebaseTransport } from './firebaseTransport'
import { createWebSocketTransport } from './websocketTransport'

export function createTransport(): GameTransport {
  if (import.meta.env.VITE_TRANSPORT === 'websocket') {
    return createWebSocketTransport()
  }
  return createFirebaseTransport()
}
