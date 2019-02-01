const fs = require('fs')
const path = require('path')
const { copyValue } = require('../lib/utils/dataOperation')
let baseConfig = require('./base.json')
let { mongodb } = baseConfig
const resolve = file => path.resolve(__dirname, file)

if (fs.existsSync(resolve('../project.config.json'))) {
  let medicalConfig = require('../project.config.json')
  copyValue(medicalConfig, baseConfig)
}

// mongodb
mongodb.DBURL = `mongodb://${
  mongodb.username ? mongodb.username + ':' + mongodb.password + '@' : ''
}${mongodb.host}:${mongodb.port}/${mongodb.name}`

module.exports = baseConfig
