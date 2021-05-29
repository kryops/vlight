import {
  Dictionary,
  RandomChannels,
  ValueOrRandom,
  ValueRange,
} from '@vlight/types'

export function valueRange<T>(from: T, to: T): ValueRange<T> {
  return { from, to }
}

export function isValueRange(x: unknown): x is ValueRange<any> {
  return typeof x === 'object' && x !== null && 'from' in x && 'to' in x
}

export function lowestRandomValue<T extends number>(
  value: ValueOrRandom<T>
): T {
  if (isValueRange(value)) return value.from
  if (Array.isArray(value)) return Math.min(...value) as T
  return value
}

export function highestRandomValue<T extends number>(
  value: ValueOrRandom<T>
): T {
  if (isValueRange(value)) return value.to
  if (Array.isArray(value)) return Math.max(...value) as T
  return value
}

export function randomNumber(min = 0, max = 1, round = false): number {
  const value = min + Math.random() * (max - min)
  if (round) return Math.round(value)
  return value
}

export function randomArrayIndex(arr: any[]): number {
  if (arr.length <= 1) return 0
  return randomNumber(0, arr.length - 1, true)
}

export function computeRandomValue<T>(value: ValueOrRandom<T>): T {
  if (Array.isArray(value)) {
    return value[randomArrayIndex(value)]
  } else if (isValueRange(value)) {
    const min = Number(value.from)
    const max = Number(value.to)
    return randomNumber(min, max) as unknown as T
  } else {
    return value
  }
}

export function computeRandomChannels(
  channels: RandomChannels
): Dictionary<number> {
  const computedChannels: Dictionary<number> = {}

  Object.entries(channels).forEach(
    ([channel, value]) =>
      (computedChannels[channel] = computeRandomValue(value))
  )

  return computedChannels
}

export function filterArrayRandomly<T>(arr: T[], keep: number): T[] {
  const keepElements = Math.round(arr.length * keep)
  if (keepElements === 0) return []
  if (keepElements === arr.length) return arr

  const newArr = [...arr]

  while (newArr.length > keepElements) {
    newArr.splice(randomArrayIndex(newArr), 1)
  }

  return newArr
}
