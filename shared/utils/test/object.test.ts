import { describe, expect, it } from 'vite-plus/test'

import {
  getLeafPaths,
  getPathValue,
  mergeObjects,
  removePathValue,
  setPathValue,
} from '../src'

describe('mergeObjects', () => {
  it('deep-merges objects', () => {
    expect(
      mergeObjects(
        {
          foo: 'bar',
          bar: 'baz',
          arr: ['ay'],
          nested: {
            ob: 'ject',
            ag: {
              ai: 'n',
            },
          },
        },
        {
          foo: 'baz',
          arr: ['ayy'],
          nested: {
            ag: {
              new: 'prop2',
            },
          },
          new: 'prop',
        }
      )
    ).toEqual({
      foo: 'baz',
      bar: 'baz',
      arr: ['ayy'],
      nested: {
        ob: 'ject',
        ag: {
          ai: 'n',
          new: 'prop2',
        },
      },
      new: 'prop',
    })
  })
})

describe('object paths', () => {
  it('getLeafPaths', () => {
    expect(
      getLeafPaths({ on: true, channels: { r: 1, g: 2 }, list: [1], empty: {} })
    ).toEqual([['on'], ['channels', 'r'], ['channels', 'g'], ['list']])
  })

  it('getPathValue', () => {
    const obj = { a: { b: 1 }, c: [1] }
    expect(getPathValue(obj, ['a', 'b'])).toBe(1)
    expect(getPathValue(obj, ['c'])).toEqual([1])
    expect(getPathValue(obj, ['a', 'x', 'y'])).toBeUndefined()
    expect(getPathValue(undefined, ['a'])).toBeUndefined()
  })

  it('setPathValue', () => {
    const obj = { a: { b: 1, c: 2 } }
    expect(setPathValue(obj, ['a', 'b'], 5)).toEqual({ a: { b: 5, c: 2 } })
    expect(setPathValue(obj, ['a', 'b'], undefined)).toEqual({ a: { c: 2 } })
    expect(setPathValue(obj, ['x', 'y'], 1)).toEqual({
      a: { b: 1, c: 2 },
      x: { y: 1 },
    })
    expect(obj).toEqual({ a: { b: 1, c: 2 } })
  })

  it('removePathValue', () => {
    const obj = { a: { b: 1 }, c: 2 }
    expect(removePathValue(obj, ['a', 'b'])).toEqual({ c: 2 })
    expect(removePathValue(obj, ['c'])).toEqual({ a: { b: 1 } })
    expect(removePathValue(obj, ['x'])).toBe(obj)
    expect(obj).toEqual({ a: { b: 1 }, c: 2 })
  })
})
