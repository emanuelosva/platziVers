module.exports = {
  apps: [
    {
      name: 'platziverse-mqtt',
      script: './platziverse-mqtt/server.js',
      watch: './platziverse-mqtt/',
      ignore_watch: ['[\/\\]\./', 'node_modules'],
      env: {
        NODE_ENV: 'development',
        DEBUG: 'platziverse:*',
        PORT: 1883,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '',
      },
    },
    {
      name: 'platziverse-api',
      script: './platziverse-api/src/bin/www',
      watch: './platziverse-api/',
      ignore_watch: ['[\/\\]\./', 'node_modules'],
      env: {
        NODE_ENV: 'development',
        DEBUG: 'platziverse:*',
        PORT: 3000,
        SECRET: 'secretDev',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '',
        SECRET: '',
      },
    },
    {
      name: 'platziverse-web',
      script: './platziverse-web/src/server/index.js',
      watch: './platziverse-api/',
      ignore_watch: ['[\/\\]\./', 'node_modules'],
      env: {
        NODE_ENV: 'development',
        DEBUG: 'platziverse:*',
        PORT: 8080,
        API_URL: 'http://localhost:3000',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '',
        API_URL: '',
        API_TOKEN: '',
      },
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
