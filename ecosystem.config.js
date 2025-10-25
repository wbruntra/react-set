const BASE = '/home/william/web'
const secrets = require('./secrets')

module.exports = {
  name: 'react-set',
  script: `${BASE}/react-set/server.js`,
  interpreter: 'bun',
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '128M',
  env: {
    PORT: '5002',
    NODE_ENV: 'production',
  },
}
