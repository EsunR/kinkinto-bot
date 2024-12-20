export type TgChatType = "private"

export enum TgBotMenuEnum {
  AWT_LEAVE_MSG = "/awtleavemsg",
  AWT_NOTIFICATION = "/awtnotifaction",
}

export interface ITgWebHookReqQuery {
  botId: string
}

export interface ITgWebHookReqData {
  update_id: number
  message: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      language_code: string
    }
    chat: {
      id: number
      first_name: string
      type: TgChatType
    }
    date: number
    text: string
    entities: []
  }
}
