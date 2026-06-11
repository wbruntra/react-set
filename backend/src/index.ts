import type { ServerWebSocket } from 'bun'
import app from './app'
import { handleMessage } from './ws/wsHandlers'
import { reloadActiveGames } from './ws/gameStore'
import { db } from './db'

const port = parseInt(Bun.env.PORT || '5002', 10)

let shuttingDown = false

async function shutdown(server: ReturnType<typeof Bun.serve>) {
  if (shuttingDown) return
  shuttingDown = true
  console.log('Shutting down...')
  server.stop(true)
  await db.destroy()
  process.exit(0)
}

await reloadActiveGames()

const server = Bun.serve<undefined>({
  port,
  fetch(req, srv) {
    const url = new URL(req.url)
    if (url.pathname === '/ws') {
      if (srv.upgrade(req)) {
        return undefined
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
})

console.log(`Listening on http://localhost:${server.port}`)

process.on('SIGTERM', () => shutdown(server))
process.on('SIGINT', () => shutdown(server))
