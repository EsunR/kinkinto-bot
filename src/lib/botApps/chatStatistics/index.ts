import { sequelize } from "@/instances/sequelize"
import { BotHelpConfig, CommandErrNoEnum } from "@/types/bot"
import {
  getAlisaCommand,
  getBotAppHelpMessageChain,
  replayQQMessage,
} from "@/utils/bot"
import { miraiLogger } from "@/utils/log"
import Mirai, {
  IGroupMessage,
  IMessageChain,
  ISourceMessage,
} from "mirai-http-sdk-ts"
import { getMessagePlantText } from "mirai-http-sdk-ts/dist/utils"
import moment from "moment"
import { scheduleJob } from "node-schedule"
import { Op, Sequelize } from "sequelize"
import { helpConfig } from "./config"
import {
  createGroupChatModel,
  GroupChatCreationAttributes,
  GroupChatInstance,
} from "./model/GroupChat"
import {
  createGroupConfigModel,
  GroupConfigFieldEnum,
} from "./model/GroupConfig"
import {
  ChatStatisticsEvent,
  ChatStatTopInfo,
  MeetLongTimeNoSpeechMemberFn,
  MeetNewMemberFn,
  Option,
  StatisticsInfo,
} from "./types"
import {
  formatChatReportInfo2QQ,
  formatContentTopInfo2QQ,
  formatTopInfo2QQ,
  // getFirstMeetMessageChain,
  // getLongTimeNoSpeechMessageChain,
  isValidChatStatCommand,
} from "./utils"

export default class ChatStatistician {
  static helpConfig: BotHelpConfig = helpConfig

  readonly id: Option["id"]
  public groupChatModel?: ReturnType<typeof createGroupChatModel>
  public groupConfigModel?: ReturnType<typeof createGroupConfigModel>
  private _sequelize?: Sequelize
  private _mirai: Mirai
  private _meetNewMemberCbQueue: MeetNewMemberFn[] = []
  private _meetLongTimeNoSpeechMemberCbQueue: MeetLongTimeNoSpeechMemberFn[] =
    []
  private _cachedDbOperation: Function[] = []

  constructor(option: Option) {
    // 初始化配置
    this.id = option.id
    this._mirai = option.miraiInstance

    // 连接数据库
    this._connectDb().then(() => {
      this._syncDb()
        .then(() => {
          this._cachedDbOperation.forEach((cb) => cb())
          this._cachedDbOperation.length = 0
        })
        .catch((e) => {
          miraiLogger.error(
            "[ChatStatics] ChatStatics db unable sync with error:",
            e
          )
        })
    })
  }

  private async _connectDb() {
    try {
      await sequelize.authenticate()
      miraiLogger.info(
        `[ChatStatistics] [${this.id}] ChatStatistics connection has been established successfully.`
      )
    } catch (error) {
      miraiLogger.error(
        `[ChatStatistics] [${this.id}] ChatStatistics Unable to connect to the database:`,
        error
      )
    }

    this._sequelize = sequelize
  }

  private async _syncDb() {
    if (this._sequelize) {
      this.groupChatModel = createGroupChatModel(this._sequelize, `${this.id}`)
      this.groupConfigModel = createGroupConfigModel(this._sequelize)
      await Promise.all([
        this.groupChatModel.sync(),
        this.groupConfigModel.sync(),
      ])
    }
  }

  private async _getReport(): Promise<StatisticsInfo | undefined> {
    const records = await this.groupChatModel?.findAll({
      where: {
        createdAt: {
          [Op.lt]: moment().toDate(),
          [Op.gt]: moment().startOf("day").toDate(),
        },
      },
    })
    const statisticsMap = new Map<string, GroupChatInstance[]>()
    if (records instanceof Array && records.length) {
      records.forEach((item) => {
        let mapVal = [item]
        const currentVal = statisticsMap.get(item.uid)
        if (currentVal) {
          mapVal = [...currentVal, ...mapVal]
        }
        statisticsMap.set(item.uid, mapVal)
      })
    }

    const allMessage = Array.from(statisticsMap.values()).sort(
      (a, b) => b.length - a.length
    )
    const winnersChats = allMessage?.[0]

    if (winnersChats) {
      const randomChatRecord =
        winnersChats[Math.floor(Math.random() * winnersChats.length)]
      let originContent: IMessageChain[] = []
      if (randomChatRecord.origin) {
        originContent = JSON.parse(randomChatRecord.origin) as IMessageChain[]
      }

      return {
        winnerUname: winnersChats[0].uname,
        winnerUid: winnersChats[0].uid,
        winnerMessageCount: winnersChats.length,
        randomChat: originContent,
        totalMessageCount: records?.length ?? 0,
        allMessage: allMessage,
      }
    }
    return undefined
  }

