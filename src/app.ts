import * as dotenv from 'dotenv'
import Koa from 'koa'
import cors from '@koa/cors'
import { errorCatcher, consoleInit, briefLog, methodHandler } from './utils.js'
// import auth from './libs/github.js'

dotenv.config()

consoleInit()

process.env.NODE_ENV === 'development' &&
  console.log(
    'Request code with url: ',
    `https://github.com/login/oauth/authorize?client_id=${process.env.APP_ID}&redirect_uri=http://localhost:${process.env.PORT}&scope=user:email`
  )

const app = new Koa()

app.on('error', errorCatcher)

app.use(briefLog)

app.use(cors({ origin: '*', allowMethods: 'POST' }))

app.use(methodHandler)

// app.use(auth)

app.listen(process.env.PORT)
