import { CommandErrNoEnum, BotCommandValidResult } from "@/types/bot"
import { validBotCommand } from "@/utils/bot"
import { miraiLogger } from "@/utils/log"
import { scheduleJob } from "node-schedule"
import { helpConfig } from "../config"
import { createRemindModel, RemindInstance } from "../model/Remind"
import { TaskRunFn } from "../types"

const command = helpConfig.command

/**
 * 判断指令是否有效，有效指令示例：
 * reminder help
 */
export async function isValidRemindCommand(
  commandString: string
): Promise<BotCommandValidResult> {
  const universalValidResult = validBotCommand(commandString, helpConfig)
  if (!universalValidResult.result) {
    return universalValidResult
  }

  const { parsedCommand } = universalValidResult
  const { keyword, args } = parsedCommand
  if (keyword === "add") {
    if (args.length < 3) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongArgs,
        errMsg: `参数不足，请输入 ${command} help 查看帮助`,
      }
    }
    const taskRule = args[1]
    const ruleItem = taskRule.split(" ")
    if (
      ruleItem.length !== 6 ||
      ruleItem.every((item) => item !== "*" || isNaN(Number(item)))
    ) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongArgs,
        errMsg: `定时器规则解析失败，请输入 ${command} help 查看帮助`,
      }
    }
  } else if (keyword === "del") {
    if (!args.length) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongArgs,
        errMsg: "缺少对应参数，请输入 reminder help 查看帮助",
      }
    }
    const id = args[0]
    if (isNaN(Number(id))) {
      return {
        result: false,
        errno: CommandErrNoEnum.wrongArgs,
        errMsg: `id 为整数类型，请输入 ${command} help 查看帮助`,
      }
    }
  }
  return universalValidResult
}

/**
 * 开始提醒任务
 * @param record
 * @param taskRunCbQueue
 */
export function startRemindTask(
  record: RemindInstance,
  taskRunCbQueue: TaskRunFn[],
  remindModel?: ReturnType<typeof createRemindModel>
) {
  miraiLogger.info(
    `[Reminder] Task id=${record.id} name=${record.taskName} platform=${record.platform} ready to run`
  )
  if (remindModel) {
    scheduleJob(record.loopRule, async () => {
      const isValidRecord = !!(await remindModel.findByPk(record.id))
      if (isValidRecord) {
        miraiLogger.info(
          `[Reminder] Task id=${record.id} name=${record.taskName} platform=${record.platform} is running`
        )
        taskRunCbQueue.forEach((cb) => {
          cb(record)
        })
      } else {
        miraiLogger.warn(
          `[Reminder] Task id=${record.id} name=${record.taskName} platform=${record.platform} is delete, nothing to do`
        )
      }
    })
  } else {
    miraiLogger.error(
      `[Reminder] Can not connect remind model instance, Task id=${record.id} name=${record.taskName} platform=${record.platform} run failed`
    )
  }
}
