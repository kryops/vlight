import { mapToDictionary } from '../../src/util/map'

describe('util/map', () => {
  it('mapToDictionary', () => {
    const entry1 = { foo: 'bar' }
    const entry2 = { foo: 'baz' }
    const map = new Map([[1, entry1], [2, entry2]])
    expect(mapToDictionary(map)).toEqual({
      1: entry1,
      2: entry2,
    })
  })
})
