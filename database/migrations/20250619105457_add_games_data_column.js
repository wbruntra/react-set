/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // alter the 'games' table to add a new column 'data'
  return knex.schema.table('games', function (table) {
    table.json('data').defaultTo('{}') // add 'data' column with default empty JSON object
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('games', function (table) {
    table.dropColumn('data')
  })
}
