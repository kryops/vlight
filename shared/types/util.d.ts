/** A range of values. */
export interface ValueRange<T> {
  from: T
  to: T
}

/**
 * A value, or a definition to pick a random value from:
 * - A simple value is just applied as-is
 * - For an array, a random element is chosen
 * - For a range, a random value within the range is chosen
 */
export type ValueOrRandom<T> = T | T[] | ValueRange<T>
