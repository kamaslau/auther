// External
import * as dotenv from 'dotenv'
import Koa from 'koa'
import bodyParser from '@koa/bodyparser' // 处理json和x-www-form-urlencoded
import serve from 'koa-static'
import cors from '@koa/cors'
import Joi from 'joi'

// Local
import { errorCatcher, consoleInit, consoleStart, briefLog, methodHandler } from './utils.js'
import authGithub, { getAuthUrl as getGithubAuthUrl } from './libs/github.js'
import authGitee, { getAuthUrl as getGiteeAuthUrl } from './libs/gitee.js'
import { code2Session as authWeapp } from './libs/wechat.js'

dotenv.config()

consoleInit()

if (process.env.NODE_ENV === 'development') {
  console.log(
    'Request GitHub auth code with url: ',
    getGithubAuthUrl()
  )

  console.log(
    'Request Gitee auth code with url: ',
    getGiteeAuthUrl()
  )
}

const app = new Koa()

app.on('error', errorCatcher)

app.use(briefLog)

if (process.env.NODE_ENV === 'development') {
  const staticRoot = 'public'
  const staticOpts = {
    maxage: 1000 * 60
  }
  app.use(serve(staticRoot, staticOpts))
}

if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: '*', allowMethods: 'POST' }))
  app.use(methodHandler)
}

app.use(bodyParser())
app.use(async (ctx, next) => {
  ctx.body = {
    // https://koajs.com/#request
    request: {
      header: ctx.headers,
      body: ctx.request.body,
      method: ctx.method,
      path: ctx.path,
      ip: ctx.ip,
      ips: ctx.ips,
    }
  }

  await next()
})

type authInput = object | string | any
interface authBody {
  vendor: string
  input: authInput
}

const inputValidator: Koa.Middleware = async (ctx, next) => {
  const schema = Joi.object({
    vendor: Joi.string().required(),
    input: Joi.object().required()
  })

  const result = schema.validate(ctx.request.body)
  // console.log('result: ', result)

  if (result.error) {
    ctx.status = 422
    ctx.body.error = result.error.details.map(item => item.message)
  } else {
    await next()
  }
}
// 验证输入值
app.use(inputValidator)

const mainHandler: Koa.Middleware = async (ctx) => {
  // 判断并调用相应登陆方式
  const { vendor, input } = ctx.request.body as authBody

  let result: any = null

  switch (vendor?.toLowerCase()) {
    case 'github':
      result = await authGithub(ctx, input)
      break

    case 'gitee':
      result = await authGitee(ctx, input)
      break

    case 'weapp':
      result = await authWeapp(ctx, input)
      break

    default:
      ctx.throw(400, 'No vendor is specified')
  }

  ctx.body.data = result
}
app.use(mainHandler)

app.listen(process.env.PORT)

consoleStart()
