import TelegramBot from "node-telegram-bot-api"
import { TgBotMenuEnum } from "./types"

export const tgBotStateMap: Map<number, { menuStatus?: TgBotMenuEnum }> =
  new Map()

export const DEFAULT_RESPONSE = [
  "发生什么事了 Σ(っ °Д °;)っ",
  "鑫鑫子不知所措 Σ(っ °Д °;)っ",
  "你要作甚？",
  "鑫鑫子只会按照主人的吩咐做事",
  "我恁爹！",
]

export function sendDefaultText(tgBot: TelegramBot, chatId: number) {
  tgBot.sendMessage(
    chatId,
    DEFAULT_RESPONSE[Math.floor(Math.random() * DEFAULT_RESPONSE.length)]
  )
}
