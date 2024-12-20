import { DataTypes, Model, Optional, Sequelize } from "sequelize"
import { ModeValue } from "../types"

interface ModeAttributes {
  id: number
  value: ModeValue
}

interface ModeCreationAttributes extends Optional<ModeAttributes, "id"> {}

interface ModeInstance
  extends Model<ModeAttributes, ModeCreationAttributes>,
    ModeAttributes {}

export function createModeModel(sequelize: Sequelize) {
  const ModeModel = sequelize.define<ModeInstance>("AppEnvMode", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  })

  return ModeModel
}
