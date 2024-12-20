import { cleanLogFileBeforeDate, logger } from "@/utils/log"
import moment from "moment"
import schedule from "node-schedule"

function cleanLog() {
  cleanLogFileBeforeDate("os.log", moment().add(-3, "day").toDate())
  cleanLogFileBeforeDate("app.log", moment().add(-3, "day").toDate())
  cleanLogFileBeforeDate("telegram.log", moment().add(-3, "day").toDate())
  cleanLogFileBeforeDate("mirai.log", moment().add(-1, "day").toDate())
  cleanLogFileBeforeDate(
    "mira-http-ts-sdk.log",
    moment().add(-1, "day").toDate()
  )
}

export default function cleanTask() {
  schedule.scheduleJob("0 0 2 * * *", () => {
    cleanLog()
    logger.info("clean log task done")
  })
}
