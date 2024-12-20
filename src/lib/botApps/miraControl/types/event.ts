import { IMiraiEvent } from "mirai-http-sdk-ts"

export type MiraControlEvent =
  | "newFriendRequest"
  | "botInvitedJoinGroupRequest"
  | "botJoinGroup"

export type NewFriendRequestFn = (event: IMiraiEvent) => void
export type BotInvitedJoinGroupRequestFn = (event: IMiraiEvent) => void
export type BotJoinGroupFn = (event: IMiraiEvent) => void
