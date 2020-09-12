const numberFormat = Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatNumber(num: number): string {
  return numberFormat.format(num)
}
