import { SKY_CON } from "../config"

export interface ICaiyunWeatherOption {
  apiKey: string
}

export type Location = [number, number]

export type SkyCon = keyof typeof SKY_CON

export interface IBaseCaiyunApiRes {
  status: "ok"
  api_version: string
  api_status: string
  lang: string
  unit: string
  tzshift: number
  timezone: string
  server_time: number
  location: Location
}

// 天文数据
export interface IAstor {
  date: string
  sunrise: {
    time: string
  }
  sunset: {
    time: string
  }
}

/**
 * 降水数据
 */
export interface IPrecipitation {
  date: string
  max: number
  min: number
  avg: number
}

export interface ITemperature {
  date: string
  max: number
  min: number
  avg: number
}

export interface IWind {
  date: string
  max: {
    speed: number
    direction: number
  }
  min: {
    speed: number
    direction: number
  }
  avg: {
    speed: number
    direction: number
  }
}

export interface IHumidity {
  date: string
  max: number
  min: number
  avg: number
}

/**
 * 云量(0.0-1.0)
 */
export interface ICloudrate {
  date: string
  max: number
  min: number
  avg: number
}

export interface IPressure {
  date: string
  max: number
  min: number
  avg: number
}

export interface IVisibility {
  date: string
  max: number
  min: number
  avg: number
}

// 向下短波辐射通量(W/M2)
export interface IDswrf {
  date: string
  max: number
  min: number
  avg: number
}

export interface IAqi {
  date: string
  max: {
    chn: number
    usa: number
  }
  avg: {
    chn: number
    usa: number
  }
  min: {
    chn: number
    usa: number
  }
}

export interface IPm25 {
  date: string
  max: number
  min: number
  avg: number
}

export interface ISkycon {
  date: string
  value: SkyCon
}
