/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('games', function (table) {
    table.index('player_uid');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('games', function (table) {
    // Check if index exists before dropping to be safe?
    // Usually knex handles this, but in SQLite if it's missing it throws.
    // However, for this specific benchmark where we manually dropped it, we broke the state.
    // But for the actual codebase, we assume integrity.
    table.dropIndex('player_uid');
  });
};
