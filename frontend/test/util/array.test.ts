import { createRangeArray, removeFromMutableArray } from '../../src/util/array'

describe('util/array', () => {
  describe('removeFromMutableArray', () => {
    it('removes entries from an array', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      // start entry
      removeFromMutableArray(arr, 1)
      expect(arr).toEqual([2, 3, 4, 5, 6])
      // end entry
      removeFromMutableArray(arr, 6)
      expect(arr).toEqual([2, 3, 4, 5])
      // middle entry
      removeFromMutableArray(arr, 3)
      expect(arr).toEqual([2, 4, 5])
      // non-existent
      removeFromMutableArray(arr, 6)
      expect(arr).toEqual([2, 4, 5])
    })
  })

  describe('createRangeArray', () => {
    it('creates a range array', () => {
      expect(createRangeArray(1, 4)).toEqual([1, 2, 3, 4])
      expect(createRangeArray(1, 1)).toEqual([1])
      expect(createRangeArray(1, 0)).toEqual([])
    })
  })
})
