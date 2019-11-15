const BASE = '/home/william/workspace/node/react-set'

module.exports = {
  apps : [{
    name: 'set',
    script: `${BASE}/venv/bin/uwsgi`,
    args: 'uwsgi-config.ini',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '128M',
    env: {
      PORT: '5002',
      FLASK_RUN_PORT: '5002',
      NODE_ENV: 'production',
    },
  }],
};
