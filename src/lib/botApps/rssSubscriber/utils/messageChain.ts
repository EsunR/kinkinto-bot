import { IMessageChain } from "mirai-http-sdk-ts"
import { miraiLogger } from "@/utils/log"
import { DomUtils, Parser } from "htmlparser2"
import moment from "moment"
import { filterTextContent, filterTextFragment, rssFields } from "../config"
import { IRssPushConfig, RssFieldType } from "../types"

function getDescriptionMessageChain(description: string): IMessageChain[] {
  const messageChain: IMessageChain[] = []
  let allText = ""
  const parser = new Parser({
    onopentag: (name, attribs) => {
      if (name === "img") {
        messageChain.push({
          type: "Image",
          url: attribs.src,
        })
      }
    },
    ontext: (text) => {
      allText += text
      // 判断是否有过滤文字
      const hasFilterFragmentText = filterTextFragment.some((item) =>
        text.includes(item)
      )
      if (!hasFilterFragmentText && text.trim()) {
        messageChain.push(
          {
            type: "Plain",
            text: text.trim(),
          },
          {
            type: "Plain",
            text: "\n",
          }
        )
      }
    },
  })
  parser.write(description)
  parser.end()
  // 判断消息是否包含敏感内容
  const hasFilterContent = filterTextContent.some((item) => {
    if (allText.includes(item)) {
      miraiLogger.warn(`[RssSubscriber] Rss 内容被过滤：${allText}`)
      miraiLogger.warn(`[RssSubscriber] 包含敏感词：${item}`)
      return true
    }
    return false
  })
  if (hasFilterContent) {
    return [
      {
        type: "Plain",
        text: "RSS 内容被过滤",
      },
    ]
  } else {
    const lastMessageChainItem = messageChain[messageChain.length - 1]
    if (
      lastMessageChainItem.type === "Plain" &&
      lastMessageChainItem.text === "\n"
    ) {
      messageChain.pop()
    }
    return messageChain
  }
}

function getChannelMessageChain(channel: string): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: `RSS频道：${channel}`,
    },
  ]
}

function getPubDateMessageChain(pubDate: Date): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: `发布时间：${moment(pubDate).format("YYYY-MM-DD HH:mm:ss")}`,
    },
  ]
}

function getLinkMessageChain(link: string): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: `原文链接：${link}`,
    },
  ]
}

function getTitleMessageChain(title: string): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: `标题：${title}`,
    },
  ]
}

export function rssFeedItem2MessageChain(
  feedItem: DomUtils.FeedItem,
  rssInfo: DomUtils.Feed,
  field: IRssPushConfig["field"] = "description"
): IMessageChain[] {
  const fields = field
    .split("|")
    .filter((item: any) => rssFields.includes(item)) as RssFieldType[]
  // 如果没有指定 field，则默认使用 description
  if (fields.length === 0) {
    fields.push("description")
  }
  miraiLogger.debug(`[RssSubscriber] RssSubscriber need get fields: ${fields}`)
  // 提取需要的字段
  const messageChainGroup: IMessageChain[][] = []
  fields.forEach((field) => {
    switch (field) {
      case "channel":
        if (rssInfo.title) {
          messageChainGroup.push(getChannelMessageChain(rssInfo.title))
        }
        break
      case "title":
        if (feedItem.title) {
          messageChainGroup.push(getTitleMessageChain(feedItem.title))
        }
        break
      case "description":
        if (feedItem.description) {
          messageChainGroup.push(
            getDescriptionMessageChain(feedItem.description)
          )
        }
        break
      case "pubDate":
        if (feedItem.pubDate) {
          messageChainGroup.push(getPubDateMessageChain(feedItem.pubDate))
        }
        break
      case "link":
        if (feedItem.link) {
          messageChainGroup.push(getLinkMessageChain(feedItem.link))
        }
        break
    }
  })
  // 组合所有信息
  const messageChain: IMessageChain[] = []
  messageChainGroup.forEach((item, index) => {
    messageChain.push(...item)
    if (index !== messageChainGroup.length - 1) {
      messageChain.push(
        {
          type: "Plain",
          text: "\n",
        },
        {
          type: "Plain",
          text: "\n",
        }
      )
    }
  })
  return messageChain
}
