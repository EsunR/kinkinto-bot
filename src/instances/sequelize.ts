import { databaseConfig } from "@/config";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "mysql",
  define: {
    freezeTableName: true,
  },
  ...databaseConfig,
})