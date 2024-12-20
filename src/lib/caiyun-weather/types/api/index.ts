import { IDailyApi } from "./daily"

export type ICaiyunApi = IDailyApi

export type PickCaiyunReq<P extends keyof ICaiyunApi> = ICaiyunApi[P]["req"]
export type PickCaiyunRes<P extends keyof ICaiyunApi> = ICaiyunApi[P]["res"]
