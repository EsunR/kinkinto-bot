import { qqBotConfig } from "@/config"
import Mirai from "mirai-http-sdk-ts"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const mirai = new Mirai({
  host: qqBotConfig.host,
  botQQ: qqBotConfig.botQQ,
  verifyKey: qqBotConfig.verifyKey,
  logger: {
    filePath: path.resolve(__dirname, "../../log/mira-http-ts-sdk.log"),
    level: "debug",
  },
})
