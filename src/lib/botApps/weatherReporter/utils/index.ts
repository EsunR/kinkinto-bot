import CaiyunWeather from "@/lib/caiyun-weather"
import { getSkyConEmoji, getSkyConZnName } from "@/lib/caiyun-weather/utils"
import { IMiraiMessage } from "mirai-http-sdk-ts"
import { CommandErrNoEnum, BotCommandValidResult } from "@/types/bot"
import { getAlisaCommand, validBotCommand } from "@/utils/bot"
import { getMessagePlantText } from "mirai-http-sdk-ts/dist/utils"
import { WeatherReporter } from ".."
import { helpConfig } from "../config"
import { ReportInstance } from "../model/Report"
import { ILocation, IWeatherInfoItem } from "../types"
import { getGeoInfo } from "./amap"

export async function isValidWeatherCommand(
  message: IMiraiMessage,
  weatherReporterInstance: WeatherReporter
): Promise<BotCommandValidResult> {
  const commandString = getAlisaCommand(
    getMessagePlantText(message.messageChain),
    helpConfig
  )
  const universalValidResult = validBotCommand(commandString, helpConfig)

  if (!universalValidResult.result) {
    return universalValidResult
  }

  const { parsedCommand } = universalValidResult
  const { keyword, args } = parsedCommand

  if (keyword === "add") {
    if (!args.length) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongArgs,
        errMsg: `参数不足，请输入 ${helpConfig.command} help 查看帮助`,
      }
    }
    let locationName = args[0]
    const locationPosition = args[1]
    // 如果有经纬度，则不需要校验地点名称，但是需要校验经纬度格式
    if (locationPosition) {
      const pos = locationPosition.split(",")
      if (pos.length !== 2 || pos.some((item) => isNaN(Number(item)))) {
        return {
          result: false,
          errno: CommandErrNoEnum.wrongArgs,
          errMsg: `坐标格式错误，请输入 ${helpConfig.command} help 查看帮助`,
        }
      }
    }
    // 否则需要校验地点名称是否真实有效
    else {
      try {
        const geoInfo = await getGeoInfo(
          locationName,
          weatherReporterInstance.option.amapApiKey
        )
        locationName = geoInfo.formatted_address
      } catch (error) {
        return {
          result: false,
          errno: CommandErrNoEnum.wrongArgs,
          errMsg: "无法查找到有效的地理位置，请检查位置名称或稍后重试",
        }
      }
    }
    // 校验数据是否重复
    let record: ReportInstance | null | undefined = undefined
    if (message.type === "FriendMessage") {
      record = await weatherReporterInstance.reportModel?.findOne({
        where: {
          locationName,
          source: message.sender.id.toString(),
          sourceType: "friend",
          platform: "qq",
        },
      })
    } else if (message.type === "GroupMessage") {
      record = await weatherReporterInstance.reportModel?.findOne({
        where: {
          locationName,
          source: message.sender.group.id.toString(),
          sourceType: "group",
          platform: "qq",
        },
      })
    }
    if (record) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongArgs,
        errMsg:
          "你已经订阅该地点了，若想重新订阅该地区的天气，请先删除当前订阅",
      }
    }
  } else if (keyword === "del") {
    if (!args.length) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongArgs,
        errMsg: `参数不足，请输入 ${helpConfig.command} help 查看帮助`,
      }
    }
  }

  return universalValidResult
}

export async function getWeatherInfo(
  weatherGetter: CaiyunWeather,
  locations: ILocation[]
): Promise<IWeatherInfoItem[]> {
  const hours = new Date().getHours()
  const isDay = hours >= 8 && hours < 20

  const weatherDataRes = await Promise.all(
    locations.map(async (item) => {
      return (
        await weatherGetter.getDaily(item.location, {
          dailysteps: 1,
        })
      ).data
    })
  )

  return locations.map((location, index) => {
    const daily = weatherDataRes[index].result.daily
    return {
      locationName: location.name,
      isDay,
      skyConZN: getSkyConZnName(daily.skycon[0].value, {
        ignoreDayMark: true,
      }),
      skyConEmoji: getSkyConEmoji(daily.skycon[0].value),
      temperature: {
        max: isDay
          ? daily.temperature_08h_20h[0].max
          : daily.temperature_20h_32h[0].max,
        min: isDay
          ? daily.temperature_08h_20h[0].min
          : daily.temperature_20h_32h[0].min,
      },
    }
  })
}

export function uniqueByKey<T>(array: T[], key: keyof T) {
  const seen: any = {}
  return array.filter((item) => {
    const k = item[key]
    return seen.hasOwnProperty(k) ? false : (seen[k] = true)
  })
}
