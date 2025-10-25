const express = require('express')
const router = express.Router()
const db = require('./db_connection')

router.get('/', function (req, res) {
  res.send({ msg: 'Ping pong' })
})

router.get('/users', async (req, res) => {
  const users = await db('users').select()
  return res.send(users)
})

router.get('/user/:uid', async (req, res) => {
  const uid = req.params.uid
  const user = await db('users').select().where({
    uid,
  })
  if (user) {
    return res.send(user)
  }
  return res.sendStatus(404)
})

router.get('/user/stats/:uid', async (req, res) => {
  const uid = req.params.uid
  try {
    const q = db('games')
      .select('difficulty_level')
      .count('*', { as: 'games_played' })
      .sum('player_won', { as: 'games_won' })
      .groupBy('difficulty_level')
      .where({ player_uid: uid })
    console.log(q.toString())
    const rows = await q
    return res.send(rows)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.post('/user', async (req, res) => {
  const { uid } = req.body
  const { email } = req.body.info || ''
  const info = req.body.info || {}
  try {
    const existingUser = await db('users').select().where({
      uid,
    })
    if (existingUser) {
      return res.json({ msg: 'user exists' })
    }
    await db('users').insert({
      uid,
      email,
      info,
    })
    return res.json({ message: 'success' })
  } catch (e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

router.get('/games', async (req, res) => {
  const games = await db('games').count('*', { as: 'games_played' }).groupBy('player_uid')
  console.log(games)
  return res.send(games)
})

router.post('/game', async (req, res) => {
  const { uid, total_time, player_won, difficulty_level, winning_score, data } = req.body
  try {
    await db('games').insert({
      player_uid: uid,
      total_time,
      player_won,
      difficulty_level,
      winning_score,
      data: JSON.stringify(data || {}),
    })
    return res.sendStatus(200)
  } catch (e) {
    console.log(e)
    return res.sendStatus(500)
  }
})

module.exports = router
