export function removeFromMutableArray<T>(arr: T[], el: T) {
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

export function addToMutableArray<T>(arr: T[], el: T) {
  if (arr.includes(el)) {
    return
  }
  arr.push(el)
}

export function arrayRange<T>(
  min: number,
  max: number,
  cb: (index: number) => T
): T[] {
  const entries: T[] = []
  for (let index = min; index <= max; index++) {
    entries.push(cb(index))
  }

  return entries
}

export function arrayUnique<T>(arr: T[]): T[] {
  return arr.filter((el, index) => arr.indexOf(el) === index)
}

export const boolFilter: <T>(
  x: T | null | undefined | false | '' | 0
) => x is T = Boolean as any
