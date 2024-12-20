import { MiraController } from "@/lib/botApps/miraControl"
import { mirai } from "./mirai"

export const miraController = new MiraController({
  // FIXME: 添加管理员
  admins: ["641411169"],
})
