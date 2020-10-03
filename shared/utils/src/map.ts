import { Dictionary } from '@vlight/types'

export function mapToDictionary<V>(
  map: Map<string, V>,
  condition?: (value: V, key: string) => boolean
): Dictionary<V> {
  const dictionary: Dictionary<V> = Object.create(null)
  for (const [k, v] of map) {
    if (condition && !condition(v, k)) continue
    dictionary[k] = v
  }
  return dictionary
}

export function dictionaryToMap<V>(dictionary: {
  [key: string]: V
}): Map<string, V> {
  return new Map(Object.entries(dictionary))
}
