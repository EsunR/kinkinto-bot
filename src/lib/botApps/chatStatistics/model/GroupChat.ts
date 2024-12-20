import { DataTypes, Model, Optional, Sequelize } from "sequelize"

export interface GroupChatAttributes {
  id: string
  uid: string
  uname: string
  /** 纯文本内容 */
  content?: string
  /** 图片内容 */
  imageContent?: string
  /** 回复内容（纯文本） */
  quoteContent?: string
  /** 原始内容 */
  origin: string
  createdAt: string
}

export interface GroupChatCreationAttributes
  extends Optional<
    GroupChatAttributes,
    "createdAt" | "content" | "imageContent" | "quoteContent"
  > {}

export interface GroupChatInstance
  extends Model<GroupChatAttributes, GroupChatCreationAttributes>,
    GroupChatAttributes {}

export function createGroupChatModel(sequelize: Sequelize, tableId: string) {
  const ChatModel = sequelize.define<GroupChatInstance>(
    `GroupChat_${tableId}`,
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quoteContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      origin: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
    }
  )

  return ChatModel
}
