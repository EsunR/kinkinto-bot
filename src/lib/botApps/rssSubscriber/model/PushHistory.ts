import { DataTypes, Model, Optional, Sequelize } from "sequelize"
import { TargetType } from "../types"

export interface PushHistoryAttribute {
  id: number
  /**
   * 推送目标
   */
  target: string
  /**
   * 推送目标类型
   */
  targetType: TargetType
  /**
   * 信息 id
   */
  recordId: string
}

export interface PushHistoryCreationAttributes
  extends Optional<PushHistoryAttribute, "id"> {}

export interface PushHistoryInstance
  extends Model<PushHistoryAttribute, PushHistoryCreationAttributes>,
    PushHistoryAttribute {}

export function createPushHistoryModel(sequelize: Sequelize) {
  const PushHistoryModel = sequelize.define<PushHistoryInstance>(
    "RssPushHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      target: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      targetType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recordId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }
  )

  return PushHistoryModel
}
