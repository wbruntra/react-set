import { Hono } from 'hono'
import { db } from '../db'
import { CreateGameSchema } from '../schemas'
import { validate } from '../middleware/validate'

const games = new Hono()

games.post('/', validate('json', CreateGameSchema), async (c) => {
  const body = c.req.valid('json')
  const { uid, total_time, player_won, difficulty_level, winning_score, data } = body

  await db
    .insertInto('games')
    .values({
      player_uid: uid,
      total_time,
      player_won,
      difficulty_level,
      winning_score,
      data: JSON.stringify(data || {}),
    })
    .execute()
  return c.text('OK', 200)
})

export default games
