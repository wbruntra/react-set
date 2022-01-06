const BASE = '/home/pi/web'
const secrets = require('./secrets')

module.exports = {
  name: 'react-set',
  script: `${BASE}/react-set-server/server.js`,
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '128M',
  env: {
    PORT: '5002',
    NODE_ENV: 'production',
    DB_USER: secrets.DB_USER,
    DB_PASSWORD: secrets.DB_PASSWORD,
    DB_NAME: secrets.DB_NAME,
  },
}
