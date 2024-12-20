import { miraiLogger } from "@/utils/log"
import moment from "moment"
import path from "path"
import { Sequelize } from "sequelize"
import { fileURLToPath } from "url"
import { createGitLogModel } from "./model/GitLog"
import { createModeModel } from "./model/Mode"
import {
  DevelopmentCb,
  Option,
  ListenerEvent,
  ModeValue,
  ProductModeCb,
  UpdateCb,
} from "./types"
import { getGitLog, getGitLogHash } from "./utils"
import { sequelize } from "@/instances/sequelize"

/**
 * 全局只有一个 updater
 * 在进入开发模式和生产模式时会发送提醒
 * 检查到最新的代码提交会发出提醒
 */
export class Updater {
  private _cachedDbOperation: Function[] = []
  private _developCbQueue: DevelopmentCb[] = []
  private _productCbQueue: ProductModeCb[] = []
  private _updateCbQueue: UpdateCb[] = []
  private sequelize?: Sequelize
  public option?: Option
  public modeModel?: ReturnType<typeof createModeModel>
  public gitLogModel?: ReturnType<typeof createGitLogModel>

  constructor(option: Option) {
    this.option = option
    this._connectDb().then(() => {
      this._syncDb()
        ?.then(() => {
          this._cachedDbOperation.forEach((cb) => cb())
          this._cachedDbOperation.length = 0
        })
        .catch((e) => {
          miraiLogger.error("[Updater] Updater unable sync with error:", e)
        })
    })
  }

  private async _connectDb() {
    // const sequelize = new Sequelize({
    //   dialect: "sqlite",
    //   storage: path.resolve(__dirname, "../../../../db/botUpdater.sqlite"),
    // })
    try {
      await sequelize.authenticate()
      miraiLogger.info(
        "[Updater] Updater connection has been established successfully."
      )
    } catch (error) {
      miraiLogger.error("Updater unable to connect to the database:", error)
    }

    this.sequelize = sequelize
  }

  private async _syncDb() {
    if (this.sequelize) {
      const modeModel = createModeModel(this.sequelize)
      await modeModel.sync()
      this.modeModel = modeModel

      const gitLogModel = createGitLogModel(this.sequelize)
      await gitLogModel.sync()
      this.gitLogModel = gitLogModel
    }
  }

  addListener(
    event: ListenerEvent,
    cb: DevelopmentCb | ProductModeCb | UpdateCb
  ) {
    switch (event) {
      case "development":
        this._developCbQueue.push(cb as DevelopmentCb)
        break
      case "production":
        this._productCbQueue.push(cb as ProductModeCb)
        break
      case "update":
        this._updateCbQueue.push(cb as UpdateCb)
    }
  }

  async getLastModeValue() {
    if (this.modeModel) {
      // 获取 id 倒序数据
      const records = await this.modeModel.findAll({
        order: [["id", "DESC"]],
        limit: 1,
      })
      if (records.length) {
        return records[0].value
      }
    }
    return undefined
  }

  async setModeValue(modeValue: ModeValue) {
    await this.modeModel?.create({ value: modeValue })
  }

  private async _handleModeChange() {
    const NODE_ENV = process.env.NODE_ENV as ModeValue
    if (NODE_ENV === "development") {
      miraiLogger.info(
        `[Updater] ${this._developCbQueue.length} developCbQueue task wait for run`
      )
      this._developCbQueue.forEach((fn) => fn())
    } else if (NODE_ENV === "production") {
      miraiLogger.info(
        `[Updater] ${this._productCbQueue.length} productCbQueue task wait for run`
      )
      this._productCbQueue.forEach((fn) => fn())
    }
    miraiLogger.info(
      `[Updater] No env cached value, env mode change to ${NODE_ENV}`
    )
  }

  /**
   * 检查环境是否发生变化，如果发生变化，就会触发对应的回调函数
   */
  async checkMode() {
    const _opt = async () => {
      const NODE_ENV = process.env.NODE_ENV as ModeValue
      if (!["development", "production"].includes(NODE_ENV)) {
        miraiLogger.warn(
          `[Updater] Error NODE_ENV value: ${NODE_ENV}, updater notify no emit`
        )
        return
      }
      const lastModeValue = await this.getLastModeValue()
      // 上次如果有记录，就对比
      if (lastModeValue) {
        // 发生了改变
        if (lastModeValue !== NODE_ENV) {
          this._handleModeChange()
        }
        // 没有发生改变
        else {
          miraiLogger.info("[Updater] Mode has no change")
        }
      }
      // 如果没有记录，就直接发出通知
      else {
        this._handleModeChange()
      }
      // 更新值
      await this.setModeValue(NODE_ENV)
    }

    if (this.sequelize) {
      _opt()
    } else {
      this._cachedDbOperation.push(_opt)
    }
  }

  /**
   * 读取 git log 信息来发布更新公告
   */
  async checkUpdate() {
    const _opt = async () => {
      const log = getGitLog()
      const hash = getGitLogHash()
      const botFeatLogRegExp = /^feat\(mirai\):/
      // 发现 feature 类型的 log
      if (botFeatLogRegExp.test(log)) {
        miraiLogger.info("[Updater] Get feater log")
        const savedLog = await this.gitLogModel?.findOne({ where: { hash } })
        // 如果这个 log 已经被缓存
        if (savedLog) {
          miraiLogger.info("[Updater] This feature log had be notified")
          return
        } else {
          const _sendNotify = async () => {
            const commit = log.replace(botFeatLogRegExp, "").trim()
            miraiLogger.info(
              `[Updater] ${this._updateCbQueue.length} updateCbQueue task wait for run`
            )
            await this.gitLogModel?.create({ hash, commit })
            this._updateCbQueue.forEach((fn) => fn({ commit, hash }))
          }
          // 夜间不发送更新提醒
          if (moment().hour() < 8) {
            const diffSecond = moment().hour(8).diff(moment(), "s")
            setTimeout(() => {
              _sendNotify()
            }, diffSecond * 1000)
          } else {
            _sendNotify()
          }
        }
      } else {
        miraiLogger.info("[Updater] Get normal log")
      }
    }

    if (this.gitLogModel) {
      _opt()
    } else {
      this._cachedDbOperation.push(_opt)
    }
  }
}
