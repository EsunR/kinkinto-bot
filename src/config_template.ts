import moment from "moment"
import {
  BotAppConfig,
  DatabaseConfig,
  QQBotConfig,
  SysConfig,
  TelegramConfig,
} from "./types/config"

export const sysConfig: SysConfig = {
  port: 9092,
}

export const databaseConfig: DatabaseConfig = {
  host: "localhost",
  port: 3306,
  database: "***",
  username: "***",
  password: "***",
}

export const telegramConfig: TelegramConfig = {
  webhookUrl: "http://your.domain.com/api/path",
  bots: [
    {
      id: "myBot",
      token: "******",
    },
  ],
}

export const qqBotConfig: QQBotConfig = {
  admins: ["***"],
  host: "http://localhost:****",
  verifyKey: "***",
  botQQ: "***",
  birthDayTimestamp: moment()
    .set("year", 2022)
    .set("month", 4)
    .set("date", 15)
    .valueOf(),
}

export const botAppConfig: BotAppConfig = {
  weatherReporter: {
    amapApiKey: "",
    apiKey: "",
  },
  rssHub: {
    services: [],
    _qqGroups: []
  },
}
