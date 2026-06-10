const BASE = '/home/william/web'
const secrets = require('./secrets')

module.exports = {
  name: 'react-set',
  cwd: `${BASE}/react-set/backend/src`,
  script: `index.ts`,
  interpreter: '/usr/local/bin/bun',
  exec_mode: 'fork',
  instances: 1,
  autorestart: true,
  // add restart delay
  restart_delay: 4000,
  // add maximum restarts
  max_restarts: 5,
  watch: false,
  max_memory_restart: '128M',
  env: {
    PORT: '5002',
    NODE_ENV: 'production',
  },
}
