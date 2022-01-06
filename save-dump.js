const db = require('./db_connection')
const fs = require('fs')

const run = async () => {
  const games = await db('users').select()
  fs.writeFileSync('./users_data.json', JSON.stringify(games, null, 2))
}

run().then(() => process.exit(0))
