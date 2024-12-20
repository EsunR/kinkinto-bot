/* eslint-disable prettier/prettier */
import { BotHelpConfig } from "@/types/bot"
import { RssFieldType } from "./types"

export const rssFields: RssFieldType[] = [
  "channel",
  "title",
  "description",
  "link",
  "pubDate",
]

export const filterTextFragment: string[] = [
  "频道投稿",
  "@zaihuabot",
  "交流群组",
  "@zaihuachat",
  "花花优券",
  "@zaihuajd",
]

export const filterTextContent: string[] = [
  "简单广告",
  "花花广告",
  "VPN",
  "翻墙",
  "六月十四",
  "习近平",
  "六四",
  "天安门事件",
]

export const helpConfig: BotHelpConfig = {
  command: "rss",
  name: "RSS订阅",
  description:
    "利用RSS订阅功能可以让鑫鑫子实时轮训订阅源，来向个人或群组推送最新的RSS讯息，比如推送某人的社交媒体动态、新闻文章等",
  commands: [
    {
      keyword: "help",
      note: "获取帮助指令",
      operation: "rss help",
    },
    {
      keyword: "debug",
      note: "调试",
      operation: "rss debug",
    },
    {
      keyword: "add",
      note: "添加订阅（未实现）",
      operation:
        "rss add <RssHub订阅源> <查询定时器规则> <推送信息包含的字段> <每次推送的消息条数>",
      example: [
        "(RssHub订阅源列表:https://docs.rsshub.app/social-media.html#_755)",
        "(定时规则为 cron 风格的定时器规则，其对应『秒 分 时 日 月 星期』)",
        `(推送的信息字段有：${rssFields.join(", ")})`,
        "rss add /bilibili/user/dynamic/208259 \"0 0 */2 * * *\" description|pubDate|link 1 => 每2小时推送一条最新的陈睿B站动态",
        "rss add /pixiv/ranking/week \"0 0 10 * * *\" title|description|link 10 => 每天10点推送十条入围Pixiv周排行榜的作品",
        "rss add /weibo/user/1195230310 \"0 0 */2 * * *\" description|link 1 => 每2小时推送一条微博id为1195230310的用户的最新动态",
      ],
    },
    {
      keyword: "list",
      note: "查看已有的订阅（未实现）",
      operation: "rss list",
    },
    {
      keyword: "del",
      note: "删除已有的订阅（未实现）",
      operation: "rss del <RssHub订阅源>",
      example: ["rss del /pixiv/ranking/week"],
    },
  ],
}
