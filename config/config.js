const getConfig = () => {
  const { DB_NAME, DB_PASSWORD, DB_USER } = process.env

  switch (process.env.NODE_ENV) {
    case 'local':
      return {
        dbConnection: 'mysql://root:devpw@127.0.0.1:3306/reactdb',
      }
    default:
      return {
        dbConnection: `mysql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:3306/${DB_NAME}`,
      }
  }
}

module.exports = getConfig()
