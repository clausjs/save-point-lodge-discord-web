module.exports = {
    apps : [{
      name: 'Save Point Lodge Web',
      script: './github/planet-express-discord-web/server/app.js',
  
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      kill_timeout: 5000
    }],
  
    // deploy : {
    //   production : {
    //     user : 'node',
    //     host : '212.83.163.1',
    //     ref  : 'origin/master',
    //     repo : 'git@github.com:repo.git',
    //     path : '/var/www/production',
    //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    //   }
    // }
  };