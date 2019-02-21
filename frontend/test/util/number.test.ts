import { ensureBetween, roundToStep } from '../../src/util/number'

describe('util/number', () => {
  describe('ensureBetween', () => {
    it('returns the value if it is between min and max', () => {
      expect(ensureBetween(0.5, 0, 1)).toBe(0.5)
      expect(ensureBetween(0, 0, 1)).toBe(0)
      expect(ensureBetween(1, 0, 1)).toBe(1)
      expect(ensureBetween(0, -1, 1)).toBe(0)
    })

    it('returns the min value', () => {
      expect(ensureBetween(-1, 0, 1)).toBe(0)
      expect(ensureBetween(-0.5, 0, 1)).toBe(0)
    })

    it('returns the max value', () => {
      expect(ensureBetween(2, 0, 1)).toBe(1)
      expect(ensureBetween(1.5, 0, 1)).toBe(1)
    })
  })

  describe('roundToStep', () => {
    it('should do nothing if step is not set', () => {
      expect(roundToStep(1)).toBe(1)
      expect(roundToStep(1.5)).toBe(1.5)
      expect(roundToStep(1.234)).toBe(1.234)
    })
    it('should round to a given step', () => {
      expect(roundToStep(3, 1)).toBe(3)
      expect(roundToStep(3.4, 1)).toBe(3)
      expect(roundToStep(3.5, 1)).toBe(4)
      expect(roundToStep(14, 5)).toBe(15)
      expect(roundToStep(15, 5)).toBe(15)
      expect(roundToStep(3.4, 0.1)).toBeCloseTo(3.4, 1)
      expect(roundToStep(3.41, 0.1)).toBeCloseTo(3.4, 1)
    })
  })
})
