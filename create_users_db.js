var sqlite3 = require('sqlite3')

let db = new sqlite3.Database('./db/main.db', (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('Connected to the database.')
})

const tables = [
  {
    name: 'user_info',
    ddl: `CREATE TABLE 'user_info' (
      'uid'	TEXT NOT NULL PRIMARY KEY UNIQUE,
      'email' TEXT,
      'info' TEXT
    );`,
  },
]

tables.forEach((table) => {
  db.serialize(function() {
    db.run(`DROP TABLE IF EXISTS ${table.name}`)
    db.run(table.ddl)
  })
})