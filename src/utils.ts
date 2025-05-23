/**
 * 工具方法
 */
// External
import type Koa from 'koa'
import os from 'node:os'

/**
 * 常用时间区间
 */
type timePeriods = Record<string, number>;
const periods: timePeriods = {
  _hour: 3600,
  _day: 8_6400,
  _week: 60_4800,
  _m28d: 241_9200,
  _m29d: 250_5600,
  _m30d: 259_2000,
  _m31d: 267_8400,
  _y365d: 3153_6000,
  _y366d: 3162_2400
}

/**
 * 错误处理
 *
 * @param {*} error
 * @param {*} ctx
 */
const errorCatcher = (error) => {
  console.error('server error: ', (error as Error).message)
}

/**
 * 获取当前时间戳
 *
 * 以当前本地语言显示
 *
 * @returns { string }
 */
const getTimeString = (locale: string = process.env.LOCALE ?? 'en-US'): string => {
  return new Date().toLocaleString(locale)
}

interface ipItem {
  address: string
  family: 'IPv4' | 'IPv6'
  internal: boolean
}

/**
 * 获取本地IP地址
 *
 * @param internal
 * @param family
 *
 * @returns { array }
 */
const getLocalIP = (
  internal: boolean | undefined = undefined,
  family: string[] = ['IPv4', 'IPv6']
): ipItem[] => {
  // console.log('getLocalIP: ', internal, family)

  const result: ipItem[] = []

  const interfaces = os.networkInterfaces()

  if (Object.keys(interfaces).length === 0) {
    return result
  }

  // 分别处理各网络接口分组
  for (const groupName in interfaces) {
    // console.log(interfaces[groupName])

    const group: os.NetworkInterfaceInfo[] = Array.isArray(interfaces[groupName]) ? (interfaces[groupName] ?? []) : []

    // 对各分组中的网络接口项进行处理
    for (const item of group) {
      // 仅处理特定类型的接口
      if (
        family.includes(item.family) &&
        (typeof internal === 'boolean' ? internal === item.internal : true)
      ) {
        result.push({
          address: item.address,
          family: item.family,
          internal: item.internal
        })
      }
    }
  }
  // console.log('result: ', result)

  return result
}

/**
 * 获取请求IP地址
 *
 * 在koa.js中间件中，通过 ctx.ip 可直接获取
 *
 * @param req
 * @returns {string} IP地址
 */
const getClientIP = (req: Koa.Request['req']): string => {
  // console.log('getClientIP: ', req)

  // 判断是否有反向代理 IP
  const result: string =
    req.headers['x-forwarded-for']?.toString() ?? // 判断是否有反向代理 IP
    req.headers['x-real-ip']?.toString() ??
    req.socket.remoteAddress ?? // 判断后端的 socket 的 IP
    ''

  // console.log('result: ', result)
  return result
}

/**
 * 输出程序初始化信息
 */
const consoleInit = (): void => {
  console.log(
    '\x1b[32m%s\x1b[0m',
    '\n\n🟡 ============================',
    `\n\n🚀 Launching ${process.env.npm_package_name as string} v${process.env.npm_package_version as string}`,
    `\n\n✨ Node.js ${process.version} is started under ${process.env.NODE_ENV as string}\n`
  )
}

/**
 * 输出业务启动信息
 */
const consoleStart = (): void => {
  const serverPort = process.env.PORT ?? 3000

  console.log(
    '\x1b[32m%s\x1b[0m', `\n👂 Koa.js now listening on ${serverPort} at:\n`
  )
  console.log(
    '\x1b[32m%s\x1b[33m',
    'Root    ', `http://localhost:${serverPort}`
  )

  // 输出本地IP
  const localIPs = getLocalIP(undefined, ['IPv4'])
  localIPs.forEach(item => {
    console.log(
      '\x1b[32m%s\x1b[33m',
      'Root    ', `http://${item.address as string}:${serverPort as string} (${item.internal === true ? 'local' : 'external'})`
    )
  })

  console.log(
    '\x1b[32m%s\x1b[0m', '🟢 ============================\n'
  )
}

const briefLog: Koa.Middleware = async (ctx, next) => {
  // 按需开启不同测试信息的输出
  // console.log('ctx.req(node req): ', ctx.req)
  // console.log('ctx.request: ', ctx.request)

  const start: number = Date.now()
  if (ctx.url !== '/favicon.ico') await next()

  const duration: number = Date.now() - start
  const durationText = `${duration}ms`

  ctx.set('X-Response-Time', durationText)
  ctx.set('APP-Client-IP', ctx.ip ?? getClientIP(ctx.req))

  console.log(`${ctx.ip} ${ctx.method} ${ctx.type} > ${ctx.url} - ${durationText}`)
}

/**
 * Handle request method
 *
 * @param {*} ctx
 * @param {*} next
 */
export const methodHandler: Koa.Middleware = async (ctx, next) => {
  if (ctx.method === 'OPTIONS') {
    // Quickly response to OPTIONS method
    ctx.status = 204
  } else if (ctx.method === 'POST') {
    // Allow only POST method
    await next()
  } else {
    ctx.status = 405
  }
}

export {
  periods,
  errorCatcher,
  getTimeString,
  getLocalIP,
  getClientIP,
  consoleInit,
  consoleStart,
  briefLog
}
