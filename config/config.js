const getConfig = () => {
  const { DB_NAME, DB_PASSWORD } = process.env

  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        dbConnection: `mariadb://${DB_USER}:${DB_PASSWORD}@127.0.0.1:3306/${DB_NAME}`,
      }
    default:
      return {
        dbConnection: 'mariadb://root:devpw@127.0.0.1:3306/reactdb',
      }
  }
}

module.exports = getConfig()
