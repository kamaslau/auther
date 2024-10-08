/**
 * GitHub相关
 *
 * 处理授权、用户资料获取等业务
 */

/**
 * 获取鉴权URL
 */
export const getAuthUrl = (): string => `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_APP_ID}&redirect_uri=http://localhost:${process.env.PORT}&scope=user:email`

type clientCode = string

interface Credentials {
  client_id: string
  client_secret: string
  code: clientCode
}

const composeCredentials = (code: clientCode, appId: string, appSecret: string): Credentials => ({
  client_id: appId ?? process.env.GITHUB_APP_ID,
  client_secret: appSecret ?? process.env.GITEE_APP_SECRET,
  code,
})

const catchError = (error: Error) => {
  console.error('error: ', error)
  throw new Error(JSON.stringify(error))
}

/**
 * 获取access_token
 *
 * 凭证为客户端请求GitHubAPI获取的code，以及在GitHub注册的client_id、client_secret
 */
const requestAccessToken = async (credentials: Credentials) => {
  // console.log('requestAccessToken: ', credentials)

  const result = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  })
    .then((res) => res.json())
    .catch(catchError)

  // console.log('result: ', result)
  return result
}

/**
 * 获取用户数据；凭证为access_token
 */
const requestUserAccount = async (token: string) => {
  // console.log('requestUserAccount: ', token)

  const result = await fetch(
    `https://api.github.com/user?access_token=${token}`,
    {
      headers: { Authorization: `bearer ${token}` },
    }
  )
    .then((res) => res.json())
    .catch(catchError)

  if (typeof result.message === 'string') {
    throw new Error(result.message)
  }

  // console.log('result: ', result)
  return result
}

/**
 * 获取GitHub用户数据
 *
 * 1. 应用客户端获取code
 *  - Web示例（一并请求获取用户Email的权限）: https://github.com/login/oauth/authorize?client_id=a6e28821c0efcfb69d7d&scope=user:email
 * 2. 应用服务端使用code向GitHub服务端请求access_token
 * 3. 应用服务端使用access_token向GitHub服务端请求用户数据
 */
export const main = async (ctx, params): Promise<any | null> => {
  // console.log('params: ', params)

  const { code, appId, appSecret } = params

  const credentials = composeCredentials(code, appId, appSecret)

  try {
    const { access_token } = await requestAccessToken(credentials)

    const user = await requestUserAccount(access_token)

    return user

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error(error)

    ctx.body.error = {
      message: (error as Error).message
    }

    return null

  }
}

export default main
