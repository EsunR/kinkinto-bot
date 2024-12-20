import { CommandErrNoEnum, BotHelpConfig } from "@/types/bot"
import { miraiLogger } from "@/utils/log"
import path from "path"
import { Sequelize } from "sequelize"
import { fileURLToPath } from "url"
import { helpConfig } from "./config"
import {
  createRemindModel,
  RemindCreationAttributes,
  RemindInstance,
} from "./model/Remind"
import {
  AddFn,
  DelFn,
  ErrorCommandFn,
  HelpFn,
  IMessageOrigin,
  Option,
  ListFn,
  ReminderEventType,
  TaskRunFn,
} from "./types"
import { isValidRemindCommand, startRemindTask } from "./utils"
import { sequelize } from "@/instances/sequelize"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 提醒小助手，所有群组共享一个实例
 */
export class Reminder {
  readonly option: Option
  private sequelize?: Sequelize
  private remindModel?: ReturnType<typeof createRemindModel>
  private _cachedDbOperation: Function[] = []
  private _errorCommandCbQueue: ErrorCommandFn[] = []
  private _helpCbQueue: HelpFn[] = []
  private _addCbQueue: AddFn[] = []
  private _listCbQueue: ListFn[] = []
  private _delCbQueue: DelFn[] = []
  // 定时任务执行时触发，callback 中需要调用对应的机器人实例发送消息
  private _taskRunCbQueue: TaskRunFn[] = []

  static helpConfig: BotHelpConfig = helpConfig

  constructor(option: Option) {
    // 初始化配置
    this.option = option

    // 连接数据库
    this._connectDb().then(() => {
      this._syncDb()
        ?.then(() => {
          this._cachedDbOperation.forEach((cb) => cb())
          this._cachedDbOperation.length = 0
        })
        .catch((e) => {
          miraiLogger.error("[Reminder] Reminder db unable sync with error:", e)
        })
    })
  }

  private async _connectDb() {
    // const sequelize = new Sequelize({
    //   dialect: "sqlite",
    //   storage: path.resolve(__dirname, "../../../../db/reminder.sqlite"),
    // })
    try {
      await sequelize.authenticate()
      miraiLogger.info(
        "[Reminder] Reminder db connection has been established successfully."
      )
    } catch (error) {
      miraiLogger.error(
        "[Reminder] Unable to connect to the reminder database:",
        error
      )
    }
    this.sequelize = sequelize
  }

  private async _syncDb() {
    if (this.sequelize) {
      const remindModel = createRemindModel(this.sequelize)
      await remindModel.sync()
      this.remindModel = remindModel
    }
  }

  /**
   * 查找已有的提醒
   */
  async getRemindList(
    target:
      | {
          platform: "qq"
          source: RemindInstance["source"]
          sourceType: RemindInstance["sourceType"]
        }
      | {
          platform: "telegram"
          source: RemindInstance["source"]
        }
  ) {
    const results = await this.remindModel?.findAll({ where: { ...target } })
    return results
  }

  /**
   * 创建目标群组的提醒
   * @param record
   */
  async addRemind(record: RemindCreationAttributes) {
    return await this.remindModel?.create(record)
  }

  /**
   * 接收消息
   */
  async receiveMessage(message: string, origin: IMessageOrigin) {
    const validResult = await isValidRemindCommand(message)
    if (validResult.result === false) {
      if (validResult.errno === CommandErrNoEnum["unknownCommand"]) {
        return
      } else {
        this._errorCommandCbQueue.forEach((cb) => {
          miraiLogger.info(`[Reminder] Error command revived: ${message}`)
          miraiLogger.debug(
            `[Reminder] validResult: ${JSON.stringify(validResult)}`
          )
          cb(validResult, origin)
        })
      }
    } else {
      miraiLogger.info(`[Reminder] Revived valid message: ${message}`)
      const keyword = validResult.parsedCommand.keyword as ReminderEventType
      const args = validResult.parsedCommand.args
      switch (keyword) {
        case "help": {
          miraiLogger.info(
            `[Reminder] Help command revived, origin: ${JSON.stringify(origin)}`
          )
          this._helpCbQueue.forEach((cb) => {
            cb(origin)
          })
          break
        }
        case "add": {
          miraiLogger.info(
            `[Reminder] Add command revived, origin: ${JSON.stringify(origin)}`
          )
          const [taskName, loopRule, content] = args
          // 写入任务
          const record = await this.addRemind({
            taskName,
            loopRule,
            content,
            platform: origin.platform,
            source: origin.source,
            creatorId: origin.creatorId,
            ...(origin.platform === "qq"
              ? { sourceType: origin.sourceType }
              : { sourceType: undefined }),
          })
          // 触发任务
          if (record) {
            startRemindTask(record, this._taskRunCbQueue, this.remindModel)
            // 触发添加成功的 callback
            this._addCbQueue.forEach((cb) => {
              cb(record, origin)
            })
          }
          break
        }
        case "list": {
          miraiLogger.info(
            `[Reminder] List command revived, origin: ${JSON.stringify(origin)}`
          )
          const records = await this.remindModel?.findAll({
            where: { source: origin.source },
          })
          if (records instanceof Array) {
            this._listCbQueue.forEach((cb) => cb(records, origin))
          }
          break
        }
        case "del": {
          miraiLogger.info(
            `[Reminder] Del command revived, origin: ${JSON.stringify(origin)}`
          )
          const [id] = args
          const record = await this.remindModel?.findOne({
            where: { id: Number(id), source: origin.source },
          })
          if (record) {
            await record.destroy()
            this._delCbQueue.forEach((cb) => cb(true, origin))
          } else {
            this._delCbQueue.forEach((cb) => cb(false, origin))
          }
          break
        }
      }
    }
  }

  /**
   * 添加监听
   */
  addListener(event: "errorCommand", cb: ErrorCommandFn): any
  addListener(event: "help", cb: HelpFn): any
  addListener(event: "add", cb: AddFn): any
  addListener(event: "list", cb: ListFn): any
  addListener(event: "del", cb: DelFn): any
  addListener(event: "taskRun", cb: TaskRunFn): any
  addListener(
    event: ReminderEventType,
    cb: ErrorCommandFn | HelpFn | AddFn | ListFn | DelFn | TaskRunFn
  ) {
    switch (event) {
      case "errorCommand":
        return this._errorCommandCbQueue.push(cb as ErrorCommandFn)
      case "help":
        return this._helpCbQueue.push(cb as HelpFn)
      case "add":
        return this._addCbQueue.push(cb as AddFn)
      case "list":
        return this._listCbQueue.push(cb as ListFn)
      case "del":
        return this._delCbQueue.push(cb as DelFn)
      case "taskRun":
        return this._taskRunCbQueue.push(cb as TaskRunFn)
    }
  }

  /**
   * 触发已存储的任务
   */
  emitAllTask() {
    return new Promise<void>((resolve) => {
      const _opt = async () => {
        const records = await this.remindModel?.findAll()
        if (records instanceof Array) {
          // 开启每一个任务
          records.forEach((record) => {
            startRemindTask(record, this._taskRunCbQueue, this.remindModel)
          })
        }
        resolve()
      }
      if (this.sequelize) {
        _opt()
      } else {
        this._cachedDbOperation.push(_opt)
      }
    })
  }
}
