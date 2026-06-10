import knexLib from 'knex'
import type { Knex } from 'knex'
import path from 'path'
import knexBunSqlite from 'knex-bun-sqlite'

const NODE_ENV = process.env.NODE_ENV || 'development'
const dbFile =
  NODE_ENV === 'production'
    ? path.join(import.meta.dir, '..', '..', 'react-db-production.sqlite3')
    : path.join(import.meta.dir, '..', '..', 'react-db-dev.sqlite3')

console.log(`Using database (${NODE_ENV}): ${dbFile}`)

export const db: Knex = knexLib({
  client: knexBunSqlite as any,
  connection: { filename: dbFile },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(import.meta.dir, '..', '..', 'migrations'),
  },
  pool: {
    afterCreate: (conn: any, cb: (err: Error | null) => void) => {
      conn.run('PRAGMA foreign_keys = ON', cb)
    },
  },
})
