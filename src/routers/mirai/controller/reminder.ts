import { reminder } from "@/instances/reminder"
import { IMiraiMessage, IMiraiEvent } from "mirai-http-sdk-ts"
import { getMessagePlantText } from "mirai-http-sdk-ts/dist/utils"
import { ParameterizedContext } from "koa"
import Router from "koa-router"

/**
 * 处理 reminder 消息
 */
export async function useReminder(
  ctx: ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>
) {
  const reqBody = ctx.request.body as IMiraiMessage | IMiraiEvent

  if (reqBody.type === "FriendMessage") {
    const message = getMessagePlantText(reqBody.messageChain)
    reminder.receiveMessage(message, {
      platform: "qq",
      source: reqBody.sender.id.toString(),
      sourceType: "friend",
      creatorId: reqBody.sender.id.toString(),
    })
  } else if (reqBody.type === "GroupMessage") {
    const message = getMessagePlantText(reqBody.messageChain)
    reminder.receiveMessage(message, {
      platform: "qq",
      source: reqBody.sender.group.id.toString(),
      sourceType: "group",
      creatorId: reqBody.sender.id.toString(),
    })
  }
}
