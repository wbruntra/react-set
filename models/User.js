const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('./connection')

class User extends Model {}
User.init(
  {
    uid: {
      primaryKey: true,
      type: DataTypes.STRING,
    },
    email: DataTypes.STRING,
    info: DataTypes.JSON,
  },
  { sequelize, modelName: 'user' },
)

sequelize.sync()

module.exports = User
