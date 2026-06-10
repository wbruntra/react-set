import type { ServerWebSocket } from 'bun'
import app from './app'
import { handleMessage } from './ws/wsHandlers'
import { reloadActiveGames } from './ws/gameStore'
import { db } from './db'

const port = parseInt(Bun.env.PORT || '5002', 10)

let server: ReturnType<typeof Bun.serve> | null = null
let shuttingDown = false

async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  console.log('Shutting down...')
  if (server) {
    server.stop(true)
  }
  await db.destroy()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

export default {
  port,
  fetch(req: Request, srv: any) {
    const url = new URL(req.url)
    if (url.pathname === '/ws') {
      if (srv.upgrade(req)) {
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

async function main() {
  await reloadActiveGames()
  console.log(`Server running on http://localhost:${port}`)
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
