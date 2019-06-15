export function isTruthy<T>(x: T | undefined | null | false | ''): x is T {
  return !!x
}

export function isUnique<T>(el: T, index: number, arr: T[]) {
  return arr.indexOf(el) === index
}
