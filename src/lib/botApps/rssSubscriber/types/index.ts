import Mirai from "mirai-http-sdk-ts"

export interface Option {
  miraiInstance: Mirai
}

export type TargetType = "group" | "friend"

export type RssFieldType =
  | "title"
  | "description"
  | "link"
  | "pubDate"
  | "channel"

export interface IRssPushConfig {
  target: string
  targetType: TargetType
  pushCount: number
  rssLink: string
  field?: string
}