  private async _getContentTop(
    searchContent: string,
    topNumber: number
  ): Promise<ChatStatTopInfo[]> {
    const range = isNaN(topNumber) || !topNumber ? 5 : topNumber
    const records = await this.groupChatModel?.findAll({
      where: {
        content: {
          [Op.substring]: searchContent,
        },
      },
    })
    if (records instanceof Array && records.length) {
      const rankMap = new Map<string, ChatStatTopInfo>()
      records.forEach((record) => {
        const mapVal = rankMap.get(record.uid)
        if (mapVal) {
          mapVal.count = mapVal.count + 1
          mapVal.uname = record.uname
        } else {
          rankMap.set(record.uid, {
            count: 1,
            uname: record.uname,
            uid: record.uid,
          })
        }
      })
      const rankArr = Array.from(rankMap.values()).sort(
        (a, b) => b.count - a.count
      )
      return rankArr.slice(0, range)
    }
    return []
  }

  private async _getTop(topNumber: number): Promise<ChatStatTopInfo[]> {
    const range = isNaN(topNumber) || !topNumber ? 10 : topNumber
    const records = await this.groupChatModel?.findAll()
    if (records instanceof Array && records.length) {
      const rankMap = new Map<string, ChatStatTopInfo>()
      records.forEach((record) => {
        const mapVal = rankMap.get(record.uid)
        if (mapVal) {
          mapVal.count = mapVal.count + 1
          mapVal.uname = record.uname
        } else {
          rankMap.set(record.uid, {
            count: 1,
            uname: record.uname,
            uid: record.uid,
          })
        }
      })
      const rankArr = Array.from(rankMap.values()).sort(
        (a, b) => b.count - a.count
      )
      return rankArr.slice(0, range)
    }
    return []
  }

  async getRecallMessage(messageId: string) {
    return await this.groupChatModel?.findByPk(messageId)
  }

  /**
   * 创建一条默认的群消息报告配置记录
   */
  private async _createDefaultGroupConfigRecord() {
    if (this.groupConfigModel) {
      const configRecord = await this.groupConfigModel.create({
        groupId: this.id,
        field: GroupConfigFieldEnum.ChatReport,
        value: "true",
      })
      return configRecord
    }
    return null
  }

  /**
   * 发送每日聊天统计（根据配置）
   */
  private async _sendDailyReport() {
    if (this.groupConfigModel) {
      let configRecord = await this.groupConfigModel.findOne({
        where: { id: this.id },
      })
      if (!configRecord) {
        configRecord = await this._createDefaultGroupConfigRecord()
      }
      const needSendChatReport = JSON.parse(configRecord!.value) as boolean
      // 检查是否需要发送报告
      if (!needSendChatReport) {
        return
      }
      await this._mirai.sendGroupMessage({
        target: Number(this.id),
        messageChain: formatChatReportInfo2QQ(await this._getReport()),
      })
      await this._mirai.sendGroupMessage({
        target: Number(this.id),
        messageChain: [
          {
            type: "Plain",
            text: "晚安，鑫鑫子要睡觉啦！",
          },
        ],
      })
    }
  }

