import { universeSize } from '../config'

/**
 * Converts a channel number (1-512) to a universe index (0-511).
 */
export function getUniverseIndex(channel: number): number {
  return channel - 1
}

/**
 * Converts a a universe index (0-511) to a channel number (1-512).
 */
export function getChannelFromUniverseIndex(index: number): number {
  return index + 1
}

/**
 * Throws an error if the given channel number is out of the valid DMX range of 1-512.
 */
export function assertValidChannel(channel: number): void {
  if (channel < 1 || channel > universeSize) {
    throw new Error(`invalid channel: ${channel}`)
  }
}

/**
 * Applies the given master value to the given raw value.
 */
export function applyMasterValue(
  rawValue: number,
  masterValue: number
): number {
  if (masterValue === 255) return rawValue
  if (masterValue === 0 || rawValue === 0) return 0

  return Math.round((masterValue / 255) * rawValue)
}
