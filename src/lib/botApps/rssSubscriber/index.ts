import { CommandErrNoEnum, BotHelpConfig } from "@/types/bot"
import { helpConfig } from "./config"
import { IMessageChain, IMiraiMessage } from "mirai-http-sdk-ts"
import {
  getAlisaCommand,
  getBotAppHelpMessageChain,
  replayQQMessage,
} from "@/utils/bot"
import { getMessagePlantText } from "mirai-http-sdk-ts/dist/utils"
import { isValidRssSubscriberCommand } from "./utils"
import { miraiLogger } from "@/utils/log"
import Mirai from "mirai-http-sdk-ts"
import { Option, IRssPushConfig } from "./types"
import { getRssContent } from "./utils/request"
import { rssFeedItem2MessageChain } from "./utils/messageChain"
import { Sequelize } from "sequelize"
import path from "path"
import { createPushHistoryModel } from "./model/PushHistory"
import { DomUtils } from "htmlparser2"
import { scheduleJob } from "node-schedule"
import { fileURLToPath } from "url"
import { sequelize } from "@/instances/sequelize"
import { botAppConfig } from "@/config"

export class RssSubscriber {
  private _mirai: Mirai
  private _cachedDbOperation: Function[] = []
  private _sequelize?: Sequelize
  private _pushHistoryModel?: ReturnType<typeof createPushHistoryModel>

  static helpConfig: BotHelpConfig = helpConfig

  constructor(option: Option) {
    // 初始化配置
    this._mirai = option.miraiInstance

    // 连接数据库
    this._connectDb().then(() => {
      this._syncDb()
        ?.then(() => {
          this._cachedDbOperation.forEach((cb) => cb())
          this._cachedDbOperation.length = 0
        })
        .catch((e) => {
          miraiLogger.error(
            "[RssSubscriber] RssSubscriber db unable sync with error:",
            e
          )
        })
    })
  }

  private async _connectDb() {
    // const sequelize = new Sequelize({
    //   dialect: "sqlite",
    //   storage: path.resolve(__dirname, "../../../../db/rssSubscriber.sqlite"),
    // })
    try {
      await sequelize.authenticate()
      miraiLogger.info(
        "[RssSubscriber] RssSubscriber db connection has been established successfully."
      )
    } catch (error) {
      miraiLogger.error(
        "[RssSubscriber] Unable to connect to the rssSubscriber database:",
        error
      )
    }
    this._sequelize = sequelize
  }

  private async _syncDb() {
    if (this._sequelize) {
      const pushHistoryModel = createPushHistoryModel(this._sequelize)
      await pushHistoryModel.sync()
      this._pushHistoryModel = pushHistoryModel
    }
  }

  async receiveMessage(message: IMiraiMessage) {
    const commandString = getAlisaCommand(
      getMessagePlantText(message.messageChain),
      helpConfig
    )
    const validResult = await isValidRssSubscriberCommand(commandString)
    if (!validResult.result) {
      if (validResult.errno === CommandErrNoEnum.unknownCommand) {
        return
      } else {
        miraiLogger.debug(
          `[RssSubscriber] Error validResult: ${JSON.stringify(validResult)}`
        )
        // 回复消息
        replayQQMessage(this._mirai, message, [
          {
            type: "Plain",
            text: validResult.errMsg,
          },
        ])
      }
    } else {
      // ============== help =================
      if (validResult.parsedCommand.keyword === "help") {
        replayQQMessage(
          this._mirai,
          message,
          getBotAppHelpMessageChain(RssSubscriber.helpConfig)
        )
      }
      // ============== debug =================
      if (validResult.parsedCommand.keyword === "debug") {
        const [route, fields] = validResult.parsedCommand.args
        miraiLogger.debug("[RssSubscriber] Debug command:", { route, fields })
        const rssContent = await getRssContent(route)
        const messageChain: IMessageChain[] = rssContent?.items.length
          ? rssFeedItem2MessageChain(rssContent?.items[0], rssContent, fields)
          : [
              {
                type: "Plain",
                text: "RSS 内容获取失败",
              },
            ]
        replayQQMessage(this._mirai, message, messageChain)
      }
    }
  }

  /**
   * 触发已经订阅的 RSS
   */
  emitAllTask() {
    const _opt = async () => {
      miraiLogger.debug("[RssSubscriber] Emit rss schedule job")
      // 1. 读取 subscribe 表，开启所有的定时任务
      // 2. 逐个开启对应的任务
      scheduleJob("0 */20 * * * *", () => {
        miraiLogger.debug("[RssSubscriber] Emit push rss subscribe task")
        botAppConfig.rssHub?._qqGroups.forEach((groupId) => {
          this._pushLatestRssToTarget({
            target: groupId,
            targetType: "group",
            rssLink: "/telegram/channel/testflightcn",
            pushCount: 5,
            field: "channel|description",
          })
          this._pushLatestRssToTarget({
            target: groupId,
            targetType: "group",
            rssLink: "/epicgames/freegames",
            pushCount: 5,
            field: "channel|title|description|link",
          })
          this._pushLatestRssToTarget({
            target: groupId,
            targetType: "group",
            rssLink: "/yxdzqb/popular_cn",
            pushCount: 3,
            field: "channel|title|description|link",
          })
        })
      })
    }
    if (this._sequelize) {
      _opt()
    } else {
      this._cachedDbOperation.push(_opt)
    }
  }

  /**
   * 推送最新的 RSS 文章列表到目标
   */
  private async _pushLatestRssToTarget(config: IRssPushConfig) {
    if (!this._sequelize) {
      return
    }
    const { target, targetType, rssLink, pushCount, field } = config
    const rssContent = await getRssContent(rssLink)
    if (!rssContent) {
      return
    }
    const { items } = rssContent
    const validItems = items.slice(0, pushCount)
    const needPushItems: DomUtils.FeedItem[] = []
    // 遍历新消息
    for (let i = 0; i < validItems.length; i++) {
      const rssItem = validItems[i]
      const record = await this._pushHistoryModel?.findOne({
        where: { target, targetType, recordId: rssItem.id },
      })
      // 从上到下查找，只要有一条推送过，后面的就不再检查是否推送过了
      if (record) {
        miraiLogger.debug(
          `[RssSubscriber] Get pushed record skip, recordId: ${rssItem.id} target: ${target}`
        )
        break
      } else {
        needPushItems.push(rssItem)
      }
    }
    miraiLogger.debug(
      `[RssSubscriber] Push ${needPushItems.length} rss item to target: ${target}`
    )
    // 逐条推送消息
    needPushItems.reverse()
    for (let i = 0; i < needPushItems.length; i++) {
      const rssItem = needPushItems[i]
      if (targetType === "friend") {
        await this._mirai.sendFriendMessage({
          target: Number(target),
          messageChain: rssFeedItem2MessageChain(rssItem, rssContent, field),
        })
      } else {
        await this._mirai.sendGroupMessage({
          target: Number(target),
          messageChain: rssFeedItem2MessageChain(rssItem, rssContent, field),
        })
      }
      // 记录已推送的消息
      await this._pushHistoryModel?.create({
        target,
        recordId: rssItem.id || new Date().valueOf().toString(),
        targetType,
      })
    }
  }
}
