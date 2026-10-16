const BASE = '/home/william/web'

module.exports = {
  apps: [
    {
      name: 'react-set',
      cwd: `${BASE}/react-set/backend`,
      script: 'src/index.ts',
      interpreter: 'bun',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 5,
      watch: false,
      max_memory_restart: '128M',
      env: {
        NODE_ENV: 'production',
        // Must match app_port in ansible/host_vars and the waker entry.
        PORT: '10817',
      },
    },
  ],
}
