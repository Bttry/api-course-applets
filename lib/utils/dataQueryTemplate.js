const requireDir = require('require-dir')
const models = requireDir('../../src/model')
const dataModels = {}
Object.keys(models).forEach(o => {
  Object.assign(dataModels, models[o])
})

module.exports = {
  db_queryAll: parameter => {
    return new Promise(async resolve => {
      let {
          // 数据表
          model = '',
          // 请求参数
          params = {},
          // 查询条件
          condition = {},
          // 过滤
          filters = {},
          // 查询配置
          options = {},
          // 排序条件
          sort = {},
          // 是否翻页
          pageTurn = true,
          // 类型
          type = '',
          // populate 配置
          populate = []
        } = parameter,
        dataModel = dataModels[model],
        { limit, page } = params,
        result = null

      limit = parseInt(limit || 10)
      page = parseInt(page || 1)

      if (pageTurn) Object.assign(options, { skip: (page - 1) * limit, limit })

      let count = await dataModel.countDocuments(condition)

      if (type === 'populate') {
        let len = populate.length

        switch (len) {
          case 1:
            result = await dataModel
              .find(condition, filters, options)
              .populate(
                Object.assign(populate[0], {
                  model: dataModels[populate[0].model]
                })
              )
              .sort(sort)
            break
          case 2:
            result = await dataModel
              .find(condition, filters, options)
              .populate(
                Object.assign(populate[0], {
                  model: dataModels[populate[0].model]
                })
              )
              .populate(
                Object.assign(populate[1], {
                  model: dataModels[populate[1].model]
                })
              )
              .sort(sort)
        }
      } else if (type === 'noPage' && !pageTurn) {
        result = await dataModel
          .find(condition, filters, options)
          .sort(sort)
          .batchSize(count + 10)
      } else {
        result = await dataModel.find(condition, filters, options).sort(sort)
      }

      resolve({ result, count })
    })
  },
  db_getOne: parameter => {
    return new Promise(async resolve => {
      let {
          // 数据表
          model = '',
          // 查询条件
          condition = {},
          // 过滤
          filters = {},
          // 查询配置
          options = {}
        } = parameter,
        dataModel = dataModels[model]

      let result = await dataModel.findOne(condition, filters, options)
      resolve(result)
    })
  },
  db_addOne: parameter => {
    return new Promise(async resolve => {
      let {
          // 数据表
          model = '',
          // 保存数据
          data = {}
        } = parameter,
        dataModel = dataModels[model]

      let object = new dataModel(data)
      let result = await object.save()
      resolve(result)
    })
  },
  db_setOne: parameter => {
    return new Promise(async resolve => {
      let {
          // 数据表
          model = '',
          // 条件
          condition = {},
          // 保存数据
          data = {},
          // inc 配置
          inc = {},
          // 配置
          options = { new: true }
        } = parameter,
        dataModel = dataModels[model]

      let result = await dataModel.findOneAndUpdate(
        condition,
        {
          $set: data,
          $inc: inc
        },
        options
      )
      resolve(result)
    })
  },
  db_deleteOne: parameter => {
    return new Promise(async resolve => {
      let {
          // 数据表
          model = '',
          // 数据表 - 删除
          delModel = '',
          // 条件
          condition = {},
          // 配置
          options = { rawResult: true },
          // 是否数据备份
          dataBackup = false
        } = parameter,
        dataModel = dataModels[model]
      let { ok, value } = await dataModel.findOneAndDelete(condition, options)
      if (ok === 1 && dataBackup === true) {
        let dataDelModel = dataModels[delModel || model + 'Del']
        await dataDelModel.findOneAndUpdate({ _id: value._id }, value, {
          upsert: true
        })
      }
      resolve({ ok, value })
    })
  },
  db_getCount: parameter => {
    return new Promise(async resolve => {
      let {
          // 数据表
          model = '',
          // 条件
          condition = {}
        } = parameter,
        dataModel = dataModels[model]

      let count = (await dataModel.countDocuments(condition)) || 0

      resolve(count)
    })
  }
}
