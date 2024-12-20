import { BotHelpConfig } from "@/types/bot"

export const helpConfig: BotHelpConfig = {
  name: "聊天统计",
  command: "chatstat",
  onlyForGroup: true,
  commands: [
    {
      keyword: "help",
      operation: "chatstat help",
      note: "获取帮助指令",
    },
    {
      keyword: "get",
      operation: "chatstat get <report | top | 查询内容> [排名数量]",
      note: "获取聊天统计信息",
      example: [
        "chatstat get report => 获取当日统计报告",
        "chatstat get top => 获取当前群发消息最多的Top10成员",
        // eslint-disable-next-line prettier/prettier
        "chatstat get \"lolicon get\" => 获取发送内容包含\"lolicon get\"次数最多的成员",
        // eslint-disable-next-line prettier/prettier
        "chatstat get \"lolicon get\" 10 => 获取发送内容包含\"lolicon get\"次数最多的前十名成员",
      ],
    },
    {
      keyword: "set",
      operation: "chatstat set report <off | on>",
      note: "发言统计设置",
      permission: ["OWNER", "ADMINISTRATOR"],
      example: [
        "chatstat set report on => 开启每日统计报告",
        "chatstat set report off => 关闭每日统计报告",
      ],
    },
  ],
  commandAlisa: {
    发言统计: "chatstat get report",
    聊天统计: "chatstat get report",
    发言排行: "chatstat get top",
    聊天排行: "chatstat get top",
  },
}
