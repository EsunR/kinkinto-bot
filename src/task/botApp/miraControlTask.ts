import { miraController } from "@/instances/miraController"
import { mirai } from "@/instances/mirai"
import {
  getBotInvitedJoinGroupRequestMessageChain,
  getBotJoinGroupMessageChain,
  getNewFriendRequestMessageChain,
} from "@/lib/botApps/miraControl/utils/messageChain"

export function useMiraControlTask() {
  miraController.addListener("newFriendRequest", (event) => {
    // FIXME: 添加管理员
    // mirai.config.admins.forEach((id) => {
    //   mirai.sendFriendMessage({
    //     target: Number(id),
    //     messageChain: getNewFriendRequestMessageChain(event),
    //   })
    // })
  })

  miraController.addListener("botInvitedJoinGroupRequest", (event) => {
    // FIXME: 添加管理员
    //   mirai.sendFriendMessage({
    //     target: Number(id),
    //     messageChain: getBotInvitedJoinGroupRequestMessageChain(event),
    //   })
    // })
  })

  miraController.addListener("botJoinGroup", (event) => {
    // FIXME: 添加管理员
    // mirai.config.admins.forEach((id) => {
    //   mirai.sendFriendMessage({
    //     target: Number(id),
    //     messageChain: getBotJoinGroupMessageChain(event),
    //   })
    // })
  })
}
