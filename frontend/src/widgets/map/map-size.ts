import { MapSettings } from '@vlight/types'
import { ensureBetween } from '@vlight/utils'

/**
 * CSS variable containing the aspect ratio (width / height) of the map.
 *
 * Set on the map widget, and can be used to size it in custom styles.
 */
export const mapRatioVariable = '--map-ratio'

/** Inset of the map's coordinate system within the widget, in percent. */
export const mapInsetPercent = 3

/** Returns a CSS width that fits the map into a square box of the given size. */
export function fitMapWidth(size: string): string {
  return `min(${size}, calc(${size} * var(${mapRatioVariable}, 1)))`
}

/**
 * Converts a position within the map widget (as fractions of its width and height)
 * to map coordinates, rounded to integers.
 */
export function getMapCoordinates(
  xFraction: number,
  yFraction: number,
  mapSize: MapSettings
): { x: number; y: number } {
  const inset = mapInsetPercent / 100
  const toMapFraction = (fraction: number) =>
    ensureBetween((fraction - inset) / (1 - 2 * inset), 0, 1)
  return {
    x: Math.round(toMapFraction(xFraction) * mapSize.width),
    y: Math.round(toMapFraction(yFraction) * mapSize.height),
  }
}
