module.exports = MAPP.injectRouter(
  {
    prefix: '/api-v1'
  },
  R => {
    // 获取当前最新期刊
    R.get('/classic/latest', async ctx => {
      try {
        let { result } = await MAPP.db_queryAll({
          model: 'periodical',
          params: { limit: 1 },
          sort: { index: -1 },
          options: { lean: true }
        })
        let len = result.length
        ctx.body = MAPP.info({
          code: 200,
          message: '查询成功',
          data: len > 0 ? result[0] : {}
        })
      } catch (err) {
        ctx.body = MAPP.info({
          code: 500,
          irregularInfo: err
        })
      }
    })
      // 获取当前一期的上一期
      .get('/classic/:index/previous', async ctx => {
        try {
          let index = ctx.params.index
          let result = await MAPP.db_getOne({
            model: 'periodical',
            condition: { index: parseInt(index) - 1 },
            options: { lean: true }
          })
          ctx.body = MAPP.info({
            code: result ? 200 : 3000,
            message: result ? '查询成功' : '期刊不存在',
            data: result
          })
        } catch (err) {
          ctx.body = MAPP.info({
            code: 500,
            irregularInfo: err
          })
        }
      })
      // 获取当前期刊的下一期
      .get('/classic/:index/next', async ctx => {
        try {
          let index = ctx.params.index
          let result = await MAPP.db_getOne({
            model: 'periodical',
            condition: { index: parseInt(index) + 1 },
            options: { lean: true }
          })
          ctx.body = MAPP.info({
            code: result ? 200 : 3000,
            message: result ? '查询成功' : '期刊不存在',
            data: result
          })
        } catch (err) {
          ctx.body = MAPP.info({
            code: 500,
            irregularInfo: err
          })
        }
      })
      // 点赞
      .post('/like', async ctx => {
        try {
          let { art_id, type } = ctx.request.body
          let result = await MAPP.db_setOne({
            model: 'periodical',
            condition: { _id: art_id, type },
            data: { like_status: true },
            inc: { fav_nums: 1 }
          })
          ctx.body = MAPP.info({ code: 200, message: '设置成功', data: result })
        } catch (err) {
          ctx.body = MAPP.info({
            code: 500,
            irregularInfo: err
          })
        }
      })
      // 取消点赞
      .post('/like/cancal', async ctx => {
        try {
          let { art_id, type } = ctx.request.body
          let result = await MAPP.db_setOne({
            model: 'periodical',
            condition: { _id: art_id, type },
            data: { like_status: false },
            inc: { fav_nums: -1 }
          })
          ctx.body = MAPP.info({ code: 200, message: '设置成功', data: result })
        } catch (err) {
          ctx.body = MAPP.info({
            code: 500,
            irregularInfo: err
          })
        }
      })
  }
)
