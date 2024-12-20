import {
  BotCommandValidErrorResult,
  BotCommand,
  ParsedBotCommand,
} from "@/types/bot"
import { RemindInstance } from "../model/Remind"

export interface Option {}

export type RemindPlatform = "qq" | "telegram"
export type RemindSource = "group" | "friend"

export interface IBaseMessageOrigin {
  platform: RemindPlatform
  source: string
  creatorId: string
}

export interface IQQMessageOrigin extends IBaseMessageOrigin {
  platform: "qq"
  sourceType: RemindSource
}

export interface ITelegramOrigin extends IBaseMessageOrigin {
  platform: "telegram"
}

export type IMessageOrigin = IQQMessageOrigin | ITelegramOrigin

export type ReminderEventType =
  | "errorCommand"
  | "help"
  | "add"
  | "del"
  | "list"
  | "taskRun"

export type ErrorCommandFn = (
  error: BotCommandValidErrorResult,
  messageOrigin: IMessageOrigin
) => void

export type HelpFn = (messageOrigin: IMessageOrigin) => void

export type AddFn = (
  record: RemindInstance,
  messageOrigin: IMessageOrigin
) => void

export type ListFn = (
  records: RemindInstance[],
  messageOrigin: IMessageOrigin
) => void

export type DelFn = (success: boolean, messageOrigin: IMessageOrigin) => void

export type TaskRunFn = (record: RemindInstance) => void
