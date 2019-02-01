const path = require('path')
const { entry } = require('../config').pm2
const resolve = file => path.resolve(__dirname, file)

module.exports = {
  apps: [
    {
      name: entry,
      script: resolve('../bin/app.js'),
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
