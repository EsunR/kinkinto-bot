import {
  IAqi,
  IAstor,
  IBaseCaiyunApiRes,
  ICloudrate,
  IDswrf,
  IHumidity,
  IPm25,
  IPrecipitation,
  IPressure,
  ISkycon,
  ITemperature,
  IVisibility,
  IWind,
} from ".."

export const GET_DAILY_API = "/daily"

export interface IDailyApi {
  [GET_DAILY_API]: {
    req: {
      dailysteps: number
    }
    res: IBaseCaiyunApiRes & {
      result: {
        daily: {
          status: string
          astor: IAstor[]
          precipitation: IPrecipitation[]
          temperature: ITemperature[]
          temperature_08h_20h: ITemperature[]
          temperature_20h_32h: ITemperature[]
          wind: IWind[]
          wind_08h_20h: IWind[]
          wind_20h_32h: IWind[]
          humidity: IHumidity[]
          cloudrate: ICloudrate[]
          pressure: IPressure[]
          visibility: IVisibility[]
          dswrf: IDswrf[]
          air_quality: {
            aqi: IAqi[]
            pm25: IPm25[]
          }
          skycon: ISkycon[]
          skycon_08h_20h: ISkycon[]
          skycon_20h_32h: ISkycon[]
          life_index: any
        }
      }
    }
  }
}
