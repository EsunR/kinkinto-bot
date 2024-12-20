import { mirai } from "@/instances/mirai"
import { IMessageChain } from "mirai-http-sdk-ts"
import { miraiLogger } from "@/utils/log"
import moment from "moment"
import { Updater } from "../../lib/botApps/updater"

/**
 * 更新通知
 */
export async function useUpdaterTask() {
  const updater = new Updater({
    modeChangeSilent: true,
  })
  const groupIds = (await mirai.getGroupList()).data.data.map((item) => item.id)
  miraiLogger.info(`[Updater] update info apply to groups: ${groupIds}`)
  const currentHour = new Date().getHours()
  const isDay = currentHour >= 8 && currentHour < 24

  updater.addListener("development", () => {
    if (updater.option?.modeChangeSilent) {
      return
    }
    const messageChain: IMessageChain[] = [
      {
        type: "Plain",
        text: "鑫鑫子进入了开发模式，可能会存在胡言乱语的情况，部分功能会不稳定",
      },
    ]
    if (isDay) {
      groupIds.forEach((groupId) => {
        mirai.sendGroupMessage({
          target: groupId,
          messageChain,
        })
      })
    } else {
      // FIXME: 发送给管理员
      // mirai.config.admins.forEach((adminId) => {
      //   mirai.sendFriendMessage({
      //     target: Number(adminId),
      //     messageChain,
      //   })
      // })
    }
  })

  updater.addListener("production", () => {
    if (updater.option?.modeChangeSilent) {
      return
    }
    const messageChain: IMessageChain[] = [
      {
        type: "Plain",
        text: "嘿哈！鑫鑫子恢复了正常模式，又可以愉快的玩耍了！",
      },
    ]
    if (isDay) {
      groupIds.forEach((groupId) => {
        mirai.sendGroupMessage({
          target: groupId,
          messageChain,
        })
      })
    } else {
      // FIXME: 发送给管理员
      // mirai.config.admins.forEach((adminId) => {
      //   mirai.sendFriendMessage({
      //     target: Number(adminId),
      //     messageChain,
      //   })
      // })
    }
  })

  updater.addListener("update", ({ commit }) => {
    // FIXME: 生日信息
    // const birthDays = Math.abs(
    //   moment(mirai.config.birthDayTimestamp).diff(moment(), "day")
    // )
    const messageChain: IMessageChain[] = [
      {
        type: "Plain",
        text: "好耶！鑫鑫子又学会新的技能了！",
      },
      {
        type: "Plain",
        text: "\n\n",
      },
      {
        type: "Plain",
        text: `更新内容：${commit}`,
      },
      {
        type: "Plain",
        text: "\n\n",
      },
      // {
      //   type: "Plain",
      //   text: `—— 距离鑫鑫子的诞生已经过了${birthDays}天`,
      // },
    ]
    groupIds.forEach((groupId) => {
      mirai.sendGroupMessage({
        target: groupId,
        messageChain,
      })
    })
  })

  updater.checkMode()
  updater.checkUpdate()
}
