import { Dictionary } from '@vlight/entities'

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
