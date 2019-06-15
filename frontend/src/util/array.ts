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

export function createRangeArray(min: number, max: number): number[] {
  const arr: number[] = []
  for (let i = min; i <= max; i++) {
    arr.push(i)
  }
  return arr
}

export function flat<T>(arrays: T[][]): T[] {
  return arrays.reduce((acc, cur) => acc.concat(cur), [])
}
