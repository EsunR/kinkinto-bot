/* eslint-disable prettier/prettier */
import { BotHelpConfig } from "@/types/bot"

export const helpConfig: BotHelpConfig = {
  command: "reminder",
  name: "提醒小助手",
  description:
    "提醒小助手可以供所有群成员使用，如果你加了鑫鑫子好友的话可以单独设置提醒哦！",
  commands: [
    {
      keyword: "help",
      note: "获取帮助指令",
      operation: "reminder help",
    },
    {
      keyword: "add",
      note: "添加提醒任务",
      operation: "reminder add <任务名> <定时规则> <提醒内容>",
      example: [
        "(定时规则为 cron 风格的定时器规则，其对应『秒 分 时 日 月 星期』)",
        "reminder add 提醒喝水小助手 \"0 0 10 * * *\" 该喝水啦 => 每天早上 10 点提醒喝水",
        "reminder add 提醒站立小助手 \"0 30 * * * *\" 该喝水啦 => 每小时的第 30 分钟提醒大家站立",
        "reminder add 提醒睡懒觉小助手 \"0 0 8 * * 6\" 可以睡懒觉啦！ => 每周六早上八点可以提醒大家睡懒觉",
      ],
    },
    {
      keyword: "list",
      note: "查看已有的提醒任务",
      operation: "reminder list",
    },
    {
      keyword: "del",
      note: "删除已有的提醒任务",
      operation: "reminder del <任务ID>",
      example: ["reminder del 233 => 删除 id 为 233 的提醒任务"],
    },
  ],
}
