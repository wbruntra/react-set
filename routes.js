var express = require('express')
var router = express.Router()
var sqlite3 = require('sqlite3')

let db = new sqlite3.Database('./db/main.db', (err) => {
  if (err) {
    console.error(err.message)
  }
})

router.get('/', function(req, res) {
  res.send({ msg: 'Ping pong' })
})

router.get('/users', (req, res) => {
  let sql = `SELECT * FROM user_info`
  db.all(sql, function(err, rows) {
    if (err) {
      console.log(err)
      return res.send('Error')
    }
    const result = rows.map((row) => {
      const info = JSON.parse(row.info)
      return {
        uid: row.uid,
        ...info,
      }
    })
    console.log(rows)
    return res.send(result)
  })
})

router.get('/user/:uid', (req, res) => {
  const uid = req.params.uid
  let sql = `SELECT * FROM user_info WHERE uid = ?`
  db.get(sql, [uid], function(err, row) {
    if (row === undefined) {
      return res.sendStatus(404)
    }
    if (err) {
      console.log(err)
      return res.send('Error')
    }
    const info = JSON.parse(row.info)
    res.send({
      uid: row.uid,
      ...info,
    })
  })
})

router.get('/user/stats/:uid', (req, res) => {
  const uid = req.params.uid
  let sql = `
SELECT Count(*)        AS games_played, 
       Sum(player_won) AS games_won, 
       difficulty_level 
FROM   game_info 
WHERE  player_uid = ? 
GROUP  BY difficulty_level`
  db.all(sql, [uid], function(err, rows) {
    if (err) {
      console.log(err)
      return res.send('Error')
    }
    res.send(rows)
  })
})

router.post('/user', (req, res) => {
  const sql = `INSERT INTO user_info(uid, email, info) VALUES (?, ?, ?)`
  const { uid } = req.body
  const { email } = req.body.info || ''
  const info = JSON.stringify(req.body.info)
  const params = [uid, email, info]
  db.run(sql, params, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({
      message: 'success',
    })
  })
})

router.get('/games', (req, res) => {
  const sql = `SELECT * FROM game_info`
  db.all(sql, (err, rows) => {
    return res.send(rows)
  })
})

router.post('/game', (req, res) => {
  const { uid, total_time, player_won, difficulty_level, winning_score } = req.body
  const sql = `INSERT INTO game_info(total_time, player_won, difficulty_level, winning_score, player_uid) VALUES (?, ?, ?, ?, ?)`
  const params = [total_time, player_won, difficulty_level, winning_score, uid]
  db.run(sql, params, () => {
    console.log('Game saved')
    res.sendStatus(201)
  })
})

module.exports = router
