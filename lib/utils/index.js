const path = require('path')
const Mongoose = require('mongoose')
const dataOperation = require('./dataOperation')
const fileOperation = require('./fileOperation')
const statusCode = require('../data/statusCode.json')

/**
 * 信息统一返回
 * @param {JSON} message  信息
 * @param {String} data 数据
 * @param {Number} stack 编码
 */
function info(params) {
  let { message = '', data = {}, code = 2001, success = true } = params

  if (!(code + '').startsWith('2')) success = false

  return {
    code,
    message: message || statusCode[code],
    success,
    data
  }
}

function resolvePath(...args) {
  return path.resolve(...args)
}

module.exports = Object.assign(dataOperation, fileOperation, {
  /**
   * mongoose 挂载
   */
  Mongoose,
  /**
   * mongoose Schema Id
   */
  ObjectId: Mongoose.Schema.ObjectId,
  /**
   * mongoose Types Id
   */
  MTypesId: Mongoose.Types.ObjectId,
  /**
   * 以根目录下拼接
   */
  resolvePath,
  /**
   * koa router 注入
   * @param {JSON} option router 配置
   * @param {Function} fn 实例后执行
   * @param {Boolean} verify  验证，默认为true
   */
  injectRouter: function(options, fn, verify = true) {
    const Router = require('koa-router')
    const router = new Router(options)
    fn(router)
    return [router.routes(), router.allowedMethods()]
  },
  /**
   * mongoose modle 封装
   * @param {JSON} field  字段
   * @param {String} table 表名
   * @param {Boolean} isIdentical 是否与表名一致
   * @param {return} mongo mongo 连接 mode new模块对象
   */
  injectDBModel: function(field, table, isIdentical = true) {
    const Schema = Mongoose.Schema
    const mode = new Schema(field, {
      versionKey: false
    })
    const mongo = Mongoose.model(table, mode, isIdentical ? table : undefined)
    const tabledel = `${table}-del`
    const mongodel = Mongoose.model(
      tabledel,
      mode,
      isIdentical ? tabledel : undefined
    )
    return {
      mongo,
      mongodel,
      mode
    }
  },
  info
})
