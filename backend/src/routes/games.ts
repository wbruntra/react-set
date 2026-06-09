import { Hono } from 'hono'
import { db } from '../db'

const games = new Hono()

// POST /api/game
games.post('/', async (c) => {
  const body = await c.req.json()
  const { uid, total_time, player_won, difficulty_level, winning_score, data } = body

  try {
    await db('games').insert({
      player_uid: uid,
      total_time,
      player_won,
      difficulty_level,
      winning_score,
      data: JSON.stringify(data || {}),
    })
    return c.text('OK', 200)
  } catch (e) {
    console.error(e)
    return c.text('Internal error', 500)
  }
})

export default games
