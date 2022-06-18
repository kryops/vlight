import {
  FixtureChannels,
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

/**
 * Returns the lowest possible value from the given descriptor.
 */
export function lowestRandomValue<T extends number>(
  value: ValueOrRandom<T>
): T {
  if (isValueRange(value)) return value.from
  if (Array.isArray(value)) return Math.min(...value) as T
  return value
}

/**
 * Returns the highest possible value from the given descriptor.
 */
export function highestRandomValue<T extends number>(
  value: ValueOrRandom<T>
): T {
  if (isValueRange(value)) return value.to
  if (Array.isArray(value)) return Math.max(...value) as T
  return value
}

/**
 * Creates a random number within the given range, optionally rounding it.
 */
export function randomNumber(min = 0, max = 1, round = false): number {
  const value = min + Math.random() * (max - min)
  if (round) return Math.round(value)
  return value
}

/**
 * Returns a random index of the given array.
 */
export function randomArrayIndex(arr: any[]): number {
  if (arr.length <= 1) return 0
  return randomNumber(0, arr.length - 1, true)
}

/**
 * Returns a random value based on the given descriptor.
 */
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

/**
 * Returns actual channel values from the given random channel descriptors.
 */
export function computeRandomChannels(
  channels: RandomChannels
): FixtureChannels {
  const computedChannels: FixtureChannels = {}

  Object.entries(channels).forEach(
    ([channel, value]) =>
      (computedChannels[channel] = computeRandomValue(value))
  )

  return computedChannels
}

/**
 * Returns a copy of the given array that has elements randomly removed until
 * it has the desired length.
 *
 * @param keep - fraction between 0-1 of how many elements to keep in the array.
 */
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
