/**
 * Converts a channel number (1-based) to a DMX universe index (0-based).
 */
export function getUniverseIndex(channel: number): number {
  return channel - 1
}
