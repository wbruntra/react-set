import { Hono } from 'hono'
import { db } from '../db'

const users = new Hono()

// GET /api/user/stats/:uid — must come before /:uid
users.get('/stats/:uid', async (c) => {
  const uid = c.req.param('uid')
  try {
    const rows = await db('games')
      .select('difficulty_level')
      .count('*', { as: 'games_played' })
      .sum('player_won', { as: 'games_won' })
      .groupBy('difficulty_level')
      .where({ player_uid: uid })
    return c.json(rows)
  } catch {
    return c.text('Internal error', 500)
  }
})

// GET /api/user/:uid
users.get('/:uid', async (c) => {
  const uid = c.req.param('uid')
  const rows = await db('users').select().where({ uid })
  if (rows.length > 0) {
    return c.json(rows)
  }
  return c.text('Not found', 404)
})

// POST /api/user
users.post('/', async (c) => {
  const body = await c.req.json()
  const { uid } = body
  const email = body.info?.email || ''
  const info = body.info || {}

  try {
    const existing = await db('users').select().where({ uid })
    if (existing.length > 0) {
      return c.json({ msg: 'user exists' })
    }
    await db('users').insert({ uid, email, info })
    return c.json({ message: 'success' })
  } catch (e) {
    console.error(e)
    return c.text('Internal error', 500)
  }
})

export default users
