exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table
      .string('uid')
      .unique()
      .primary()
    table.string('email').unique()
    table.text('info', 'longtext')

    table.datetime(`created_at`).defaultTo(knex.fn.now())
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('users')
}
