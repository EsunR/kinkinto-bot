import CaiyunWeather from "@/lib/caiyun-weather"
import Mirai from "mirai-http-sdk-ts"
import { IMiraiMessage } from "mirai-http-sdk-ts"
import { CommandErrNoEnum, BotHelpConfig } from "@/types/bot"
import { getBotAppHelpMessageChain, replayQQMessage } from "@/utils/bot"
import { miraiLogger } from "@/utils/log"
import schedule from "node-schedule"
import path from "path"
import { Sequelize } from "sequelize"
import { helpConfig } from "./config"
import { createReportModel, ReportInstance } from "./model/Report"
import { Option } from "./types"
import { getWeatherInfo, isValidWeatherCommand, uniqueByKey } from "./utils"
import { getGeoInfo } from "./utils/amap"
import { formatWeatherInfo2MessageChain } from "./utils/messageChain"
import { fileURLToPath } from "url"
import { sequelize } from "@/instances/sequelize"

export class WeatherReporter {
  private _mirai: Mirai
  private sequelize?: Sequelize
  private _cachedDbOperation: Function[] = []

  readonly weatherGetter: CaiyunWeather
  readonly option: Option

  public reportModel?: ReturnType<typeof createReportModel>

  static helpConfig: BotHelpConfig = helpConfig

  constructor(option: Option) {
    this._mirai = option.miraiInstance
    this.option = option
    this.weatherGetter = new CaiyunWeather({ apiKey: option.apiKey })

    // 连接数据库
    this._connectDb().then(() => {
      this._syncDb()
        ?.then(() => {
          this._cachedDbOperation.forEach((cb) => cb())
          this._cachedDbOperation.length = 0
        })
        .catch((e) => {
          miraiLogger.error(
            "[WeatherReporter] WeatherReporter db unable sync with error:",
            e
          )
        })
    })
  }

  private async _connectDb() {
    // const sequelize = new Sequelize({
    //   dialect: "sqlite",
    //   storage: path.resolve(__dirname, "../../../../db/weatherReporter.sqlite"),
    // })
    try {
      await sequelize.authenticate()
      miraiLogger.info(
        "[WeatherReporter] WeatherReporter db connection has been established successfully."
      )
    } catch (error) {
      miraiLogger.error(
        "[WeatherReporter] Unable to connect to the weatherReporter database:",
        error
      )
    }
    this.sequelize = sequelize
  }

  private async _syncDb() {
    if (this.sequelize) {
      const reportModel = createReportModel(this.sequelize)
      await reportModel.sync()
      this.reportModel = reportModel
    }
  }

