import { telegramConfig } from "@/config"
import TelegramBot from "node-telegram-bot-api"

export const myBot = new TelegramBot(
  telegramConfig.bots.find((item) => item.id === "myBot")?.token ?? ""
)
