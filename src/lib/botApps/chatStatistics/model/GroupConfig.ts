import { DataTypes, Model, Optional, Sequelize } from "sequelize"

export enum GroupConfigFieldEnum {
  ChatReport = "chatReport",
}

export interface GroupConfigAttributes {
  id: string
  /** 群号 */
  groupId: string
  /** 设置字段 */
  field: GroupConfigFieldEnum
  /** 设置值 */
  value: string
}

export interface GroupConfigCreationAttributes
  extends Optional<GroupConfigAttributes, "id"> {}

export interface GroupConfigInstance
  extends Model<GroupConfigAttributes, GroupConfigCreationAttributes>,
    GroupConfigAttributes {}

export function createGroupConfigModel(sequelize: Sequelize) {
  const ConfigModel = sequelize.define<GroupConfigInstance>("GroupConfig", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    field: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  })

  return ConfigModel
}
