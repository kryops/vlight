import {
  addToMutableArray,
  removeFromMutableArray,
  arrayRange,
  createRangeArray,
} from '../src/array'

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

  describe('createRangeArray', () => {
    it('creates a range array', () => {
      expect(createRangeArray(1, 4)).toEqual([1, 2, 3, 4])
      expect(createRangeArray(1, 1)).toEqual([1])
      expect(createRangeArray(1, 0)).toEqual([])
    })
  })
})
