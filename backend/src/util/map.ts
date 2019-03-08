import { Dictionary } from '@vlight/entities'

export function mapToDictionary<K extends number | string, V>(
  map: Map<K, V>
): Dictionary<V> {
  const dictionary: Dictionary<V> = Object.create(null)
  for (const [k, v] of map) {
    dictionary[String(k)] = v
  }
  return dictionary
}
