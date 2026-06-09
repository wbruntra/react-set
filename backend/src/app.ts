import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import path from 'path'

import users from './routes/users'
import games from './routes/games'
import { db } from './db'

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

// Health check: GET /api
app.get('/api', (c) => c.json({ msg: 'Ping pong' }))

// Explicit list routes (more specific, must be before parameterized routes)
app.get('/api/users', async (c) => {
  const rows = await db('users').select()
  return c.json(rows)
})

app.get('/api/games', async (c) => {
  const rows = await db('games').count('*', { as: 'games_played' }).groupBy('player_uid')
  return c.json(rows)
})

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
