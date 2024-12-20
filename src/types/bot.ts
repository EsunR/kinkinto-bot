import { GroupPermission } from "mirai-http-sdk-ts"

export enum CommandErrNoEnum {
  unknownCommand = 0,
  unparsable = 1,
  unknownKeyword = 2,
  wrongArgs = 2,
  wrongPermission = 3,
}

export interface ParsedBotCommand {
  command: string
  keyword: string
  args: string[]
}

export interface BotCommandValidErrorResult {
  result: false
  errno: CommandErrNoEnum
  errMsg: string
}

export interface BotCommandValidSuccessResult {
  result: true
  parsedCommand: ParsedBotCommand
}

export type BotCommandValidResult =
  | BotCommandValidErrorResult
  | BotCommandValidSuccessResult

export interface BotCommand {
  keyword: string
  note: string
  operation: string
  example?: string[]
  permission?: GroupPermission[]
}

export interface BotHelpConfig {
  name: string
  onlyForFriend?: boolean
  onlyForGroup?: boolean
  description?: string
  command: string
  commands: BotCommand[]
  commandAlisa?: Record<string, string>
}
