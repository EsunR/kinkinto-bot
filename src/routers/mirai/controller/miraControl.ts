import { miraController } from "@/instances/miraController"
import { IMiraiMessage, IMiraiEvent } from "mirai-http-sdk-ts"
import { ParameterizedContext } from "koa"
import Router from "koa-router"

export function useMiraControl(
  ctx: ParameterizedContext<any, Router.IRouterParamContext<any, {}>, any>
) {
  const reqBody = ctx.request.body as IMiraiMessage | IMiraiEvent

  if (reqBody.type === "GroupMessage" || reqBody.type === "FriendMessage") {
    miraController.receiveMessage(reqBody)
  } else {
    miraController.receiveEvent(reqBody)
  }
}
