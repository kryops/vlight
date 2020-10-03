export function ensureBetween(value: number, min: number, max: number): number {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

export function roundToStep(value: number, step?: number): number {
  return step ? Math.round(value / step) * step : value
}

export function getFraction(value: number, min: number, max: number): number {
  if (min === max) return 0
  const fraction = (value - min) / (max - min)
  if (fraction === -0) return 0
  return fraction
}

export function getValueForFraction(
  fraction: number,
  min: number,
  max: number
): number {
  const value = min + fraction * (max - min)
  if (value === -0) return 0
  return value
}
