import { botAppConfig } from "@/config"
import { miraiLogger } from "@/utils/log"
import axios from "axios"
import { parseFeed, DomUtils } from "htmlparser2"

const services = [
  ...(botAppConfig?.rssHub?.services ?? []),
  "https://rsshub.app",
]

export async function getRssContent(
  route: string,
  retryTime: number = 0
): Promise<DomUtils.Feed | null> {
  try {
    const res = await axios.get(route, { baseURL: services[retryTime] })
    miraiLogger.debug(
      `[RssSubscriber] RssSubscriber getRssContent route: ${route} success 😄`
    )
    const rssContent = parseFeed(res.data)
    return rssContent
  } catch (error) {
    miraiLogger.error(
      `[RssSubscriber] Rss route request error: ${route}, service: ${services[retryTime]}`
    )
    if (retryTime < services.length - 1) {
      miraiLogger.debug(
        `[RssSubscriber] Retry to request rss route, change to server ${
          services[retryTime + 1]
        }`
      )
      return await getRssContent(route, retryTime + 1)
    } else {
      miraiLogger.debug(
        "[RssSubscriber] Retry rss route failed, wait for next time ... ..."
      )
      return null
    }
  }
}
