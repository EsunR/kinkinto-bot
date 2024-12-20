import { IMessageChain, IMiraiEvent } from "mirai-http-sdk-ts"

export function getNewFriendRequestMessageChain(
  miraEvent: IMiraiEvent
): IMessageChain[] {
  if (miraEvent.type !== "NewFriendRequestEvent") {
    return [
      {
        type: "Plain",
        text: "事件无效",
      },
    ]
  }
  return [
    {
      type: "Plain",
      text: "收到了好友请求，同意请求回复 1，拒绝请求回复 0\n",
    },
    {
      type: "Plain",
      text: `用户名: ${miraEvent.nick}\n`,
    },
    {
      type: "Plain",
      text: `申请人QQ号: ${miraEvent.fromId}\n`,
    },
    {
      type: "Plain",
      text: `申请消息: ${miraEvent.message}\n`,
    },
    {
      type: "Plain",
      text: `${miraEvent.type}-${miraEvent.eventId}`,
    },
  ]
}

export function getBotInvitedJoinGroupRequestMessageChain(
  miraEvent: IMiraiEvent
): IMessageChain[] {
  if (miraEvent.type !== "BotInvitedJoinGroupRequestEvent") {
    return [
      {
        type: "Plain",
        text: "事件无效",
      },
    ]
  }
  return [
    {
      type: "Plain",
      text: "收到了群邀请，同意请求回复 1，拒绝请求回复 0\n",
    },
    {
      type: "Plain",
      text: `群名称: ${miraEvent.groupName}\n`,
    },
    {
      type: "Plain",
      text: `邀请群QQ号: ${miraEvent.groupId}\n`,
    },
    {
      type: "Plain",
      text: `邀请人: ${miraEvent.nick}\n`,
    },
    {
      type: "Plain",
      text: `邀请人QQ号: ${miraEvent.fromId}\n`,
    },
    {
      type: "Plain",
      text: `邀请消息: ${miraEvent.message}\n`,
    },
    {
      type: "Plain",
      text: `${miraEvent.type}-${miraEvent.eventId}`,
    },
  ]
}

export function getBotJoinGroupMessageChain(
  miraEvent: IMiraiEvent
): IMessageChain[] {
  if (miraEvent.type !== "BotJoinGroupEvent") {
    return [
      {
        type: "Plain",
        text: "事件无效",
      },
    ]
  }
  return [
    {
      type: "Plain",
      text: "收到了入群消息\n",
    },
    {
      type: "Plain",
      text: `群名称: ${miraEvent.group.name}\n`,
    },
    {
      type: "Plain",
      text: `邀请群QQ号: ${miraEvent.group.id}\n`,
    },
    {
      type: "Plain",
      text: `邀请人: ${miraEvent.invitor.memberName}\n`,
    },
    {
      type: "Plain",
      text: `邀请人QQ号: ${miraEvent.invitor.id}\n`,
    },
  ]
}
