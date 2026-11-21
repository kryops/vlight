/**
 * Recursively merges objects together.
 *
 * Primitive values and arrays are overwritten.
 */
export function mergeObjects<T extends Record<string, any>>(
  a: T | undefined,
  b: Partial<T> | Record<string, any> | undefined
): T {
  const result = { ...a } as Record<string, any>

  if (b) {
    for (const [key, value] of Object.entries(b)) {
      if (a?.[key] === value) continue
      result[key] =
        a?.[key] !== null &&
        value !== null &&
        typeof a?.[key] === 'object' &&
        typeof value === 'object' &&
        !Array.isArray(a?.[key]) &&
        !Array.isArray(value)
          ? mergeObjects(a[key], value)
          : value
    }
  }

  return result as T
}

/**
 * Compares two objects for shallow equality
 */
export function objectShallowEqual<T extends object>(a: T, b: T): boolean {
  if (Object.keys(a).length !== Object.keys(b).length) return false

  for (const [key, value] of Object.entries(a)) {
    if (value !== (b as any)[key]) return false
  }

  return true
}

/** A path to a (nested) value within an object, e.g. `['channels', 'r']`. */
export type ObjectPath = string[]

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Returns the paths of all leaf values of the given object.
 *
 * Nested plain objects are traversed, while primitive values and arrays
 * are treated as leaves. Empty nested objects are omitted.
 */
export function getLeafPaths(
  object: Record<string, any>,
  prefix: ObjectPath = []
): ObjectPath[] {
  return Object.entries(object).flatMap(([key, value]) =>
    isPlainObject(value)
      ? getLeafPaths(value, [...prefix, key])
      : [[...prefix, key]]
  )
}

/**
 * Returns the value at the given path, or `undefined` if it does not exist.
 */
export function getPathValue(
  object: Record<string, any> | undefined,
  path: ObjectPath
): any {
  let current: any = object
  for (const key of path) {
    if (!isPlainObject(current)) return undefined
    current = current[key]
  }
  return current
}

/**
 * Returns a copy of the given object with the value at the given path replaced.
 *
 * If the value is `undefined`, the entry is removed instead.
 * Missing intermediate objects are created.
 */
export function setPathValue<T extends Record<string, any>>(
  object: T,
  path: ObjectPath,
  value: unknown
): T {
  if (path.length === 0) return object
  const [key, ...rest] = path
  const result: Record<string, any> = { ...object }

  if (rest.length === 0) {
    if (value === undefined) delete result[key]
    else result[key] = value
  } else {
    const child = isPlainObject(result[key]) ? result[key] : {}
    result[key] = setPathValue(child, rest, value)
  }

  return result as T
}

/**
 * Returns a copy of the given object with the value at the given path removed.
 *
 * Parent objects that become empty are removed as well.
 */
export function removePathValue<T extends Record<string, any>>(
  object: T,
  path: ObjectPath
): T {
  if (path.length === 0) return object
  const [key, ...rest] = path
  if (!(key in object)) return object
  const result: Record<string, any> = { ...object }

  if (rest.length === 0 || !isPlainObject(result[key])) {
    delete result[key]
  } else {
    const child = removePathValue(result[key], rest)
    if (Object.keys(child).length === 0) delete result[key]
    else result[key] = child
  }

  return result as T
}