  /**
   * 接受消息（仅处理群消息）
   */
  async receiveMessage(groupMessage: IGroupMessage) {
    // Step1.解析指令
    const plainText = getAlisaCommand(
      getMessagePlantText(groupMessage.messageChain),
      helpConfig
    )
    const validResult = isValidChatStatCommand(
      plainText,
      helpConfig,
      groupMessage.sender.permission
    )
    if (!validResult.result) {
      if (validResult.errno !== CommandErrNoEnum.unknownCommand) {
        replayQQMessage(this._mirai, groupMessage, [
          {
            type: "Plain",
            text: validResult.errMsg,
          },
        ])
      }
    } else {
      // ============== help =================
      if (validResult.parsedCommand.keyword === "help") {
        this._mirai.sendGroupMessage({
          target: groupMessage.sender.group.id,
          messageChain: getBotAppHelpMessageChain(helpConfig),
        })
      }
      // ============== get =================
      if (validResult.parsedCommand.keyword === "get") {
        const [getType, topNumber] = validResult.parsedCommand.args
        if (getType === "report") {
          this._mirai.sendGroupMessage({
            target: groupMessage.sender.group.id,
            messageChain: formatChatReportInfo2QQ(await this._getReport()),
          })
        } else if (getType === "top") {
          this._mirai.sendGroupMessage({
            target: groupMessage.sender.group.id,
            messageChain: formatTopInfo2QQ(
              await this._getTop(Number(topNumber))
            ),
          })
        } else {
          this._mirai.sendGroupMessage({
            target: groupMessage.sender.group.id,
            messageChain: formatContentTopInfo2QQ(
              getType,
              await this._getContentTop(getType, Number(topNumber))
            ),
          })
        }
      }
      // ============== set =================
      if (validResult.parsedCommand.keyword === "set") {
        let record = await this.groupConfigModel?.findOne({
          where: {
            groupId: this.id,
            field: GroupConfigFieldEnum.ChatReport,
          },
        })
        if (!record) {
          record = await this._createDefaultGroupConfigRecord()
        }
        if (record) {
          const [func, value] = validResult.parsedCommand.args
          if (func === "report") {
            record.set("value", JSON.stringify(value === "off" ? false : true))
            await record.save()
            this._mirai.sendGroupMessage({
              target: groupMessage.sender.group.id,
              messageChain: [
                {
                  type: "Plain",
                  text: "设置成功！",
                },
              ],
            })
          }
        }
      }
    }

    // Step2. 存储聊天记录
    const quoteMessage = groupMessage.messageChain.find(
      (item) => item.type === "Quote"
    )
    console.log(
      "🚀 ~ ChatStatistician ~ receiveMessage ~ quoteMessage:",
      quoteMessage
    )
    const message: GroupChatCreationAttributes = {
      id:
        (
          groupMessage.messageChain.find(
            (item) => item.type === "Source"
          ) as ISourceMessage
        ).id.toString() || new Date().valueOf().toString(),
      uid: groupMessage.sender.id.toString(),
      uname: groupMessage.sender.memberName,
      content: plainText,
      quoteContent: quoteMessage
        ? getMessagePlantText(quoteMessage.origin)
        : undefined,
      origin: JSON.stringify(groupMessage.messageChain),
    }
    // // 检查是否已存有该用户的发言
    // const memberRecords = await this.groupChatModel?.findAll({
    //   where: { uid: message.uid },
    //   order: [["createdAt", "DESC"]],
    // })
    // // 检查该用户距离上次发言有多久了
    // if (memberRecords?.length) {
    //   const lastSpeakRecord = memberRecords[0]
    //   const lastSpeakTime = moment(lastSpeakRecord.createdAt)
    //   const diffDays = moment().diff(lastSpeakTime, "day")
    //   const diffHours = moment().diff(lastSpeakTime, "hour")
    //   miraiLogger.info(
    //     `[ChatStatistics] [${this.id}] member ${message.uname} last speak at ${lastSpeakRecord.createdAt}, diff days ${diffDays}, diff hours ${diffHours}`
    //   )
    //   if (diffDays >= 7) {
    //     await this._mirai.sendGroupMessage({
    //       target: Number(this.id),
    //       messageChain: getLongTimeNoSpeechMessageChain(message, {
    //         days: diffDays,
    //         hours: diffHours,
    //       }),
    //     })
    //     this._meetLongTimeNoSpeechMemberCbQueue.forEach((cb) =>
    //       cb(message, {
    //         days: diffDays,
    //         hours: diffHours,
    //       })
    //     )
    //   }
    // }
    // // 这是个新用户，发送打招呼信息
    // else {
    //   miraiLogger.info(
    //     `[ChatStatistics] [${this.id}] Meet new member ${message.uname}`
    //   )
    //   await this._mirai.sendGroupMessage({
    //     target: Number(this.id),
    //     messageChain: getFirstMeetMessageChain(message),
    //   })
    //   this._meetNewMemberCbQueue.forEach((cb) => cb(message))
    // }
    await this.groupChatModel?.create(message)
  }

  async emitAllTask() {
    const _opt = () => {
      // 每日晚上 23:59 定时发送统计报告
      scheduleJob("0 59 23 * * *", () => {
        this._sendDailyReport()
      })
    }
    if (this._sequelize) {
      _opt()
    } else {
      this._cachedDbOperation.push(_opt)
    }
  }

  addListener(event: "meetNewMember", cb: MeetNewMemberFn): any
  addListener(
    event: "meetLongTimeNoSpeechMember",
    cb: MeetLongTimeNoSpeechMemberFn
  ): any
  addListener(
    event: ChatStatisticsEvent,
    cb: MeetNewMemberFn | MeetLongTimeNoSpeechMemberFn
  ) {
    switch (event) {
      case "meetNewMember":
        return this._meetNewMemberCbQueue.push(cb as MeetNewMemberFn)
      case "meetLongTimeNoSpeechMember":
        return this._meetLongTimeNoSpeechMemberCbQueue.push(
          cb as MeetLongTimeNoSpeechMemberFn
        )
    }
  }
}
