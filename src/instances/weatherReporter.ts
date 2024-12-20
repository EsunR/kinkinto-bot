import { botAppConfig } from "@/config"
import { WeatherReporter } from "@/lib/botApps/weatherReporter"
import { mirai } from "./mirai"

export const weatherReporter = new WeatherReporter({
  apiKey: botAppConfig.weatherReporter?.apiKey ?? "",
  miraiInstance: mirai,
  amapApiKey: botAppConfig.weatherReporter?.amapApiKey ?? "",
})
