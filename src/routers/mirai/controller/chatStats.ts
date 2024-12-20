import { getChatStatisticians } from "@/instances/chatStatistician"
import { mirai } from "@/instances/mirai"
import { formatRecallMessage2QQ } from "@/lib/botApps/chatStatistics/utils"
import { ParameterizedContext } from "koa"
import Router from "koa-router"
import { IMiraiEvent, IMiraiMessage } from "mirai-http-sdk-ts"

/**
 * 记录 QQ 消息
 */
export async function useChatStats(
  ctx: ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>
) {
  const statisticians = await getChatStatisticians()
  const reqBody = ctx.request.body as IMiraiMessage | IMiraiEvent
  const validGroupIds = statisticians.map((item) => item.id.toString())

  // 接收到群聊消息
  if (reqBody.type === "GroupMessage") {
    const groupId = reqBody.sender.group.id
    // 校验群是否在设置列表里
    if (!validGroupIds.includes(groupId.toString())) {
      return
    }
    const statistician = statisticians.find(
      (item) => item.id.toString() === groupId.toString()
    )
    // 记录群消息
    if (statistician) {
      statistician.receiveMessage(reqBody)
    }
  }

  // 接收到群事件
  if (
    reqBody.type === "GroupRecallEvent" &&
    /** 忽略群主的撤回 */
    reqBody.operator.permission !== "OWNER" &&
    /** 仅当用户自己撤回消息时触发 */
    reqBody.authorId === reqBody.operator.id
  ) {
    const groupId = reqBody.group.id
    const messageId = reqBody.messageId
    // 校验群是否在设置列表里
    if (!validGroupIds.includes(groupId.toString())) {
      return
    }
    const statistician = statisticians.find(
      (item) => item.id.toString() === groupId.toString()
    )
    if (statistician) {
      const messageRecord = await statistician.getRecallMessage(
        messageId.toString()
      )
      const replayMessageChain = await formatRecallMessage2QQ(
        messageRecord,
        Number(statistician.id)
      )
      mirai.sendGroupMessage({
        target: Number(statistician.id),
        messageChain: replayMessageChain,
      })
    }
  }
}
