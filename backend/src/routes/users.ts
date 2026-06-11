import { Hono } from 'hono'
import { db, sql } from '../db'
import { CreateUserSchema } from '../schemas'
import { validate } from '../middleware/validate'

const users = new Hono()

users.get('/stats/:uid', async (c) => {
  const uid = c.req.param('uid')
  const rows = await db
    .selectFrom('games')
    .select([
      'difficulty_level',
      sql<number>`count(*)`.as('games_played'),
      sql<number>`sum(player_won)`.as('games_won'),
    ])
    .where('player_uid', '=', uid)
    .groupBy('difficulty_level')
    .execute()
  return c.json(rows)
})

users.get('/:uid', async (c) => {
  const uid = c.req.param('uid')
  const rows = await db.selectFrom('users').selectAll().where('uid', '=', uid).execute()
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

  const existing = await db.selectFrom('users').selectAll().where('uid', '=', uid).execute()
  if (existing.length > 0) {
    return c.json({ msg: 'user exists' })
  }
  await db
    .insertInto('users')
    .values({ uid, email, info: JSON.stringify(info) })
    .execute()
  return c.json({ message: 'success' })
})

export default users
