export function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, time)
  })
}

/**
 * 将新值合并到 map value 中
 */
export function mergeMapValue<MapKey, MapValue extends Object>(
  map: Map<MapKey, MapValue>,
  key: MapKey,
  value: Partial<MapValue>
) {
  const currentMapVal = map.get(key)
  const newMapVal = Object.assign(currentMapVal || {}, value) as MapValue
  map.set(key, newMapVal)
}

export function isNumberString(value: any) {
  if (typeof value === "string") {
    const numberedVal = Number(value)
    if (Number.isNaN(numberedVal)) {
      return false
    }
    return true
  }
  return false
}
