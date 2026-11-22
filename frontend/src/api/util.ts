/**
 * Converts a channel number (1-based) to a DMX universe index (0-based).
 */
export function getUniverseIndex(channel: number): number {
  return channel - 1
}

/**
 * Returns whether the values of the given channel range (1-based, inclusive)
 * are equal in both universes.
 */
export function isChannelRangeEqual(
  a: number[] | undefined,
  b: number[] | undefined,
  from: number,
  to: number
): boolean {
  if (a === b) return true
  if (!a || !b) return false
  for (
    let index = getUniverseIndex(from);
    index <= getUniverseIndex(to);
    index++
  ) {
    if (a[index] !== b[index]) return false
  }
  return true
}
