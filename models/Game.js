const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('./connection')

class Game extends Model {}
Game.init(
  {
    total_time: DataTypes.INTEGER,
    player_won: DataTypes.INTEGER,
    difficulty_level: DataTypes.INTEGER,
    winning_score: DataTypes.INTEGER,
    player_uid: DataTypes.TEXT,
  },
  { sequelize, modelName: 'game' },
)

sequelize.sync()

module.exports = Game
