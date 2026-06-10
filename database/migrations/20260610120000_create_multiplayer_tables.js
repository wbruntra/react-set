/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('multiplayer_games', function (table) {
      table.increments('id').primary()
      table.string('code').unique().notNullable()
      table.string('game_title').notNullable()
      table.string('creator_uid')
      table.json('initial_state').notNullable()
      table.text('started_at').nullable()
      table.text('finished_at').nullable()
      table.text('created_at').notNullable().defaultTo(knex.fn.now())
      table.text('updated_at').notNullable().defaultTo(knex.fn.now())
    })
    .createTable('game_actions', function (table) {
      table.increments('id')
      table
        .string('game_code')
        .notNullable()
        .references('code')
        .inTable('multiplayer_games')
        .onDelete('CASCADE')
      table.integer('seq').notNullable()
      table.string('type').notNullable()
      table.json('data').notNullable()
      table.text('created_at').notNullable().defaultTo(knex.fn.now())
      table.unique(['game_code', 'seq'])
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('game_actions').dropTableIfExists('multiplayer_games')
}
