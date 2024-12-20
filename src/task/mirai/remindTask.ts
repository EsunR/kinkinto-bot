import { reminder } from "@/instances/reminder"
import { Reminder } from "@/lib/botApps/reminder"
import { IQQMessageOrigin } from "@/lib/botApps/reminder/types"
import {
  getAddSuccessQQMessageChain,
  getDelInfoQQMessageChain,
  getRemindListQQMessageChain,
} from "@/lib/botApps/reminder/utils/messageChain"
import { IMessageChain } from "mirai-http-sdk-ts"
import { getBotAppHelpMessageChain } from "@/utils/bot"
import { mirai } from "@/instances/mirai"

function sendMessageToOrigin(
  origin: IQQMessageOrigin,
  messageChain: IMessageChain[]
) {
  if (origin.sourceType === "group") {
    mirai.sendGroupMessage({
      target: Number(origin.source),
      messageChain,
    })
  } else if (origin.sourceType === "friend") {
    mirai.sendFriendMessage({
      target: Number(origin.source),
      messageChain,
    })
  }
}

export function useRemindTask() {
  // 接收到帮助指令
  reminder.addListener("help", (messageOrigin) => {
    if (messageOrigin.platform !== "qq") {
      return
    }
    sendMessageToOrigin(
      messageOrigin,
      getBotAppHelpMessageChain(Reminder.helpConfig)
    )
  })

  // 接收到添加指令，并成功添加了定时任务后
  reminder.addListener("add", (record, messageOrigin) => {
    if (messageOrigin.platform !== "qq") {
      return
    }
    sendMessageToOrigin(
      messageOrigin,
      getAddSuccessQQMessageChain(record.taskName)
    )
  })

  // 接收到列表指令
  reminder.addListener("list", (records, messageOrigin) => {
    if (messageOrigin.platform !== "qq") {
      return
    }
    sendMessageToOrigin(messageOrigin, getRemindListQQMessageChain(records))
  })

  // 接收到删除指令
  reminder.addListener("del", (success, messageOrigin) => {
    if (messageOrigin.platform !== "qq") {
      return
    }
    sendMessageToOrigin(messageOrigin, getDelInfoQQMessageChain(success))
  })

  // 触发 errorCommand 事件
  reminder.addListener("errorCommand", (error, messageOrigin) => {
    if (messageOrigin.platform !== "qq") {
      return
    }
    sendMessageToOrigin(messageOrigin, [{ type: "Plain", text: error.errMsg }])
  })

  // 当定时任务被触发时
  reminder.addListener("taskRun", (record) => {
    if (record.platform !== "qq") {
      return
    }
    sendMessageToOrigin(
      {
        creatorId: record.creatorId,
        platform: record.platform,
        source: record.source,
        sourceType: record.sourceType,
      },
      [{ type: "Plain", text: record.content }]
    )
  })

  reminder.emitAllTask()
}
