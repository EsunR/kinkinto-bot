import { ICaiyunWeatherOption, Location } from "./types"
import { PickCaiyunReq } from "./types/api"
import { GET_DAILY_API } from "./types/api/daily"
import { createService } from "./utils/service"

export class CaiyunWeather {
  readonly apiKey: ICaiyunWeatherOption["apiKey"]
  private service: ReturnType<typeof createService>

  constructor(option: ICaiyunWeatherOption) {
    this.apiKey = option.apiKey
    this.service = createService(this)
  }

  /**
   * 天级别预报
   * @description https://docs.caiyunapp.com/docs/daily
   */
  getDaily(location: Location, params: PickCaiyunReq<typeof GET_DAILY_API>) {
    return this.service.get(GET_DAILY_API, { location, params })
  }
}

export default CaiyunWeather
