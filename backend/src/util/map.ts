import { Dictionary } from '@vlight/entities'

export function mapToDictionary<V>(map: Map<string, V>): Dictionary<V> {
  const dictionary: Dictionary<V> = Object.create(null)
  for (const [k, v] of map) {
    dictionary[k] = v
  }
  return dictionary
}
