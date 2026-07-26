module.exports = {
  apps: [
    {
      name: 'finygo-api',
      script: './build/bin/server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3333,
        HOST: '0.0.0.0'
      },
      out_log_file: './logs/out.log',
      error_log_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
