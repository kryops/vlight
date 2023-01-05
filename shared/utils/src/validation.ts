import { arrayShallowEqual } from './array'
import { objectShallowEqual } from './object'

/**
 * Type guard to improve type inference when filtering out false array elements.
 */
export function isTruthy<T>(x: T | undefined | null | false | 0 | ''): x is T {
  return !!x
}

/**
 * Array filter function that filters out duplicate elements.
 */
export function isUnique<T>(el: T, index: number, arr: T[]): boolean {
  return arr.indexOf(el) === index
}

/**
 * Compares two values for shallow equality
 * (primitive values, arrays or objects).
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) return true

  if (Array.isArray(a)) {
    return Array.isArray(b) ? arrayShallowEqual(a, b) : false
  } else if (Array.isArray(b)) {
    return false
  }

  if (typeof a === 'object' && a && typeof b === 'object' && b) {
    return objectShallowEqual(a, b)
  }

  return false
}

/**
 * Compares two values for deep equality
 * (primitive values, arrays or objects).
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true

  if (Array.isArray(a)) {
    if (Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((value, index) => deepEqual(value, b[index]))
    }
    return false
  } else if (Array.isArray(b)) {
    return false
  }

  if (typeof a === 'object' && a && typeof b === 'object' && b) {
    if (Object.keys(a).length !== Object.keys(b).length) return false

    for (const [key, value] of Object.entries(a)) {
      if (!deepEqual(value, (b as any)[key])) return false
    }

    return true
  }

  return false
}
