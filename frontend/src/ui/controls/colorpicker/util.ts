import { Dictionary, FixtureState } from '@vlight/entities'

import { ChannelMapping } from '../../../api/enums'
import { ensureBetween } from '../../../util/number'

export interface ColorPickerColor {
  r: number
  g: number
  b: number
}

export const colorPickerColors: string[] = [
  ChannelMapping.red,
  ChannelMapping.green,
  ChannelMapping.blue,
]

export const colorPresets: ColorPickerColor[] = [
  { r: 255, g: 0, b: 0 },
  { r: 255, g: 255, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 255, b: 255 },
  { r: 0, g: 0, b: 255 },
  { r: 255, g: 0, b: 255 },
  { r: 255, g: 255, b: 255 },
]

export function colorPickerPossible(mapping: string[]) {
  return mapping.every(c => colorPickerColors.includes(c))
}

export function isSameColor(c1: ColorPickerColor, c2: ColorPickerColor) {
  return (colorPickerColors as Array<keyof ColorPickerColor>).every(
    c => (c1[c] || 0) === (c2[c] || 0)
  )
}

export function colorToCss({ r, b, g }: ColorPickerColor): string {
  return `rgb(${r}, ${g}, ${b})`
}

function normalizeColors(colors: number[]) {
  const maxValue = Math.max(...colors)
  if (maxValue === 0) {
    return colors.map(_ => 255)
  }
  const factor = 255 / maxValue
  return colors.map(c => Math.round(c * factor))
}

function colorObjectToArray(obj: ColorPickerColor | Dictionary<number>) {
  return (colorPickerColors as Array<keyof ColorPickerColor>).map(
    c => obj[c] || 0
  )
}

export function fixtureStateToColor(
  fixtureState: FixtureState
): ColorPickerColor {
  const [r, g, b] = normalizeColors(colorObjectToArray(fixtureState.channels))
  return {
    r,
    g,
    b,
  }
}

function getSingleColorFromXFraction(x: number, colorOffset: number): number {
  if (x <= colorOffset || x >= colorOffset + 2 / 3) {
    return 0
  }
  if (x >= colorOffset + 1 / 6 && x <= colorOffset + 1 / 2) {
    return 255
  }
  if (x < colorOffset + 1 / 6) {
    return (x - colorOffset) * 6 * 255
  }
  return 255 - (x - colorOffset - 1 / 2) * 6 * 255
}

export function colorPickerFractionToColor(
  x: number,
  y: number
): ColorPickerColor {
  const lightness = Math.round(ensureBetween(1 - y, 0, 1) * 255)

  const [r, g, b] = normalizeColors([
    getSingleColorFromXFraction(x, -1 / 3) +
      getSingleColorFromXFraction(x, 2 / 3),
    getSingleColorFromXFraction(x, 0),
    getSingleColorFromXFraction(x, 1 / 3),
  ]).map(c => lightness + Math.round((255 - lightness) * (c / 255)))
  return {
    r,
    g,
    b,
  }
}

export function getPositionFromColor(
  color: ColorPickerColor
): { x: number; y: number } | null {
  const originalColors = colorObjectToArray(color)
  const lightness = Math.min(...originalColors)
  const y = 1 - lightness / 255
  if (lightness === 255) {
    return { x: 0, y: 0 }
  }
  const [r, g, b] = normalizeColors(originalColors.map(c => c - lightness))
  let x = 0
  if (r === 255) {
    if (g) {
      x = g / 255 / 6
    } else if (b) {
      x = 1 - b / 255 / 6
    }
  } else if (g === 255) {
    // tslint:disable-next-line:prefer-conditional-expression
    if (r) {
      x = 2 / 6 - r / 255 / 6
    } else {
      x = 2 / 6 + b / 255 / 6
    }
  } else if (b === 255) {
    // tslint:disable-next-line:prefer-conditional-expression
    if (g) {
      x = 4 / 6 - g / 255 / 6
    } else {
      x = 4 / 6 + r / 255 / 6
    }
  }
  return { x, y }
}
