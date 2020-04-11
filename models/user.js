module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uid: {
      primaryKey: true,
      type: DataTypes.STRING,
    },
    email: DataTypes.STRING,
    info: DataTypes.JSON,
  })

  return User
}