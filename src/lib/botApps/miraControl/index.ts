import { IMiraiMessage, IMiraiEvent } from "mirai-http-sdk-ts"
import { Option } from "./types"
import {
  BotInvitedJoinGroupRequestFn,
  BotJoinGroupFn,
  MiraControlEvent,
  NewFriendRequestFn,
} from "./types/event"

export class MiraController {
  private _newFriendRequestCbQueue: NewFriendRequestFn[] = []
  private _botInvitedJoinGroupRequestCbQueue: BotInvitedJoinGroupRequestFn[] =
    []
  private _botJoinGroupCbQueue: BotJoinGroupFn[] = []
  public option: Option

  constructor(option: Option) {
    this.option = option
  }

  receiveMessage(message: IMiraiMessage) {}

  receiveEvent(event: IMiraiEvent) {
    switch (event.type) {
      case "NewFriendRequestEvent": {
        this._newFriendRequestCbQueue.forEach((cb) => cb(event))
        break
      }
      case "BotInvitedJoinGroupRequestEvent": {
        this._botInvitedJoinGroupRequestCbQueue.forEach((cb) => cb(event))
        break
      }
      case "BotJoinGroupEvent": {
        this._botJoinGroupCbQueue.forEach((cb) => cb(event))
        break
      }
    }
  }

  addListener(event: "newFriendRequest", cb: NewFriendRequestFn): any
  addListener(
    event: "botInvitedJoinGroupRequest",
    cb: BotInvitedJoinGroupRequestFn
  ): any
  addListener(event: "botJoinGroup", cb: BotJoinGroupFn): any
  addListener(
    event: MiraControlEvent,
    cb: NewFriendRequestFn | BotInvitedJoinGroupRequestFn | BotJoinGroupFn
  ) {
    switch (event) {
      case "newFriendRequest": {
        this._newFriendRequestCbQueue.push(cb as NewFriendRequestFn)
        break
      }
      case "botInvitedJoinGroupRequest":
        this._botInvitedJoinGroupRequestCbQueue.push(
          cb as BotInvitedJoinGroupRequestFn
        )
        break
      case "botJoinGroup":
        this._botJoinGroupCbQueue.push(cb as BotJoinGroupFn)
        break
    }
  }
}
