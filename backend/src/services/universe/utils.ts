import { universeSize } from '../config'

export function getUniverseIndex(channel: number): number {
  return channel - 1
}

export function getChannelFromUniverseIndex(index: number): number {
  return index + 1
}

export function assertValidChannel(channel: number): void {
  if (channel < 1 || channel > universeSize) {
    throw new Error(`invalid channel: ${channel}`)
  }
}
