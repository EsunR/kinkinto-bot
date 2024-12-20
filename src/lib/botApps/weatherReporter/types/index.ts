import { Location } from "@/lib/caiyun-weather/types"
import Mirai from "mirai-http-sdk-ts"

export interface Option {
  apiKey: string
  miraiInstance: Mirai
  amapApiKey: string
}

export interface ILocation {
  name: string
  location: Location
}

export interface IWeatherInfoItem {
  locationName: string
  skyConZN: string
  skyConEmoji: string
  isDay: boolean
  temperature: {
    max: number
    min: number
  }
}
