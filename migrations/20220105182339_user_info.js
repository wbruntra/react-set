exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table
      .string('uid')
      .unique()
      .primary()
    table.string('email').unique()
    table.text('info', 'longtext')

    table.datetime(`createdAt`).notNullable()
    table.datetime(`updatedAt`).notNullable()
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('users')
}
