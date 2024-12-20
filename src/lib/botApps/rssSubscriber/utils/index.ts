import { validBotCommand } from "@/utils/bot"
import { helpConfig } from "../config"

export async function isValidRssSubscriberCommand(commandString: string) {
  const universalValidResult = validBotCommand(commandString, helpConfig)
  if (!universalValidResult.result) {
    return universalValidResult
  }
  return universalValidResult
}
