export function ensureBetween(value: number, min: number, max: number): number {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

export function roundToStep(value: number, step?: number) {
  return step ? Math.round(value / step) * step : value
}
