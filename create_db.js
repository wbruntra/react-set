var Database = require('better-sqlite3');
var db = new Database('./db/main.db');

const tables = [
  {
    name: 'game_info',
    ddl:
    `CREATE TABLE 'game_info' (
      'name'	TEXT NOT NULL PRIMARY KEY UNIQUE,
      'host'	TEXT,
      'started' INTEGER DEFAULT 0,
      'updated'	INTEGER,
      'deck' INTEGER,
      'board'	TEXT,
      'selected' TEXT,
      'players' TEXT
    );`      
  },
  {
    name: 'game_action',
    ddl:
    `CREATE TABLE 'game_action' (
      'game_name' TEXT NOT NULL,
      'action_data' TEXT,
      FOREIGN KEY (game_name) REFERENCES game_info(name) \
    );`
  },
];

tables.forEach(table => {
  db.prepare(`DROP TABLE IF EXISTS ${table.name}`).run();
  db.prepare(table.ddl).run();
});

let sql = `INSERT INTO game_info(name, host) VALUES (?, ?)`
let result = db.prepare(sql).run('test', 'foo');
console.log(result);
// let stmt = db.prepare(sql)
