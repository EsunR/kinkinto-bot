import { DataTypes, Model, Optional, Sequelize } from "sequelize"

export interface ReportAttribute {
  id: number
  /**
   * 纬度
   */
  locationLongitude: number
  /**
   * 经度
   */
  locationLatitude: number
  /**
   * 位置名称
   */
  locationName: string
  /**
   * 创建人 id
   */
  creatorId: string
  /**
   * 来源，QQ为群号或者好友号，Telegram 为会话 id
   */
  source: string
  /**
   * 来源的类型，如果来源是 qq 则必填
   */
  sourceType: "group" | "friend"
  /**
   * 平台，telegram 或 qq
   */
  platform: "qq" | "telegram"
  createdAt: string
}

export interface ReportCreationAttributes
  extends Optional<ReportAttribute, "id" | "createdAt" | "sourceType"> {}

export interface ReportInstance
  extends Model<ReportAttribute, ReportCreationAttributes>,
    ReportAttribute {}

export function createReportModel(sequelize: Sequelize) {
  const ReportModel = sequelize.define<ReportInstance>(
    "WeatherReport",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      locationLongitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      locationLatitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      locationName: {
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
    },
  )

  return ReportModel
}
