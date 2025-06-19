exports.up = function (knex) {
  return knex.schema.createTable('games', function (table) {
    table.increments('id')
    table.integer('total_time')
    table.integer('player_won')
    table.integer('difficulty_level')
    table.integer('winning_score')
    table.string('player_uid')
    table.datetime('created_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('games')
}
