import { IdType } from '@vlight/types'

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

export function addToMutableArray<T>(arr: T[], el: T): void {
  if (arr.includes(el)) {
    return
  }
  arr.push(el)
}

export function arrayRange<T>(
  min: number,
  max: number,
  cb: (current: number) => T
): T[] {
  const entries: T[] = []
  for (let current = min; current <= max; current++) {
    entries.push(cb(current))
  }

  return entries
}

export function createRangeArray(min: number, max: number): number[] {
  const arr: number[] = []
  for (let i = min; i <= max; i++) {
    arr.push(i)
  }
  return arr
}

export function entityArrayToMap<T extends { id: IdType }>(
  arr: T[]
): Map<IdType, T> {
  return new Map<IdType, T>(arr.map(it => [it.id, it]))
}

export function forEach<T>(entry: T | T[], cb: (it: T) => void): void {
  if (Array.isArray(entry)) {
    entry.forEach(cb)
  } else {
    cb(entry)
  }
}
