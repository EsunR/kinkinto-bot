import { DataTypes, Model, Optional, Sequelize } from "sequelize"
import { RemindPlatform, RemindSource } from "../types"

export interface RemindAttribute {
  id: number
  /**
   * 任务名称
   */
  taskName: string
  /**
   * 提醒的重复规则 【秒 分 时 日 月 年】
   */
  loopRule: string
  /**
   * 提醒内容，可以为 MessageChain stringify，但要去除 Source
   */
  content: string
  /**
   * 创建人
   */
  creatorId: string
  /**
   * 来源，QQ为群号或者好友号，Telegram 为会话 id
   */
  source: string
  /**
   * 来源的类型，如果来源是 qq 则必填
   */
  sourceType: RemindSource
  /**
   * 平台，telegram 或 qq
   */
  platform: RemindPlatform
  createdAt: string
}

export interface RemindCreationAttributes
  extends Optional<RemindAttribute, "id" | "createdAt" | "sourceType"> {}

export interface RemindInstance
  extends Model<RemindAttribute, RemindCreationAttributes>,
    RemindAttribute {}

export function createRemindModel(sequelize: Sequelize) {
  const RemindModel = sequelize.define<RemindInstance>("Remind", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    loopRule: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
  })

  return RemindModel
}
