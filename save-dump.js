const db = require('./db_connection')
const fs = require('fs')

const run = async () => {
  const games = await db('games').select()
  fs.writeFileSync('./games_data.json', JSON.stringify(games, null, 2))
}

run().then(() => process.exit(0))
