import axios from "axios"
import { IGeoResponse } from "../types/amap"

export async function getGeoInfo(address: string, apiKey: string) {
  let res = (
    await axios.get("https://restapi.amap.com/v3/geocode/geo", {
      params: {
        key: apiKey,
        address: address,
      },
    })
  ).data as IGeoResponse
  if (res?.geocodes?.length) {
    return res.geocodes[0]
  } else {
    throw new Error()
  }
}
