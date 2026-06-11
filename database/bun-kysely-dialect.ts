import {
  CompiledQuery,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  type AbortableOperationOptions,
  type DatabaseConnection,
  type Dialect,
  type Driver,
  type Kysely,
} from 'kysely'

export interface BunSqliteStatement {
  readonly columnNames: readonly string[]
  all(...parameters: unknown[]): unknown[]
  run(...parameters: unknown[]): {
    changes: number | bigint
    lastInsertRowid: number | bigint
  }
  iterate(...parameters: unknown[]): IterableIterator<unknown>
  finalize?(): void
}

export interface BunSqliteDatabaseLike {
  close(throwOnError?: boolean): void
  prepare(sql: string): BunSqliteStatement
}

export interface BunSqliteDialectConfig {
  database:
    | BunSqliteDatabaseLike
    | ((
        options?: AbortableOperationOptions,
      ) => BunSqliteDatabaseLike | Promise<BunSqliteDatabaseLike>)
  onCreateConnection?: (
    connection: DatabaseConnection,
    options?: AbortableOperationOptions,
  ) => void | Promise<void>
}

export class BunSqliteDialect implements Dialect {
  readonly #config: BunSqliteDialectConfig

  constructor(config: BunSqliteDialectConfig) {
    this.#config = Object.freeze({ ...config })
  }

  createAdapter() {
    return new SqliteAdapter()
  }

  createDriver(): Driver {
    return new BunSqliteDriver(this.#config)
  }

  createIntrospector(db: Kysely<any>) {
    return new SqliteIntrospector(db)
  }

  createQueryCompiler() {
    return new SqliteQueryCompiler()
  }
}

class BunSqliteDriver implements Driver {
  readonly #config: BunSqliteDialectConfig
  #database?: BunSqliteDatabaseLike
  #connection?: BunSqliteConnection

  constructor(config: BunSqliteDialectConfig) {
    this.#config = Object.freeze({ ...config })
  }

  async init(options?: AbortableOperationOptions): Promise<void> {
    this.#database =
      typeof this.#config.database === 'function'
        ? await this.#config.database(options)
        : this.#config.database

    this.#connection = new BunSqliteConnection(this.#database)

    if (this.#config.onCreateConnection) {
      await this.#config.onCreateConnection(this.#connection, options)
    }
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.#connection) {
      throw new Error('BunSqliteDriver has not been initialized.')
    }

    return this.#connection
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('begin'))
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('commit'))
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('rollback'))
  }

  async savepoint(connection: DatabaseConnection, savepointName: string): Promise<void> {
    await connection.executeQuery(
      CompiledQuery.raw(`savepoint ${escapeIdentifier(savepointName)}`),
    )
  }

  async rollbackToSavepoint(connection: DatabaseConnection, savepointName: string): Promise<void> {
    await connection.executeQuery(
      CompiledQuery.raw(`rollback to ${escapeIdentifier(savepointName)}`),
    )
  }

  async releaseSavepoint(connection: DatabaseConnection, savepointName: string): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw(`release ${escapeIdentifier(savepointName)}`))
  }

  async releaseConnection(): Promise<void> {
    // SQLite uses a single connection, so there is nothing to release.
  }

  async destroy(): Promise<void> {
    this.#database?.close()
  }
}

class BunSqliteConnection implements DatabaseConnection {
  readonly #database: BunSqliteDatabaseLike

  constructor(database: BunSqliteDatabaseLike) {
    this.#database = database
  }

  async executeQuery<R>(compiledQuery: CompiledQuery) {
    const statement = this.#database.prepare(compiledQuery.sql)

    try {
      if (statement.columnNames.length > 0) {
        return {
          rows: statement.all(...compiledQuery.parameters) as R[],
        }
      }

      const { changes, lastInsertRowid } = statement.run(...compiledQuery.parameters)

      return {
        insertId: toBigInt(lastInsertRowid),
        numAffectedRows: toBigInt(changes),
        rows: [] as R[],
      }
    } finally {
      statement.finalize?.()
    }
  }

  async *streamQuery<R>(compiledQuery: CompiledQuery) {
    if (compiledQuery.query.kind !== 'SelectQueryNode') {
      throw new Error('BunSqliteDriver only supports streaming of select queries')
    }

    const statement = this.#database.prepare(compiledQuery.sql)

    try {
      for (const row of statement.iterate(...compiledQuery.parameters) as Iterable<R>) {
        yield {
          rows: [row],
        }
      }
    } finally {
      statement.finalize?.()
    }
  }
}

function toBigInt(value: number | bigint | undefined): bigint | undefined {
  if (value === undefined) {
    return undefined
  }

  return typeof value === 'bigint' ? value : BigInt(value)
}

function escapeIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`
}
