const getConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        dbConnection: 'mariadb://pi:curses@127.0.0.1:3306/reactdb',
      }
      break
    default:
      return {
        dbConnection: 'mariadb://root:sylo@127.0.0.1:3306/reactdb',
      }
  }
}

module.exports = getConfig()
