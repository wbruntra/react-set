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
  return db.createTable('game_info', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      notNull: true,
      unique: true
    },
    name: 'string',
    host: 'string',
    updated: 'int',
    players: 'text',
    board: 'text',
    selected: 'text',
    deck: 'text'
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
