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
  max: number,
  quadraticScale = 1
): number {
  if (min === max) return 0
  const fraction = Math.pow((value - min) / (max - min), 1 / quadraticScale)
  if (Object.is(fraction, -0)) return 0
  return fraction
}

/**
 * Returns the value that lies at the given fraction between the given boundaries.
 */
export function fractionToValue(
  fraction: number,
  min: number,
  max: number,
  quadraticScale = 1
): number {
  const value = min + Math.pow(fraction, quadraticScale) * (max - min)
  if (Object.is(value, -0)) return 0
  return value
}

/**
 * Returns the average value of the given numbers.
 */
export function average(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}

/**
 * Overflows numbers within the given boundaries.
 */
export function overflowBetween(value: number, min: number, max: number) {
  const diff = max - min
  let newValue = value

  while (newValue < min) {
    newValue += diff
  }
  while (newValue > max) {
    newValue -= diff
  }

  return newValue
}
