import axios from "axios"
import { IVnstatJson } from "./types"

export async function getVnstatJsonData(url: string) {
  return (await axios.get(url)).data as IVnstatJson
}
