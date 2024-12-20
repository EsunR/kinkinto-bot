import { BotHelpConfig } from "@/types/bot"

export const helpConfig: BotHelpConfig = {
  name: "天气预报",
  command: "weather",
  commands: [
    {
      keyword: "help",
      note: "获取帮助指令",
      operation: "weather help",
    },
    {
      keyword: "get",
      note: "获取天气预报",
      operation: "weather get [获取未来第几天的天气]",
      example: [
        "weather get => 获取当前天气",
        "weather get 1 => 获取当天天气（还没实现啦）",
        "weather get 2 => 获取明天天气（还没实现啦）",
      ],
    },
    {
      keyword: "list",
      note: "查看当前已订阅的地点",
      operation: "weather list",
    },
    {
      keyword: "add",
      note: "添加天气订阅，支持自定义地理位置坐标",
      operation: "weather add <位置名> [经度,纬度]",
      example: ["weather add 北京", "weather add 我家 116.404763,39.913359"],
    },
    {
      keyword: "del",
      note: "删除天气订阅",
      operation: "weather del <位置名>",
      example: ["weather del 北京", "weather del 我家"],
    },
  ],
  commandAlisa: {
    天气预报: "weather get",
  },
}
