import { IMessageChain } from "mirai-http-sdk-ts"
import { BotHelpConfig } from "@/types/bot"

export function getBotHelpMessageChain(
  helpConfigs: BotHelpConfig[]
): IMessageChain[] {
  return [
    {
      type: "Plain",
      text: "哈喽，你是在找我吗 (´･ω･`) 你可以使用以下指令：\n\n",
    },
    ...helpConfigs.map(
      (config) =>
        ({
          type: "Plain",
          text: `${config.command} help ${config.name}\n`,
        } as IMessageChain)
    ),
  ]
}