  async receiveMessage(message: IMiraiMessage) {
    const validResult = await isValidWeatherCommand(message, this)
    if (!validResult.result) {
      if (validResult.errno === CommandErrNoEnum.unknownCommand) {
        return
      } else {
        miraiLogger.debug(
          `[Weather] Error validResult: ${JSON.stringify(validResult)}`
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
          getBotAppHelpMessageChain(WeatherReporter.helpConfig)
        )
      }
      // ============== get =================
      else if (validResult.parsedCommand.keyword === "get") {
        const records = await this.reportModel?.findAll({
          where: {
            sourceType: message.type === "FriendMessage" ? "friend" : "group",
            source:
              message.type === "FriendMessage"
                ? message.sender.id.toString()
                : message.sender.group.id.toString(),
          },
        })
        if (records instanceof Array && records.length) {
          const weatherInfo = await getWeatherInfo(
            this.weatherGetter,
            records.map((item) => ({
              name: item.locationName,
              location: [item.locationLatitude, item.locationLongitude],
            }))
          )
          replayQQMessage(
            this._mirai,
            message,
            formatWeatherInfo2MessageChain(
              weatherInfo,
              message.type === "FriendMessage"
            )
          )
        } else {
          replayQQMessage(this._mirai, message, [
            {
              type: "Plain",
              text: "没有添加任何天气订阅",
            },
          ])
        }
      }
      // ============== add =================
      else if (validResult.parsedCommand.keyword === "add") {
        let [locationName, locationPosition] = validResult.parsedCommand.args
        // 如果没有指定坐标，就自动获取
        if (!locationPosition) {
          const geoInfo = await getGeoInfo(locationName, this.option.amapApiKey)
          locationName = geoInfo.formatted_address
          locationPosition = geoInfo.location
        }
        let locationPositionArr = locationPosition
          .split(",")
          .map((item) => Number(item))

        // 添加记录
        await this.reportModel?.create({
          platform: "qq",
          locationName,
          locationLatitude: locationPositionArr[0],
          locationLongitude: locationPositionArr[1],
          creatorId: message.sender.id.toString(),
          source:
            message.type === "FriendMessage"
              ? message.sender.id.toString()
              : message.sender.group.id.toString(),
          sourceType: message.type === "FriendMessage" ? "friend" : "group",
        })

        // 回复消息
        replayQQMessage(this._mirai, message, [
          {
            type: "Plain",
            text: `已订阅『${locationName}』的天气`,
          },
        ])
      }
      // ============== list =================
      else if (validResult.parsedCommand.keyword === "list") {
        const list = await this.reportModel?.findAll({
          where: {
            sourceType: message.type === "FriendMessage" ? "friend" : "group",
            source:
              message.type === "FriendMessage"
                ? message.sender.id.toString()
                : message.sender.group.id.toString(),
          },
        })
        replayQQMessage(this._mirai, message, [
          {
            type: "Plain",
            text: `已订阅的城市列表：\n${list
              ?.map((item) => `${item.locationName}`)
              .join("\n")}`,
          },
        ])
      }
      // ============== del =================
      else if (validResult.parsedCommand.keyword === "del") {
        const delLocationName = validResult.parsedCommand.args[0]
        const record = await this.reportModel?.findOne({
          where: {
            sourceType: message.type === "FriendMessage" ? "friend" : "group",
            source:
              message.type === "FriendMessage"
                ? message.sender.id.toString()
                : message.sender.group.id.toString(),
            locationName: delLocationName,
          },
        })
        if (record) {
          record.destroy()
          replayQQMessage(this._mirai, message, [
            {
              type: "Plain",
              text: `『${delLocationName}』的天气订阅已删除~`,
            },
          ])
        } else {
          replayQQMessage(this._mirai, message, [
            {
              type: "Plain",
              text: `你没有订阅『${delLocationName}』的天气信息，删除失败`,
            },
          ])
        }
      }
    }
  }

  /**
   * 触发定时预报任务
   */
  emitAllTask() {
    const _opt = async () => {
      const loopRule = ["0 30 7 * * *", "0 0 20 * * *"]
      // 遍历规则
      loopRule.forEach((rule) => {
        miraiLogger.info(
          `[WeatherReporter] Start to emit all task, loopRule: ${rule}`
        )
        schedule.scheduleJob(rule, async () => {
          const allRecords = await this.reportModel?.findAll()
          const subscribers = uniqueByKey(
            allRecords || [],
            "source"
          ) as ReportInstance[]
          // 遍历订阅者
          subscribers.forEach(async (subscriber) => {
            // 获取订阅者的订阅记录
            const subScribeRecords = await this.reportModel?.findAll({
              where: {
                sourceType: subscriber.sourceType,
                source: subscriber.source,
                platform: "qq",
              },
            })
            if (subScribeRecords instanceof Array && subScribeRecords.length) {
              // 获取天气信息
              const weatherInfo = await getWeatherInfo(
                this.weatherGetter,
                subScribeRecords.map((item) => ({
                  name: item.locationName,
                  location: [item.locationLatitude, item.locationLongitude],
                }))
              )
              const messageChain = formatWeatherInfo2MessageChain(
                weatherInfo,
                subscriber.sourceType === "friend"
              )
              // 发送天气信息到订阅者
              if (subscriber.sourceType === "friend") {
                this._mirai.sendFriendMessage({
                  target: Number(subscriber.source),
                  messageChain,
                })
              } else if (subscriber.sourceType === "group") {
                this._mirai.sendGroupMessage({
                  target: Number(subscriber.source),
                  messageChain,
                })
              }
            }
          })
        })
      })
    }
    if (this.sequelize) {
      _opt()
    } else {
      this._cachedDbOperation.push(_opt)
    }
  }
}
