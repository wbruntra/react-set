import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import path from 'path'

import users from './routes/users'
import games from './routes/games'
import { db } from './db'

const app = new Hono()

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
app.use(
  '*',
  cors({
    origin: allowedOrigin,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type'],
  }),
)
app.use('*', logger())

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: err.message }, 500)
})

app.get('/api', (c) => c.json({ msg: 'Ping pong' }))

// Health check, used by the ansible deploy
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Parameterized routes mounted as sub-apps
app.route('/api/user', users)
app.route('/api/game', games)

// Serve built client in production
if (process.env.NODE_ENV === 'production') {
  const clientDir = path.join(import.meta.dir, '..', '..', 'vite-client', 'dist')
  app.use('*', serveStatic({ root: clientDir }))
  app.get('*', serveStatic({ path: 'index.html', root: clientDir }))
}

export default app
