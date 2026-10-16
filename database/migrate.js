// Run pending knex migrations with the same bun-sqlite connection the app uses.
// The knex CLI isn't used: it needs the native sqlite3 client.
const knex = require('./db_connection')

async function main() {
  const [batch, log] = await knex.migrate.latest()
  console.log(log.length ? `Batch ${batch} applied: ${log.join(', ')}` : 'Already up to date')
  await knex.destroy()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
