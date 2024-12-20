import { DataTypes, Model, Optional, Sequelize } from "sequelize"

interface GitLogAttributes {
  id: number
  hash: string
  commit: string
}

interface GitLogCreationAttributes extends Optional<GitLogAttributes, "id"> {}

export interface GitLogInstance
  extends Model<GitLogAttributes, GitLogCreationAttributes>,
    GitLogAttributes {}

export function createGitLogModel(sequelize: Sequelize) {
  const GitLogModel = sequelize.define<GitLogInstance>("GitLog", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    commit: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  })

  return GitLogModel
}
