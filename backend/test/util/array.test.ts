import {
  addToMutableArray,
  removeFromMutableArray,
  arrayRange,
  arrayUnique,
  boolFilter,
} from '../../src/util/array'

describe('util/array', () => {
  it('removeFromMutableArray', () => {
    const arr = [1, 2, 3, 4, 5, 6]
    removeFromMutableArray(arr, 1)
    expect(arr).toEqual([2, 3, 4, 5, 6])
    removeFromMutableArray(arr, 6)
    expect(arr).toEqual([2, 3, 4, 5])
    removeFromMutableArray(arr, 3)
    expect(arr).toEqual([2, 4, 5])
    removeFromMutableArray(arr, 6)
    expect(arr).toEqual([2, 4, 5])
  })

  it('addToMutableArray', () => {
    const arr = [1, 2, 3]
    addToMutableArray(arr, 4)
    expect(arr).toEqual([1, 2, 3, 4])
    addToMutableArray(arr, 4)
    expect(arr).toEqual([1, 2, 3, 4])
    addToMutableArray(arr, 2)
    expect(arr).toEqual([1, 2, 3, 4])
  })

  it('arrayRange', () => {
    expect(arrayRange(1, 3, x => x + 1)).toEqual([2, 3, 4])
  })

  it('arrayUnique', () => {
    expect(arrayUnique([1, 2, 3, 2, 3, 4, 5, 3])).toEqual([1, 2, 3, 4, 5])
  })

  it('boolFilter', () => {
    expect(boolFilter(true)).toBe(true)
    expect(boolFilter('x')).toBe(true)
    expect(boolFilter(1)).toBe(true)
    expect(boolFilter(false)).toBe(false)
    expect(boolFilter(undefined)).toBe(false)
    expect(boolFilter(null)).toBe(false)
    expect(boolFilter('')).toBe(false)
    expect(boolFilter(0)).toBe(false)
  })
})
