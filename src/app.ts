// External
import * as dotenv from 'dotenv'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser' // 处理json和x-www-form-urlencoded
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

app.use(cors({ origin: '*', allowMethods: 'POST' }))

app.use(methodHandler)

app.use(bodyParser())
process.env.NODE_ENV === 'development' && app.use(async (ctx, next) => {
  await next()
  ctx.body = ctx.request.body
})

// app.use(authGithub)

const mainHandler: Koa.Middleware = async (ctx, next) => {
  await next()
}
app.use(mainHandler)

app.listen(process.env.PORT)

consoleStart()
