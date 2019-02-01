module.exports = MAPP.injectRouter(
  {
    prefix: '/api-v1'
  },
  R => {
    R.get('/classic/latest', async ctx => {
      try {
        let result = await MAPP.db_getOne({
          model: 'periodical',
          options: { lean: true }
        })
        ctx.body = MAPP.info({ code: 2001, data: result })
      } catch (err) {
        console.error(err)
        ctx.body = MAPP.info({ code: 3001 })
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
          ctx.body = MAPP.info({ code: 2002, data: result })
        } catch (err) {
          console.error(err)
          ctx.body = MAPP.info({ code: 3002 })
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
          ctx.body = MAPP.info({ code: 2002, data: result })
        } catch (err) {
          console.error(err)
          ctx.body = MAPP.info({ code: 3002 })
        }
      })
  }
)
