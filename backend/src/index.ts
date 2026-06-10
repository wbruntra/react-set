import type { ServerWebSocket } from 'bun'
import app from './app'
import { handleMessage } from './ws/wsHandlers'
import { reloadActiveGames } from './ws/gameStore'

const port = parseInt(process.env.PORT || '5002', 10)

export default {
  port,
  fetch(req: Request, server: any) {
    const url = new URL(req.url)
    if (url.pathname === '/ws') {
      if (server.upgrade(req)) {
        return
      }
      return new Response('WebSocket upgrade failed', { status: 426 })
    }
    return app.fetch(req)
  },
  websocket: {
    message(ws: ServerWebSocket<undefined>, message: string) {
      handleMessage(ws, message)
    },
  },
}

console.log(`Server running on http://localhost:${port}`)

reloadActiveGames().catch((err) => {
  console.error('Failed to reload active games:', err)
})
