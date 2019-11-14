var sqlite3 = require('sqlite3')

let db = new sqlite3.Database('./db/main.db', (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('Connected to the database.')
})

const tables = [
  {
    name: 'game_info',
    ddl: `CREATE TABLE 'game_info' (
      'total_time' INTEGER,
      'player_won'	INTEGER,
      'difficulty_level'	INTEGER,
      'winning_score'	INTEGER,
      'player_uid' TEXT,
      FOREIGN KEY (player_uid) REFERENCES user_info(uid)
    );`,
  },
]

tables.forEach((table) => {
  db.serialize(function() {
    db.run(`DROP TABLE IF EXISTS ${table.name}`)
    db.run(table.ddl)
  })
})
