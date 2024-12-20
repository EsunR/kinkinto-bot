import { SKY_CON, SKY_CON_EMOJI } from "../config"
import { SkyCon } from "../types"

export function getSkyConZnName(
  skyCon: string,
  config?: {
    ignoreDayMark: boolean
  }
) {
  const { ignoreDayMark = false } = config || {}
  let result = SKY_CON[skyCon as SkyCon] || "未知天气"
  if (ignoreDayMark) {
    result = result.replace("（白天）", "").replace("（夜间）", "")
  }
  return result
}

export function getSkyConEmoji(skyCon: string) {
  let result = SKY_CON_EMOJI[skyCon as SkyCon] || "❓"
  return result
}
