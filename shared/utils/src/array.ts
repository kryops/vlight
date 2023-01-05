import { IdType } from '@vlight/types'

/**
 * Removes the given element from the given array, mutating it.
 */
export function removeFromMutableArray<T>(arr: T[], el: T): void {
  const index = arr.indexOf(el)
  if (index === -1) {
    return
  } else if (index === 0) {
    arr.shift()
  } else if (index === arr.length - 1) {
    arr.pop()
  } else {
    arr.splice(index, 1)
  }
}

/**
 * Adds the given element from the given array, mutating it.
 *
 * Does nothing if the element is already contained.
 */
export function addToMutableArray<T>(arr: T[], el: T): void {
  if (arr.includes(el)) {
    return
  }
  arr.push(el)
}

/**
 * Creates an array from the return values of the given callback for a range of numbers.
 */
export function arrayRange<T>(
  min: number,
  max: number,
  cb: (current: number) => T
): T[] {
  const length = Math.floor(max - min + 1)
  if (length <= 0) return []

  const entries: T[] = new Array(length)
  for (let current = min; current <= max; current++) {
    entries[current - min] = cb(current)
  }

  return entries
}

/**
 * Creates an array containing a range of numbers.
 */
export function createRangeArray(min: number, max: number): number[] {
  const length = Math.floor(max - min + 1)
  if (length <= 0) return []

  const arr: number[] = new Array(length)
  for (let i = min; i <= max; i++) {
    arr[i - min] = i
  }
  return arr
}

/**
 * Converts an entity array into a map by the entities' ID.
 */
export function entityArrayToMap<T extends { id: IdType }>(
  arr: T[]
): Map<IdType, T> {
  return new Map<IdType, T>(arr.map(it => [it.id, it]))
}

/**
 * Executes a callback for a single value or an array of values.
 */
export function forEach<T>(entry: T | T[], cb: (it: T) => void): void {
  if (Array.isArray(entry)) {
    entry.forEach(cb)
  } else {
    cb(entry)
  }
}

/**
 * Sorts an array of objects by the value of a key.
 */
export function sortByKey<T extends object>(arr: T[], key: keyof T): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return -1
    return aVal < bVal ? -1 : 1
  })
}

/**
 * Moves the given preferred values to the beginning of the array
 * in the order they are defined in.
 *
 * Mutates the given array.
 */
export function preferredOrder<T>(arr: T[], preferred: T[]): T[] {
  let currentTargetIndex = 0

  preferred.forEach(value => {
    const index = arr.indexOf(value)
    if (index === -1) return
    if (index !== currentTargetIndex) {
      arr.splice(index, 1)
      arr.splice(currentTargetIndex, 0, value)
    }

    currentTargetIndex++
  })

  return arr
}

/**
 * Wraps a value in an array if the value is not an array already.
 */
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * Does a shallow comparison between two arrays.
 */
export function arrayShallowEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => b[index] === value)
}
