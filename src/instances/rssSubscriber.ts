import { RssSubscriber } from "@/lib/botApps/rssSubscriber"
import { mirai } from "./mirai"

export const rssSubscriber = new RssSubscriber({
  miraiInstance: mirai,
})
