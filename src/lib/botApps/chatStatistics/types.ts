import Mirai, { IMessageChain } from "mirai-http-sdk-ts"
import {
  GroupChatCreationAttributes,
  GroupChatInstance,
} from "./model/GroupChat"

export interface Option {
  id: string
  miraiInstance: Mirai
}

export interface StatisticsInfo {
  winnerUname: string
  winnerUid: string
  randomChat: IMessageChain[]
  winnerMessageCount: number
  totalMessageCount: number
  allMessage: GroupChatInstance[][]
}

export interface IDiffTime {
  days: number
  hours: number
}

export type ChatStatisticsEvent = "meetNewMember" | "meetLongTimeNoSpeechMember"

export type MeetNewMemberFn = (message: GroupChatCreationAttributes) => void
export type MeetLongTimeNoSpeechMemberFn = (
  message: GroupChatCreationAttributes,
  diffTime: IDiffTime
) => void

export interface ChatStatTopInfo {
  count: number
  uname: GroupChatInstance["uname"]
  uid: GroupChatInstance["uid"]
}
