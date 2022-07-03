const numberFormat = Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/**
 * Formats a number, rendering 0-2 decimal digits.
 */
export function formatNumber(num: number): string {
  return numberFormat.format(num)
}
