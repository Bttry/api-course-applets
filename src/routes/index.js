// koa-compose模块可以将多个中间件合成为一个
const path = require('path')
const Compose = require('koa-compose')

module.exports = () => {
  let allRouter = [],
    commandPath = MAPP.resolvePath(__dirname, './interfaces')

  MAPP.loadFiles({
    commandPath,
    callback: obj => {
      let { files, readFile } = obj
      if (path.extname(files) === '.js') {
        const route = require(readFile)
        if (Array.isArray(route) && route.length > 1)
          allRouter.push(route[0], route[1])
      }
    }
  })

  return Compose(allRouter)
}
