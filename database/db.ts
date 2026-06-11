import { Database } from 'bun:sqlite'
import { Kysely, sql, type Generated } from 'kysely'
export { sql }
import path from 'path'
import { BunSqliteDialect } from './bun-kysely-dialect'

const NODE_ENV = process.env.NODE_ENV || 'development'
const dbFile =
  NODE_ENV === 'production'
    ? path.join(import.meta.dir, 'react-db-production.sqlite3')
    : path.join(import.meta.dir, 'react-db-dev.sqlite3')

console.log(`Using database (${NODE_ENV}): ${dbFile}`)

export interface UsersTable {
  uid: string
  email: string | null
  info: string | null
  created_at: Generated<string>
}

export interface GamesTable {
  id: Generated<number>
  total_time: number | null
  player_won: number | null
  difficulty_level: number | null
  winning_score: number | null
  player_uid: string | null
  created_at: Generated<string>
  data: Generated<string>
}

export interface MultiplayerGamesTable {
  id: Generated<number>
  code: string
  game_title: string
  creator_uid: string | null
  initial_state: string
  started_at: string | null
  finished_at: string | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface GameActionsTable {
  id: Generated<number>
  game_code: string
  seq: number
  type: string
  data: string
  created_at: Generated<string>
}

export interface DB {
  users: UsersTable
  games: GamesTable
  multiplayer_games: MultiplayerGamesTable
  game_actions: GameActionsTable
}

const sqliteDb = new Database(dbFile)
sqliteDb.run('PRAGMA foreign_keys = ON')

export const db = new Kysely<DB>({
  dialect: new BunSqliteDialect({ database: sqliteDb }),
})
