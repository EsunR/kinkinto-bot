import { IMessageChain } from "mirai-http-sdk-ts"
import { IWeatherInfoItem } from "../types"

export function formatWeatherInfo2MessageChain(
  weatherInfo: IWeatherInfoItem[],
  toFriend?: boolean
): IMessageChain[] {
  const hours = new Date().getHours()
  let currentTime = ""
  if (hours >= 0 && hours < 5) {
    currentTime = "半夜三更"
  } else if (hours >= 5 && hours < 9) {
    currentTime = "早上"
  } else if (hours >= 9 && hours < 12) {
    currentTime = "上午"
  } else if (hours >= 12 && hours < 15) {
    currentTime = "中午"
  } else if (hours >= 15 && hours < 20) {
    currentTime = "下午"
  } else if (hours >= 20 && hours <= 24) {
    currentTime = "晚上"
  }
  const isDay = hours >= 6 && hours < 20
  const dayStatus = isDay ? "日间" : "夜间"
  const weatherChain = weatherInfo.map(
    (item) =>
      ({
        type: "Plain",
        text: `『${item.locationName}』${dayStatus}${item.skyConEmoji}${item.skyConZN}，最高温${item.temperature.max}℃，最低温${item.temperature.min}℃\n\n`,
      } as IMessageChain)
  )

  return [
    {
      type: "Plain",
      text: `${
        toFriend ? "" : "大家"
      }${currentTime}好呀！这里是鑫鑫子的${dayStatus}天气预报：`,
    },
    { type: "Plain", text: "\n\n" },
    ...weatherChain,
    { type: "Plain", text: "预报结束，开溜~" },
  ]
}
