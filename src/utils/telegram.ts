import { telegramConfig } from "@/config"
import TelegramBot from "node-telegram-bot-api"
import { tgLogger } from "./log"

// ============== interface ====================
export type TgBotId = number | string

// ============== config ====================

// ============== methods ====================
export function getTgBotConfig(botId: TgBotId) {
  return telegramConfig.bots.find((item) => item.id === botId)
}

export async function setTgBotWebHook() {
  try {
    await Promise.all(
      telegramConfig.bots.map(async (botConfig) => {
        if (!botConfig) {
          throw new Error("没有找到对应的 tgBotConfig")
        }
        const tgBot = getTgBot(botConfig.id)
        const hookUrl = `${telegramConfig.webhookUrl}?botId=myBot`
        await tgBot.setWebHook(hookUrl)
        tgLogger.info(`bot ${botConfig.id} webhook set as ${hookUrl}`)
      })
    )
  } catch (error) {
    tgLogger.error(error)
  }
}

export function getTgBot(botId: TgBotId) {
  const botConfig = getTgBotConfig(botId)
  if (!botConfig) {
    throw new Error("没有找到对应的 tgBotConfig")
  }
  const tgBot = new TelegramBot(botConfig.token)
  return tgBot
}
