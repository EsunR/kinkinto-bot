import {
  GroupPermission,
  IMessageChain,
  ISourceMessage,
} from "mirai-http-sdk-ts"
import { mirai } from "@/instances/mirai"
import moment from "moment"
import {
  ChatStatTopInfo,
  IDiffTime,
  Message,
  StatisticsInfo,
} from "../types"
import { GroupChatInstance } from "../model/GroupChat"
import {
  CommandErrNoEnum,
  BotCommandValidResult,
  BotHelpConfig,
} from "@/types/bot"
import { validBotCommand } from "@/utils/bot"

interface IGroupMemberInfo {
  uid: number
  uname: string
  messageCount: number
}

export function isValidChatStatCommand(
  commandString: string,
  helpConfig: BotHelpConfig,
  userPermission?: GroupPermission
): BotCommandValidResult {
  const universalValidResult = validBotCommand(
    commandString,
    helpConfig,
    userPermission
  )
  if (!universalValidResult.result) {
    return universalValidResult
  }
  const { keyword, args } = universalValidResult.parsedCommand
  if (keyword === "get") {
    const [getType] = args
    if (!getType) {
      return {
        result: false,
        errno: CommandErrNoEnum.unparsable,
        errMsg: `错误的参数信息，输入 "${helpConfig.command} help" 来获取帮助信息`,
      }
    }
    if (!["report", "top"].includes(getType) && getType.length < 2) {
      return {
        result: false,
        errno: CommandErrNoEnum.unparsable,
        errMsg: "哼，懒得帮你查两个字以下的内容",
      }
    }
  } else if (keyword === "set") {
    const [func, value] = args
    if (!["report"].includes(func)) {
      return {
        result: false,
        errno: CommandErrNoEnum.unparsable,
        errMsg: `找不到你要设置的功能，输入 "${helpConfig.command} help" 来获取帮助信息`,
      }
    }
    if (!["on", "off"].includes(value)) {
      return {
        result: false,
        errno: CommandErrNoEnum.unparsable,
        // eslint-disable-next-line prettier/prettier
        errMsg: "设置定值只能为\"on\"或者\"off\"",
      }
    }
  }
  return universalValidResult
}

/**
 * 将统计信息格式化为 QQ MessageChain
 */
export function formatChatReportInfo2QQ(
  info: StatisticsInfo | undefined
): IMessageChain[] {
  if (info) {
    const source = info.randomChat.find(
      (item) => item.type === "Source"
    ) as ISourceMessage
    const winnerChatChain = info.randomChat.filter(
      (item) => item.type !== "Source"
    )

    const secondary: IGroupMemberInfo | undefined = info.allMessage[1]
      ? {
          uid: Number(info.allMessage[1][0].uid),
          uname: info.allMessage[1][0].uname,
          messageCount: info.allMessage[1].length,
        }
      : undefined
    const third: IGroupMemberInfo | undefined = info.allMessage[2]
      ? {
          uid: Number(info.allMessage[2][0].uid),
          uname: info.allMessage[2][0].uname,
          messageCount: info.allMessage[2].length,
        }
      : undefined

    return [
      { type: "Plain", text: "《鑫鑫子の今日发言统计》" },
      {
        type: "Plain",
        text: "\n\n",
      },
      {
        type: "Plain",
        text: `今日群内一共收到了${info.totalMessageCount}条消息，发言数最多的是`,
      },
      { type: "At", target: Number(info.winnerUid), display: "" },
      {
        type: "Plain",
        text: `，一共发了${
          info.winnerMessageCount
        }条消息，占群内总消息的${Math.floor(
          (info.winnerMessageCount / info.totalMessageCount) * 100
        )}%，是当之无愧的吹水龙王！`,
      },
      // 第二名与第三名
      ...(secondary
        ? ([
            {
              type: "Plain",
              text: "\n\n",
            },
            {
              type: "Plain",
              text: "另外，第二名是",
            },
            {
              type: "At",
              target: secondary.uid,
            },
            {
              type: "Plain",
              text: `，共发了${secondary.messageCount}条消息，`,
            },
            ...(third
              ? ([
                  {
                    type: "Plain",
                    text: "紧随其后的是",
                  },
                  {
                    type: "At",
                    target: third.uid,
                  },
                  {
                    type: "Plain",
                    text: `，共发了${third.messageCount}条消息，`,
                  },
                ] as IMessageChain[])
              : []),
            {
              type: "Plain",
              text: "再接再厉，水个30年定能争取龙王之位！（歪嘴",
            },
          ] as IMessageChain[])
        : []),
      {
        type: "Plain",
        text: "\n\n",
      },
      {
        type: "Plain",
        text: "我来随意给大家抽取一段龙王的名言，建议大家务必熟练背诵：",
      },
      {
        type: "Plain",
        text: "\n\n",
      },
      ...winnerChatChain,
      {
        type: "Plain",
        text: "\n",
      },
      {
        type: "Plain",
        text: `—— ${info.winnerUname}发表于 ${moment(source.time * 1000).format(
          "HH:mm"
        )}`,
      },
    ]
  }
  return [{ type: "Plain", text: "今天没有人在群里说话，鑫鑫子很难过 😔" }]
}

