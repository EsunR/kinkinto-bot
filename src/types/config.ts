// ============== system config =================
export interface SysConfig {
  /** 服务端口 */
  port: number
}

export interface DatabaseConfig {
  /** MySQL 主机 */
  host: string
  /** 端口号 */
  port: number
  /** 数据库名称 */
  database: string
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

// ============== telegram bot config =================
export interface TelegramConfig {
  webhookUrl: string
  bots: {
    id: string
    token: string
  }[]
}

// ============== qq bot config =================
export interface QQBotConfig {
  /** Bot 的管理者 QQ 号 */
  admins: string[]
  /** mira http 接口请求地址 */
  host: string
  /** mira 鉴权密码 */
  verifyKey: string
  /** Bot 的 QQ 号 */
  botQQ: string
  /** Bot 的诞生日期 */
  birthDayTimestamp: number
}

// ============== bot app config =================
export interface BotAppConfig {
  /** 天气 APP 配置 */
  weatherReporter?: {
    /** 和风天气 API 密钥 */
    apiKey: string
    /** 高德地图 API 密钥 */
    amapApiKey: string
  }
  rssHub?: {
    /** rsshub 服务器列表 */
    services: string[]
    /** 临时参数 */
    _qqGroups: string[]
  }
}
