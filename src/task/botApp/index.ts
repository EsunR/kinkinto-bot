import { getChatStatisticians } from "@/instances/chatStatistician"
import { rssSubscriber } from "@/instances/rssSubscriber"
import { weatherReporter } from "@/instances/weatherReporter"
import { logger } from "@/utils/log"
import { useMiraControlTask } from "./miraControlTask"
import { useRemindTask } from "./remindTask"
import { useUpdaterTask } from "./updaterTask"

export default async function startBotAppTask() {
  try {
    // 聊天统计
    const chatStatisticians = await getChatStatisticians()
    chatStatisticians.forEach((chatStatistician) => {
      chatStatistician.emitAllTask()
    })

    weatherReporter.emitAllTask()
    rssSubscriber.emitAllTask()

    useUpdaterTask()
    useRemindTask()
    useMiraControlTask()
  } catch {
    logger.error("Mirai 任务启动失败")
  }
}
