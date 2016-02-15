import Router from 'koa-router'
import User from '../models/users'
import config from '../../config/config'
import jwt from 'jsonwebtoken'

const router = new Router({ prefix: '/users' })

router.get('/',
  async (ctx) => {
    const users = User.find({}, '-password -salt')
    ctx.body = users
  }
)

router.get('/:id',
  async (ctx) => {
    const user = await User.findById(ctx.params.id, '-password -salt')
    if (!user) {
      ctx.throw(404)
    }

    ctx.body = user
  }
)

router.post('/',
  async (ctx) => {
    const user = new User(ctx.request.body.user)
    try {
      await user.save()
      const token = jwt.sign({ id: user.id }, config.token)

      const response = user.toJSON()

      delete response.password
      delete response.salt

      ctx.body = {
        user: response,
        token
      }
    } catch (err) {
      ctx.throw(422, err)
    }
  }
)

router.put('/:id',
  async (ctx) => {
    const user = await User.findById(ctx.params.id)

    if (!user) {
      ctx.throw(404)
    }

    Object.assign(user, ctx.request.body.user)

    await user.save()

    ctx.body = 200
  }
)

router.delete('/:id',
  async (ctx) => {
    const user = await User.findById(ctx.params.id)

    if (!user) {
      ctx.throw(404)
    }

    await user.remove()

    ctx.body = 200
  }
)

export default router
