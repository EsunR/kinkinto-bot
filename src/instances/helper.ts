import ChatStatistician from "@/lib/botApps/chatStatistics"
import Helper from "@/lib/botApps/helper"
import { Reminder } from "@/lib/botApps/reminder"
import { RssSubscriber } from "@/lib/botApps/rssSubscriber"
import { WeatherReporter } from "@/lib/botApps/weatherReporter"
import { mirai } from "./mirai"

export const helper = new Helper({
  miraInstance: mirai,
  apps: [Reminder, WeatherReporter, ChatStatistician, RssSubscriber],
})

export default helper
