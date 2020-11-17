export interface ValueRange<T> {
  from: T
  to: T
}

export type ValueOrRandom<T> = T | T[] | ValueRange<T>
