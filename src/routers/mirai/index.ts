import helper from "@/instances/helper"
import { mirai } from "@/instances/mirai"
import { rssSubscriber } from "@/instances/rssSubscriber"
import { weatherReporter } from "@/instances/weatherReporter"
import { IMariaApi } from "mirai-http-sdk-ts/dist/api/index"
import {
  POST_SEND_FRIEND_MESSAGE_API,
  POST_SEND_GROUP_MESSAGE_API,
} from "mirai-http-sdk-ts/dist/api/message"
import {
  IMiraiMessage,
  IMiraiEvent,
  getMessagePlantText,
} from "mirai-http-sdk-ts"
import ResBody from "@/struct/ResBody"
import { miraiLogger } from "@/utils/log"
import Router from "koa-router"
import { useChatStats } from "./controller/chatStats"
import { useMiraControl } from "./controller/miraControl"
import { useReminder } from "./controller/reminder"
import { isBotCommand } from "@/utils/bot"

const router: Router = new Router()

router.post("/webhook", async (ctx) => {
  const reqBody = ctx.request.body as IMiraiMessage | IMiraiEvent
  miraiLogger.info(reqBody)

  useChatStats(ctx)
  useReminder(ctx)
  useMiraControl(ctx)

  // 收到群消息或者朋友消息
  if (reqBody.type === "GroupMessage" || reqBody.type === "FriendMessage") {
    // 如果是 bot 指令
    if (isBotCommand(getMessagePlantText(reqBody.messageChain))) {
      helper.receiveMessage(reqBody)
      weatherReporter.receiveMessage(reqBody)
      rssSubscriber.receiveMessage(reqBody)
    }
  }

  ctx.body = new ResBody({
    data: { time: new Date() },
  })
})

router.get("/friendList", async (ctx) => {
  const resData = (await mirai.getFriendList()).data
  ctx.body = new ResBody({
    data: resData.data,
  })
})

router.post("/sendFriendMessage", async (ctx) => {
  const reqBody = ctx.request
    .body as IMariaApi[typeof POST_SEND_FRIEND_MESSAGE_API]["req"]
  const resData = (await mirai.sendFriendMessage(reqBody)).data

  ctx.body = new ResBody({
    data: resData,
  })
})

router.post("/sendGroupMessage", async (ctx) => {
  const reqBody = ctx.request
    .body as IMariaApi[typeof POST_SEND_GROUP_MESSAGE_API]["req"]
  const resData = (await mirai.sendGroupMessage(reqBody)).data

  ctx.body = new ResBody({
    data: resData,
  })
})

export default router
