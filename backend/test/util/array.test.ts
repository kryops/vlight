import { addToMutableArray, removeFromMutableArray } from '../../src/util/array'

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
})
