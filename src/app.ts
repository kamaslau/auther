// External
import * as dotenv from 'dotenv'
import Koa from 'koa'
import { bodyParser } from '@koa/bodyparser' // 处理json和x-www-form-urlencoded
import serve from 'koa-static'
import cors from '@koa/cors'
import { z } from 'zod'

// Local
import { errorCatcher, consoleInit, consoleStart, briefLog, methodHandler } from './utils.js'
import authGithub, { getAuthUrl as getGithubAuthUrl } from './libs/github.js'
import authGitee, { getAuthUrl as getGiteeAuthUrl } from './libs/gitee.js'
import { code2Session as authWeapp } from './libs/wechat.js'

dotenv.config()

consoleInit()

const app = new Koa()

app.on('error', errorCatcher)

app.use(briefLog)

if (process.env.NODE_ENV === 'development') {
  const staticOpts = {
    maxage: 1000 * 60
  }
  app.use(serve('public', staticOpts))
} else {
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

/**
 * 验证输入值
 */
type authInput = object | string
interface authBody {
  vendor: string
  input: authInput
}
const inputValidator: Koa.Middleware = async (ctx, next) => {
  const result = z.object({
    vendor: z.string(),
    input: z.any()
  }).safeParse(ctx.request.body)

  if (!result.success) {
    // console.log('result.error: ', result.error)

    ctx.status = 422
    ctx.body.error = result.error.issues.map(item => `${item.path.join('->')}: ${item.message}`).join('; ')
  } else {
    ctx.payload = result.data
    await next()
  }
}
app.use(inputValidator)

const mainHandler: Koa.Middleware = async (ctx) => {
  // 判断并调用相应登陆方式
  const { vendor, input } = ctx.payload as authBody

  let result: any = null

  switch (vendor?.toLowerCase()) {
    case 'gitee':
      result = await authGitee(ctx, input)
      break

    case 'github':
      result = await authGithub(ctx, input)
      break

    case 'weapp':
      result = await authWeapp(ctx, input)
      break

    default:
      ctx.throw(400, 'No valid vendor matched')
  }

  ctx.body.data = result
}
app.use(mainHandler)

// Launch server
app.listen(process.env.PORT)
consoleStart()
if (process.env.NODE_ENV === 'development') {
  console.log(
    '\x1b[32m%s\x1b[33m', 'Request GitHub auth code with url:\n',
    getGithubAuthUrl()
  )

  console.log(
    '\x1b[32m%s\x1b[33m', 'Request Gitee auth code with url:\n',
    getGiteeAuthUrl()
  )

  console.log(
    '\x1b[32m%s\x1b[0m', '🟢 ============================\n'
  )
}