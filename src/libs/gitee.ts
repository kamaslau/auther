/**
 * Gitee相关
 *
 * https://gitee.com/api/v5/oauth_doc#/
 * https://gitee.com/api/v5/swagger#/getV5User
 *
 * 处理授权、用户资料获取等业务
 */

type clientCode = string

/**
 * 获取access_token
 *
 * 凭证为客户端请求GiteeAPI获取的code，以及在Gitee注册的client_id、client_secret
 */
interface Credentials {
  client_id: string
  client_secret: string
  code: clientCode
}

const composeCredentials = (code: clientCode): Credentials => ({
  client_id: process.env.GE_ID as string,
  client_secret: process.env.GE_SECRET as string,
  code,
})

const catchError = (error: Error): void => {
  throw new Error(JSON.stringify(error))
}

const requestToken = async (credentials: Credentials): Promise<any> => {
  // console.log('requestToken: ', credentials)

  const params = new URLSearchParams({
    ...credentials,
    grant_type: 'authorization_code',
    redirect_uri: process.env.GE_REDIRECT_URI as string
  }).toString()
  // console.log('params: ', params)

  const result = await fetch(`https://gitee.com/oauth/token?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    }
  })
    .then((res) => res.json())
    .catch(catchError)

  // console.log('result: ', result)
  return result
}

/**
 * 获取用户数据；凭证为access_token
 */
const requestUserAccount = async (token: string): Promise<any> => {
  console.log('requestUserAccount: ', token)

  const result: any = await fetch(
    `https://gitee.com/api/v5/user?access_token=${token}`,
    {
      headers: { Authorization: `bearer ${token}` }
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
 * 获取Gitee用户数据
 * 
 * 1. 应用客户端获取code
 *  - Web示例（一并请求获取用户Email的权限）: https://gitee.com/oauth/authorize?client_id=2e1010ee2430d265284e236426d7199f2d936cd6b6e67c8784face7f5ad27f5b&response_type=code
 * 2. 应用服务端使用code向Gitee服务端请求access_token
 * 3. 应用服务端使用access_token向Gitee服务端请求用户数据
 */
export const main = async (code: clientCode): Promise<any> => {
  const credentials = composeCredentials(code)

  const { access_token } = await requestToken(credentials)

  const user = await requestUserAccount(access_token)

  return { ...user }
}

export default main
