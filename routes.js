var express = require('express')
var router = express.Router()

// var User = require('./models/User')
// var Game = require('./models/Game')
// var sequelize = require('sequelize')
const db = require('./db_connection')

router.get('/', function(req, res) {
  res.send({ msg: 'Ping pong' })
})

router.get('/users', async (req, res) => {
  const users = await db('users').select()
  return res.send(users)
  // User.findAll().then((rows) => {
  //   return res.send(rows)
  // })
})

router.get('/user/:uid', async (req, res) => {
  const uid = req.params.uid
  const user = await db('users')
    .select()
    .where({
      uid,
    })
  if (user) {
    return res.send(user)
  }
  return res.sendStatus(404)
  // User.findOne({
  //   where: { uid: uid },
  // }).then((user) => {
  //   res.json(user)
  // })
  // let sql = `SELECT * FROM user_info WHERE uid = ?`
  // db.get(sql, [uid], function(err, row) {
  //   if (row === undefined) {
  //     return res.sendStatus(404)
  //   }
  //   if (err) {
  //     console.log(err)
  //     return res.send('Error')
  //   }
  //   const info = JSON.parse(row.info)
  //   res.send({
  //     uid: row.uid,
  //     ...info,
  //   })
  // })
})

router.get('/user/stats/:uid', async (req, res) => {
  const uid = req.params.uid
  try {
    const rows = await db('games')
      .count('*', { as: 'games_played' })
      .sum('player_won', { as: 'games_won' })
      .groupBy('difficulty_level')
    return res.send(rows)
  } catch (e) {
    return res.sendStatus(500)
  }
  // const attributes = [
  //   'difficulty_level',
  //   [sequelize.fn('count', sequelize.col('*')), 'games_played'],
  //   [sequelize.fn('sum', sequelize.col('player_won')), 'games_won'],
  // ]
  // Game.findAll({
  //   where: {
  //     player_uid: uid,
  //   },
  //   group: ['difficulty_level'],
  //   attributes,
  // })
  // .then((rows) => {
  //   res.send(rows)
  // })
  // .catch((err) => {
  //   console.log(err)
  //   res.sendStatus(500)
  // })
  //   let sql = `
  // SELECT Count(*)        AS games_played,
  //        Sum(player_won) AS games_won,
  //        difficulty_level
  // FROM   game_info
  // WHERE  player_uid = ?
  // GROUP  BY difficulty_level`
  //   db.all(sql, [uid], function(err, rows) {
  //     if (err) {
  //       console.log(err)
  //       return res.send('Error')
  //     }
  //     res.send(rows)
  //   })
})

router.post('/user', async (req, res) => {
  const { uid } = req.body
  const { email } = req.body.info || ''
  const info = req.body.info || {}
  db('users')
    .select()
    .where({
      uid,
    })
    .then((user) => {
      if (user) {
        return res.json({ msg: 'user exists' })
      }
      db('users')
        .insert({
          uid,
          email,
          info,
        })
        .then((user) => {
          return res.json(user)
        })
    })
  // const sql = `INSERT INTO user_info(uid, email, info) VALUES (?, ?, ?)`
  // const params = [uid, email, info]
  // db.run(sql, params, (err, result) => {
  //   if (err) {
  //     res.status(500).json({ error: err.message })
  //     return
  //   }
  //   res.json({
  //     message: 'success',
  //   })
  // })
})

router.get('/games', async (req, res) => {
  const games = await db('games')
    .count('*', { as: 'games_played' })
    .groupBy('player_uid')
  console.log(games)
  return res.send('OK')
  // Game.findAll({
  //   group: ['player_uid'],
  //   attributes: ['player_uid', [sequelize.fn('count', sequelize.col('*')), 'games_played']],
  //   raw: true,
  // })
  //   .then((games) => {
  //     return res.json(games)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //     return res.sendStatus(500)
  //   })
  // const sql = `SELECT * FROM game_info`
  // db.all(sql, (err, rows) => {
  //   return res.send(rows)
  // })
})

router.post('/game', async (req, res) => {
  const { uid, total_time, player_won, difficulty_level, winning_score } = req.body
  await db('games').insert({
    player_uid: uid,
    total_time,
    player_won,
    difficulty_level,
    winning_score,
  })
  return res.sendStatus(200)
  // Game.create({
  //   player_uid: uid,
  //   total_time,
  //   player_won,
  //   difficulty_level,
  //   winning_score,
  // }).then(() => {
  //   res.sendStatus(201)
  // })
  // const sql = `INSERT INTO game_info(total_time, player_won, difficulty_level, winning_score, player_uid) VALUES (?, ?, ?, ?, ?)`
  // const params = [total_time, player_won, difficulty_level, winning_score, uid]
  // db.run(sql, params, () => {
  //   console.log('Game saved')
  //   res.sendStatus(201)
  // })
})

module.exports = router
