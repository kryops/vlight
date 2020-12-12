import { valueToFraction, fractionToValue } from '@vlight/utils'

export function interpolateGradientPositions(
  positions: Array<number | null | undefined>
): number[] {
  let lastPosition = 0
  let lastPositionIndex = 0

  let nextPosition = 100
  let nextPositionIndex = positions.length - 1

  function refreshNextPosition(entryIndex: number) {
    nextPositionIndex = positions.findIndex(
      (other, otherIndex) => otherIndex > entryIndex && other
    )
    if (nextPositionIndex === -1) nextPositionIndex = positions.length - 1
    nextPosition = positions[nextPositionIndex] ?? 100
  }

  refreshNextPosition(0)

  return positions.map((entry, entryIndex) => {
    if (entry && entry >= lastPosition) {
      lastPosition = entry
      lastPositionIndex = entryIndex
      return entry
    }
    if (entryIndex === 0) return 0
    if (entryIndex === positions.length - 1) return 100

    if (entryIndex > nextPositionIndex) refreshNextPosition(entryIndex)

    const positionFraction = valueToFraction(
      entryIndex,
      lastPositionIndex,
      nextPositionIndex
    )

    return fractionToValue(positionFraction, lastPosition, nextPosition)
  })
}
