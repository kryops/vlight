import { compareWithoutFunctions } from '../../src/util/react'

describe('util/react', () => {
  describe('compareWithoutFunctions', () => {
    it('returns false for different keys lengths', () => {
      const a = { foo: 'bar' }
      const b = { foo: 'bar', baz: 'baz' }
      expect(compareWithoutFunctions(a, b)).toBe(false)
    })
    it('returns false for different values', () => {
      const a = { foo: 'bar' }
      const b = { foo: 'baz' }
      expect(compareWithoutFunctions(a, b)).toBe(false)
    })
    it('returns false for different values with functions', () => {
      const a = {
        foo: 'bar',
        baz: () => {
          /* noop */
        },
      }
      const b = {
        foo: 'baz',
        baz: () => {
          /* noop */
        },
      }
      expect(compareWithoutFunctions(a, b)).toBe(false)
    })
    it('returns false for different keys', () => {
      const a = { foo: 'bar' }
      const b = { bar: 'bar' }
      expect(compareWithoutFunctions(a, b)).toBe(false)
    })
    it('returns true for identical values', () => {
      const a = { foo: 'bar' }
      const b = { foo: 'bar' }
      expect(compareWithoutFunctions(a, b)).toBe(true)
    })
    it('returns true for identical values plus functions', () => {
      const a = {
        foo: 'bar',
        baz: () => {
          /* noop */
        },
      }
      const b = {
        foo: 'bar',
        baz: () => {
          /* noop */
        },
      }
      expect(compareWithoutFunctions(a, b)).toBe(true)
    })
  })
})
