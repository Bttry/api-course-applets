const Koa = require('koa')
const path = require('path')
const Logger = require('koa-logger')
const Static = require('koa-static')
const Onerror = require('koa-onerror')
const proConfig = require('../config')
const BodyParser = require('koa-bodyparser')

const app = new Koa()
const isProd = process.env.NODE_ENV === 'production'
const resolve = file => path.resolve(__dirname, file)
const { POST, HOST } = proConfig.app

/**
 * 挂载方法
 */
const utils = require('../lib/utils')
global.MAPP = utils
Object.assign(global.MAPP, require('../lib/utils/dataQueryTemplate'))

/**
 * 处理跨域
 */
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE')
  ctx.set(
    'Access-Control-Allow-Headers',
    'x-requested-with, accept, origin, content-type, x-access-token'
  )
  ctx.set('Content-Type', 'application/json;charset=utf-8')
  ctx.set('Access-Control-Max-Age', 300)
  await next()
})

/**
 * mongodb 连接
 */
require('./db')

Onerror(app)
app.use(Logger())
app.use(BodyParser())

/**
 * 加载路由
 */
const routes = require('../src/routes')
app.use(routes())

if (!isProd) {
  app.use(Static(resolve('../uploads')))
}

app.listen(POST, HOST, () => {
  console.log(`server is listening on http://${HOST}:${POST}`)
})
