/**
 * @file bot app 中通用的方法
 */
import Mirai from "mirai-http-sdk-ts"
import {
  GroupPermission,
  IMessageChain,
  IMiraiMessage,
} from "mirai-http-sdk-ts"
import {
  CommandErrNoEnum,
  BotCommandValidResult,
  BotHelpConfig,
  ParsedBotCommand,
} from "@/types/bot"

const GROUP_PERMISSION_ENUM: Record<GroupPermission, string> = {
  OWNER: "群主",
  ADMINISTRATOR: "管理员",
  MEMBER: "群员",
}

/**
 * 解析 bot 指令
 */
export function parseBotCommand(
  inputString: string
): ParsedBotCommand | undefined {
  const cmdString = inputString.trim().replace(/^\/?/, "")
  const spaceRegExp = RegExp(/\s/, "g")
  const spaceIndexArr: number[] = []
  let matchArr = null
  while ((matchArr = spaceRegExp.exec(cmdString)) !== null) {
    spaceIndexArr.push(matchArr.index)
  }
  if (spaceIndexArr.length < 1) {
    return undefined
  }

  const command = cmdString.slice(0, spaceIndexArr[0])
  const keyword = cmdString.slice(spaceIndexArr[0] + 1, spaceIndexArr[1])

  // 解析参数
  const argsString = cmdString.slice(spaceIndexArr[1] + 1)
  const mutiplyArgRegExp = RegExp(/(\".*?\")|(\'.*?\')/, "g")
  const mutiplyArgs: string[] = []
  matchArr = null
  // 提取出混合参数，如 loop "* * * * * *" doSomething
  while ((matchArr = mutiplyArgRegExp.exec(argsString)) !== null) {
    mutiplyArgs.push(
      matchArr[0]
        .replace(/\"/g, "")
        .replace(/\'/g, "")
        .replace(/\(/g, "")
        .replace(/\)/g, "")
    )
  }
  // 预处理参数
  const preArgs = argsString
    .replace(mutiplyArgRegExp, "__ph__")
    .split(" ")
    .map((item) => item.trim())
  const args = preArgs
    .map((arg) => (arg === "__ph__" ? mutiplyArgs.shift() : arg))
    .filter((item) => !!item) as string[]

  return {
    command,
    keyword,
    args,
  }
}

/**
 * 判断输入文本是否是 bot 指令
 */
export function isBotCommand(str: string) {
  return str.startsWith("/")
}

/**
 * 校验 bot 指令是否有效，并返回校验结果
 */
export function validBotCommand(
  commandString: string,
  helpConfig: BotHelpConfig,
  userPermission?: GroupPermission
): BotCommandValidResult {
  // 获取指令开头
  if (
    !isBotCommand(commandString) ||
    !RegExp(`^(/)?${helpConfig.command}`).test(commandString)
  ) {
    return {
      result: false,
      errno: CommandErrNoEnum.unknownCommand,
      errMsg: "没有匹配到相关指令",
    }
  }

  // 解析指令
  const parsedCommand = parseBotCommand(commandString)
  if (!parsedCommand) {
    return {
      result: false,
      errno: CommandErrNoEnum.unparsable,
      errMsg: `错误的参数信息，输入 "${helpConfig.command} help" 来获取帮助信息`,
    }
  }

  if (parsedCommand.keyword && userPermission) {
    const thisCommandPermission = helpConfig.commands.find(
      (item) => (item.keyword = parsedCommand.keyword)
    )?.permission
    if (thisCommandPermission?.includes(userPermission)) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongPermission,
        errMsg: "嗨呀，你没有权限调用这条指令",
      }
    }
  }

  if (
    !helpConfig.commands
      .map((item) => item.keyword)
      .includes(parsedCommand.keyword)
  ) {
    return {
      result: false,
      errno: CommandErrNoEnum.unknownKeyword,
      errMsg: `无效的指令关键字，输入 "${helpConfig.command} help" 来获取帮助信息`,
    }
  }

  return {
    result: true,
    parsedCommand: parsedCommand,
  }
}

/**
 * 获取指令 Help 的 MessageCain 格式（通用）
 */
export function getBotAppHelpMessageChain(
  helpConfig: BotHelpConfig
): IMessageChain[] {
  // 列出描述
  const result: IMessageChain[] = [
    ...(helpConfig.description
      ? [
          {
            type: "Plain",
            text: `${helpConfig.description}\n\n`,
          } as IMessageChain,
        ]
      : []),
  ]

  // 列出指令
  helpConfig.commands.forEach((cmd) => {
    const permissionName =
      cmd.permission?.map((name) => GROUP_PERMISSION_ENUM[name]) ?? []
    const singleHelpMessageChain = [
      {
        type: "Plain",
        text:
          `${cmd.operation} ${cmd.note}` +
          `${
            permissionName.length
              ? `[仅限${permissionName.join("、")}调用]`
              : ""
          }` +
          `${cmd.example ? "，调用示例如下：" : ""}\n`,
      },
      ...(cmd.example
        ? cmd.example.map(
            (exm) =>
              ({
                type: "Plain",
                text: `${exm}\n`,
              } as IMessageChain)
          )
        : []),
      {
        type: "Plain",
        text: "\n",
      },
    ] as IMessageChain[]
    result.push(...singleHelpMessageChain)
  })

  // 列出 alisa
  if (helpConfig.commandAlisa && Object.keys(helpConfig.commandAlisa).length) {
    result.push({
      type: "Plain",
      text: "你还可以直接发送这些快捷指令：\n",
    })
    Object.keys(helpConfig.commandAlisa).forEach((key) => {
      result.push({
        type: "Plain",
        text: `- ${key}\n`,
      })
    })
  } else {
    result.pop()
  }
  return result
}

/**
 * 回复 QQ 消息
 * @param originMessage
 * @param messageChain
 */
export function replayQQMessage(
  miraInstance: Mirai,
  originMessage: IMiraiMessage,
  replyMessage: IMessageChain[]
) {
  if (originMessage.type === "FriendMessage") {
    miraInstance.sendFriendMessage({
      target: originMessage.sender.id,
      messageChain: replyMessage,
    })
  } else if (originMessage.type === "GroupMessage") {
    miraInstance.sendGroupMessage({
      target: originMessage.sender.group.id,
      messageChain: replyMessage,
    })
  }
}

/**
 * 获取指令别名
 * @param originMessage
 * @param helpConfig
 * @returns
 */
export function getAlisaCommand(
  originMessage: string,
  helpConfig: BotHelpConfig
) {
  const alisa = helpConfig.commandAlisa
  if (alisa && alisa[originMessage]) {
    return alisa[originMessage]
  }
  return originMessage
}
