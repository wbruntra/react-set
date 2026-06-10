import { Hono } from 'hono'
import { db } from '../db'
import { CreateUserSchema } from '../schemas'
import { validate } from '../middleware/validate'

const users = new Hono()

users.get('/stats/:uid', async (c) => {
  const uid = c.req.param('uid')
  const rows = await db('games')
    .select('difficulty_level')
    .count('*', { as: 'games_played' })
    .sum('player_won', { as: 'games_won' })
    .groupBy('difficulty_level')
    .where({ player_uid: uid })
  return c.json(rows)
})

users.get('/:uid', async (c) => {
  const uid = c.req.param('uid')
  const rows = await db('users').select().where({ uid })
  if (rows.length > 0) {
    return c.json(rows)
  }
  return c.text('Not found', 404)
})

users.post('/', validate('json', CreateUserSchema), async (c) => {
  const body = c.req.valid('json')
  const { uid } = body
  const email = body.info?.email || ''
  const info = body.info || {}

  const existing = await db('users').select().where({ uid })
  if (existing.length > 0) {
    return c.json({ msg: 'user exists' })
  }
  await db('users').insert({ uid, email, info })
  return c.json({ message: 'success' })
})

export default users