export function formatContentTopInfo2QQ(
  content: string,
  topInfo: ChatStatTopInfo[]
): IMessageChain[] {
  if (topInfo.length) {
    const messageChainGroup: IMessageChain[][] = topInfo.map(
      (item, index) =>
        [
          {
            type: "Plain",
            text: `第${index + 1}名:`,
          },
          {
            type: "Plain",
            text: `『${item.uname}』`,
          },
          {
            type: "Plain",
            text: `总共说了${item.count}次\n`,
          },
        ] as IMessageChain[]
    )
    const messageChain: IMessageChain[] = [
      {
        type: "Plain",
        text: `噔噔咚!『${content}』的查询结果如下：\n\n`,
      },
    ]
    messageChainGroup.forEach((group) => messageChain.push(...group))
    return messageChain
  } else {
    return [{ type: "Plain", text: "暂时找不到说这些话的人 (´･_･`)" }]
  }
}

export function formatTopInfo2QQ(topInfo: ChatStatTopInfo[]): IMessageChain[] {
  if (topInfo.length) {
    const messageChainGroup: IMessageChain[][] = topInfo.map(
      (item, index) =>
        [
          {
            type: "Plain",
            text: `第${index + 1}名:`,
          },
          {
            type: "Plain",
            text: `『${item.uname}』`,
          },
          {
            type: "Plain",
            text: `总共发言了${item.count}次\n`,
          },
        ] as IMessageChain[]
    )
    const messageChain: IMessageChain[] = [
      {
        type: "Plain",
        text: "噔噔咚！发言排行榜如下：\n\n",
      },
    ]
    messageChainGroup.forEach((group) => messageChain.push(...group))
    return messageChain
  } else {
    return [{ type: "Plain", text: "小破群暂时没有人说话 (´･_･`)" }]
  }
}

/**
 * 撤回消息后发送通知，并随机 @ 一名幸运群友请喝奶茶
 * @param record 查找到的撤回的聊天记录
 * @param groupId 群组 id
 */
export async function formatRecallMessage2QQ(
  record: GroupChatInstance | undefined | null,
  groupId: number
): Promise<IMessageChain[]> {
  if (record && record.origin) {
    const messageChain = JSON.parse(record.origin) as IMessageChain[]
    const groupMembers = (await mirai.getMemberList({ target: groupId })).data
      .data
    const randomMember =
      groupMembers[Math.floor(Math.random() * groupMembers.length)]
    return [
      {
        type: "Plain",
        text: `『${record.uname}』撤回了一条消息被我看到了(￣▽￣)ノ，ta刚才说：\n\n`,
      },
      ...messageChain.filter((item) => item.type !== "Source"),
      {
        type: "Plain",
        text: "\n\n(他还说要请",
      },
      {
        type: "At",
        target: randomMember.id,
        display: "",
      },
      {
        type: "Plain",
        text: "喝奶茶",
      },
    ]
  }
  return [
    {
      type: "Plain",
      text: "我知道有人撤回了一条消息，但我没有证据（理直气壮",
    },
  ]
}

/**
 * 获取第一次遇见群成员的文案
 * @param message
 * @returns
 */
export function getFirstMeetMessageChain(message: Message): IMessageChain[] {
  return [
    {
      type: "At",
      target: Number(message.uid),
      display: "",
    },
    {
      type: "Plain",
      text: "你好呀！这里是鑫鑫子，看起来我们是第一次见面呢 ヽ( ° ▽° )ノ",
    },
  ]
}

export function getLongTimeNoSpeechMessageChain(
  message: Message,
  diffTime: IDiffTime
): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: "( ´⊙ω⊙`) 大家快来，我发现了一只许久没有发言的成员！\n",
    },
    {
      type: "At",
      target: Number(message.uid),
      display: "",
    },
    {
      type: "Plain",
      text: `你上次发言是在 ${diffTime.days} 天前，距离现在已经间隔了 ${diffTime.hours} 个小时`,
    },
  ]
}
