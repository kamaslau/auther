/**
 * 微信相关
 *
 * 处理微信授权、微信登录、用户资料获取、关注/取消关注等业务
 */
/**
 * 获取网页授权access_token
 *
 * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
 */

interface WebAccessToken {
  access_token: string
  expires_in: number
  openid: string
  refresh_token: string
  scope: string
}
const webAccessToken = async (): Promise<WebAccessToken> => {
  const result: any = await fetch(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WC_ID ?? ''}&secret=${process.env.WC_SECRET ?? ''}&code=CODE&grant_type=authorization_code`
  )
    .then(async (res) => await res.json())
    .catch((error) => {
      throw new Error(error)
    })

  console.log(result)
  return result
}

/**
 * 通过网页授权获取用户信息
 */
interface WebUserInfo {
  city: string
  country: string
  headimgurl: string
  nickname: string
  openid: string
  privilege: []
  province: string
  sex: number
  unionid: string
}
const webUserInfo = async (token: string, open_id: string): Promise<WebUserInfo> => {
  const result: any = await fetch(
    `https://api.weixin.qq.com/sns/userinfo?access_token=${token}&openid=${open_id}&lang=zh_CN`
  )
    .then(async (res) => await res.json())
    .catch((error) => {
      throw new Error(error)
    })

  console.log(result)
  return result
}

/**
 * 获取基础支持access_token
 */
interface AccessToken {
  expires_in: number
  token: string
}
const getAccessToken = async (): Promise<AccessToken> => {
  const result: any = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.WA_ID ?? ''}&secret=${process.env.WA_SECRET ?? ''}`
  )
    .then(async (res) => await res.json())
    .catch((error) => {
      throw new Error(error)
    })

  console.log(result)
  return result
}

/**
 * 获取用户session
 */
interface Session {
  openid: string
  session_key: string
  unionid: string
  errcode: number
  errmsg: string
}
const code2Session = async (code: string): Promise<Session> => {
  const result: any = await fetch(
    `https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code&appid=${process.env.WA_ID}&secret=${process.env.WA_SECRET}&js_code=${code}`
  )
    .then(async (res) => await res.json())
    .catch((error) => {
      throw new Error(error)
    })

  // console.log(result)

  if (result.errcode && result.errcode !== 0) {
    throw new Error(result.errmsg)
  }

  return result
}

export { webAccessToken, webUserInfo, getAccessToken, code2Session }
