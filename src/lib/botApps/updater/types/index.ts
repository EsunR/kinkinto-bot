export interface Option {
  modeChangeSilent?: boolean
  updateSilent?: boolean
}

export type DevelopmentCb = () => void

export type ProductModeCb = () => void

export type UpdateCb = (info: { commit: string; hash: string }) => void

export type ListenerEvent = "development" | "production" | "update"

export type ModeValue = "development" | "production"
