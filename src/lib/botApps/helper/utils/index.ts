import Mirai, { IMessageChain } from "mirai-http-sdk-ts"
import { getMessagePlantText } from "mirai-http-sdk-ts/dist/utils"

function hasQQAt(messageChain: IMessageChain[], botQQ: number) {
  return messageChain.find(
    (item) => item.type === "At" && item.target === botQQ
  )
}

function isQQPureMessage(messageChain: IMessageChain[]) {
  const planText = getMessagePlantText(messageChain)
  return planText.trim() === ""
}

function isQQHelpMessage(messageChain: IMessageChain[]) {
  const planText = getMessagePlantText(messageChain)
  return planText.trim() === "help"
}

export function qqGroupNeedHelp(messageChain: IMessageChain[], mirai: Mirai) {
  return (
    hasQQAt(messageChain, Number(mirai.config.botQQ)) &&
    (isQQPureMessage(messageChain) || isQQHelpMessage(messageChain))
  )
}

export function qqFriendNeedHelp(messageChain: IMessageChain[]) {
  return isQQHelpMessage(messageChain)
}
