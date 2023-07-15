// External
import * as dotenv from 'dotenv'
import Koa from 'koa'
import bodyParser from '@koa/bodyparser' // 处理json和x-www-form-urlencoded
import serve from 'koa-static'
import cors from '@koa/cors'

// Local
import { errorCatcher, consoleInit, consoleStart, briefLog, methodHandler } from './utils.js'
import authGithub, { getAuthUrl } from './libs/github.js'

dotenv.config()

consoleInit()

process.env.NODE_ENV === 'development' &&
  console.log(
    'Request GitHub auth code with url: ',
    getAuthUrl()
  )

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

app.use(cors({ origin: '*', allowMethods: 'POST' }))

app.use(methodHandler)

app.use(bodyParser())
process.env.NODE_ENV === 'development' && app.use(async (ctx, next) => {
  // console.log('request body: ', ctx.request.body)

  await next()
})

// app.use(authGithub)

type authInput = object | string | any
interface authBody {
  vendor: string
  input: authInput
}
const mainHandler: Koa.Middleware = async (ctx) => {
  // 判断并调用相应登陆方式
  const { vendor, input } = ctx.request.body as authBody
  // console.log(vendor, input)

  let user

  switch (vendor.toLowerCase()) {
    case 'github':
      user = await authGithub(input)
      break

    default:
      user = null
  }

  ctx.body = {
    data: { user },
    request: {
      header: ctx.headers,
      body: ctx.request.body
    }
  }
}
app.use(mainHandler)

app.listen(process.env.PORT)

consoleStart()
