'use strict';
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    name: DataTypes.STRING,
    host: DataTypes.STRING,
    updated: DataTypes.INTEGER,
    players: DataTypes.JSON,
    board: DataTypes.JSON,
    selected: DataTypes.JSON,
    deck: DataTypes.JSON
 }, {
    tableName: 'game_info',
  });
  Game.associate = function(models) {
    // associations can be defined here
  };
  return Game;
};