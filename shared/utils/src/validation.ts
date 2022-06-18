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
