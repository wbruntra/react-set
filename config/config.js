let dbConnection

switch (process.env.NODE_ENV) {
  case 'production':
    dbConnection = 'mariadb://pi:curses@127.0.0.1:3306/reactdb'
    break
  default:
    dbConnection = 'mariadb://root:sylo@172.17.0.2:3306/reactdb'
}

module.exports = {
  dbConnection,
}
