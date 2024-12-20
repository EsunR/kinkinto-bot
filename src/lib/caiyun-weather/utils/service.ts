import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import CaiyunWeather from ".."
import { Location } from "../types"
import { ICaiyunApi, PickCaiyunReq, PickCaiyunRes } from "../types/api"

export interface CaiyunRequestConfig extends AxiosRequestConfig {
  location?: Location
}

export function createService(instance: CaiyunWeather) {
  const service = axios.create({
    baseURL: `https://api.caiyunapp.com/v2.6/${instance.apiKey}`,
  })

  service.interceptors.request.use((config: CaiyunRequestConfig) => {
    const location = config.location
    if (location) {
      config.baseURL = config.baseURL + `/${location.join(",")}`
    }
    return config
  })

  const caiyunService = {
    get<URL extends keyof ICaiyunApi>(url: URL, config?: CaiyunRequestConfig) {
      return service.get<any, AxiosResponse<PickCaiyunRes<URL>>, any>(
        url,
        config
      )
    },
    post<URL extends keyof ICaiyunApi>(
      url: URL,
      data?: PickCaiyunReq<URL>,
      config?: CaiyunRequestConfig
    ) {
      return service.post<any, AxiosResponse<PickCaiyunRes<URL>>, any>(
        url,
        data,
        config
      )
    },
  }

  return caiyunService
}
