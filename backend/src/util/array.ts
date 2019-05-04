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
  const entries: T[] = new Array(max - min + 1)

  for (let index = min; index <= max; index++) {
    entries.push(cb(index))
  }

  return entries
}
