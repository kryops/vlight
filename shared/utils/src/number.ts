/**
 * Returns the given value, or one of the given boundaries if it is outside of them.
 */
export function ensureBetween(value: number, min: number, max: number): number {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

/**
 * Rounds the given value according to the given step.
 */
export function roundToStep(value: number, step?: number): number {
  return step ? Math.round(value / step) * step : value
}

/**
 * Returns the fraction that the value is between the given boundaries.
 * May return something other than 0-1 if the value is outside of the boundaries.
 */
export function valueToFraction(
  value: number,
  min: number,
  max: number
): number {
  if (min === max) return 0
  const fraction = (value - min) / (max - min)
  if (fraction === -0) return 0
  return fraction
}

/**
 * Returns the value that lies at the given fraction between the given boundaries.
 */
export function fractionToValue(
  fraction: number,
  min: number,
  max: number
): number {
  const value = min + fraction * (max - min)
  if (value === -0) return 0
  return value
}

/**
 * Returns the average value of the given numbers.
 */
export function average(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}
