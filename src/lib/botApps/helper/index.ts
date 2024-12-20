import Mirai, { IMiraiMessage } from "mirai-http-sdk-ts"
import { BotHelpConfig } from "@/types/bot"
import { IConfig } from "./types"
import { qqFriendNeedHelp, qqGroupNeedHelp } from "./utils"
import { getBotHelpMessageChain } from "./utils/messageChain"

/**
 * @app 帮助助手
 * @support QQ friend, QQ group
 */
export default class Helper {
  private _mirai: Mirai

  public config: IConfig

  constructor(config: IConfig) {
    this._mirai = config.miraInstance
    this.config = config
  }

  getHelpConfigs(): BotHelpConfig[] {
    return this.config.apps
      .filter((item) => !!item?.helpConfig)
      .map((item) => item.helpConfig as BotHelpConfig)
  }

  receiveMessage(message: IMiraiMessage) {
    // received qq message
    if (message.type === "GroupMessage") {
      const messageChain = message.messageChain
      if (qqGroupNeedHelp(messageChain, this._mirai)) {
        this._mirai.sendGroupMessage({
          target: message.sender.group.id,
          messageChain: getBotHelpMessageChain(
            this.getHelpConfigs().filter((item) => !item.onlyForFriend)
          ),
        })
      }
    } else if (message.type === "FriendMessage") {
      const messageChain = message.messageChain
      if (qqFriendNeedHelp(messageChain)) {
        this._mirai.sendFriendMessage({
          target: message.sender.id,
          messageChain: getBotHelpMessageChain(
            this.getHelpConfigs().filter((item) => !item.onlyForGroup)
          ),
        })
      }
    }
    // TODO: Telegram
  }
}
