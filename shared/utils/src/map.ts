import { Dictionary } from '@vlight/types'

/**
 * Converts a map into a dictionary object,
 * optionally applying a filtering condition.
 */
export function mapToDictionary<V>(
  map: Map<string, V>,
  condition?: (value: V, key: string) => boolean
): Dictionary<V> {
  if (!condition) return Object.fromEntries(map)

  const dictionary: Dictionary<V> = Object.create(null)
  for (const [k, v] of map) {
    if (!condition(v, k)) continue
    dictionary[k] = v
  }
  return dictionary
}

/**
 * Converts a dictionary object into a map.
 */
export function dictionaryToMap<V>(dictionary: {
  [key: string]: V
}): Map<string, V> {
  return new Map(Object.entries(dictionary))
}
