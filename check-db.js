const db = require('./db_connection')

async function checkLastGame() {
  try {
    const games = await db('games').select('*').orderBy('id', 'desc').limit(1)

    console.log('Last game record:')
    console.log(JSON.stringify(games[0], null, 2))

    if (games[0] && games[0].data) {
      console.log('\nParsed action data:')
      console.log(JSON.parse(games[0].data))
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    process.exit(0)
  }
}

checkLastGame()
