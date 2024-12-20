import ResBody from "@/struct/ResBody"
import { tgLogger } from "@/utils/log"
import { getTgBot, setTgBotWebHook } from "@/utils/telegram"
import Router from "koa-router"
import { ITgWebHookReqData, ITgWebHookReqQuery } from "./types"

// 初始化 TgBot
setTgBotWebHook()

const router: Router = new Router()

router.post("/webhook", async (ctx) => {
  const reqBody = ctx.request.body as ITgWebHookReqData
  const reqQuery = ctx.request.query as never as ITgWebHookReqQuery
  const botId = reqQuery.botId
  const chatId = reqBody.message.chat.id
  const msgText = reqBody.message.text.trim()
  const tgBot = getTgBot(botId)
  tgLogger.mark(
    `tg bot ${botId} received message form ${reqBody.message.from.first_name}: ${msgText}`
  )

  // TODO: 完善 TG Bot
  tgBot.sendMessage(chatId, "鑫鑫子正在待命中")

  ctx.body = new ResBody({
    data: { time: new Date() },
  })
})

export default router
