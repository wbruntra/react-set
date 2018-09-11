'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('game_action', {
    game_id: {
      type: 'int',
      primaryKey: true,
      foreignKey: {
        name: 'fk_game_action_game_info_game_id',
        table: 'game_info',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: {
          game_id: 'id'
        }
      }
    },
    action_data: 'text'
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
