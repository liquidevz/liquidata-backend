module.exports = {
  apps: [{
    name: 'liquidata-backend',
    script: 'server.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,
      HOST: '0.0.0.0'
    },
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto restart configuration
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'public/uploads'],
    max_restarts: 10,
    min_uptime: '10s',
    
    // Memory and CPU limits
    max_memory_restart: '1G',
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // Advanced PM2 features
    merge_logs: true,
    time: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Source map support
    source_map_support: true,
    
    // Instance variables
    instance_var: 'INSTANCE_ID',
    
    // Cron restart (optional - restart daily at 2 AM)
    cron_restart: process.env.NODE_ENV === 'production' ? '0 2 * * *' : null,
    
    // Auto restart on file changes (development only)
    watch: process.env.NODE_ENV !== 'production',
    
    // Exponential backoff restart delay
    exp_backoff_restart_delay: 100,
    
    // Node.js options
    node_args: [
      '--max-old-space-size=1024',
      '--optimize-for-size'
    ]
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/liquidata.git',
      path: '/opt/liquidata-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};
