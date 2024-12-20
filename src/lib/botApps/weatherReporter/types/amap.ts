export interface IGeoGeocode {
  location: string
  formatted_address: string
}

export interface IGeoResponse {
  status: string
  info: string
  infocode: string
  count: number
  geocodes: IGeoGeocode[]
}
