const users = require('./users_data.json')
const games = require('./games_data.json')
const db = require('./db_connection')

const runUsers = async () => {
  await db('users').del()
  const entries = users.map((user) => {
    return {
      uid: user.uid,
      email: user.email,
      info: user.info,
      created_at: new Date(user.createdAt),
    }
  })
  return db('users').insert(entries)
}

const runGames = async () => {
  await db('games').del()
  const entries = games.map((game) => {
    return {
      id: game.id,
      total_time: game.total_time,
      player_won: game.player_won,
      difficulty_level: game.difficulty_level,
      winning_score: game.winning_score,
      player_uid: game.player_uid,
      created_at: new Date(game.createdAt),
    }
  })
  return db('games').insert(entries)
}

const run = async () => {
  try {
    await runUsers()
    console.log('Users seeded successfully')
    await runGames()
    console.log('Games seeded successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    process.exit(0)
  }
}

if (require.main === module) {
  run()
}
