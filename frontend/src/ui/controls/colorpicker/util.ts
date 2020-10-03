import { Dictionary, FixtureState } from '@vlight/types'
import { ensureBetween } from '@vlight/utils'
import { ChannelMapping } from '@vlight/controls'

export interface ColorPickerColor {
  r: number
  g: number
  b: number
}

export interface ColorPickerPosition {
  x: number
  y: number
}

const black = { r: 0, g: 0, b: 0 }

export const colorPickerColors: string[] = [
  ChannelMapping.red,
  ChannelMapping.green,
  ChannelMapping.blue,
]

export const colorPresets: ColorPickerColor[] = [
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 0, b: 0 },
  { r: 255, g: 255, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 255, b: 255 },
  { r: 0, g: 0, b: 255 },
  { r: 255, g: 0, b: 255 },
  { r: 255, g: 255, b: 255 },
]

export function colorPickerPossible(mapping: string[]): boolean {
  return mapping.every(c => colorPickerColors.includes(c))
}

export function isSameColor(
  c1: ColorPickerColor,
  c2: ColorPickerColor
): boolean {
  return (colorPickerColors as (keyof ColorPickerColor)[]).every(
    c => (c1[c] ?? 0) === (c2[c] ?? 0)
  )
}

export function colorToCss({ r, b, g }: ColorPickerColor): string {
  return `rgb(${r}, ${g}, ${b})`
}

function mapColor(
  color: ColorPickerColor,
  fn: (c: number) => number
): ColorPickerColor {
  return { r: fn(color.r), g: fn(color.g), b: fn(color.b) }
}

function normalizeColor(color: ColorPickerColor): ColorPickerColor {
  const maxValue = Math.max(...colorToArray(color))
  if (maxValue === 0) {
    return black
  }
  const factor = 255 / maxValue
  return mapColor(color, c => Math.round(c * factor))
}

function colorToArray(obj: ColorPickerColor | Dictionary<number>) {
  return (colorPickerColors as (keyof ColorPickerColor)[]).map(c => obj[c] ?? 0)
}

export function fixtureStateToColor(
  fixtureState: FixtureState
): ColorPickerColor {
  const { r, g, b } = fixtureState.channels
  return normalizeColor({
    r: r ?? 0,
    g: g ?? 0,
    b: b ?? 0,
  })
}

function xFractionToColor(x: number): ColorPickerColor {
  let r = 0
  let g = 0
  let b = 0

  if (x <= 1 / 6) {
    r = 255
    g = Math.round(x * 6 * 255)
  } else if (x <= 2 / 6) {
    g = 255
    r = Math.round(255 - (x - 1 / 6) * 6 * 255)
  } else if (x <= 3 / 6) {
    g = 255
    b = Math.round((x - 2 / 6) * 6 * 255)
  } else if (x <= 4 / 6) {
    b = 255
    g = Math.round(255 - (x - 3 / 6) * 6 * 255)
  } else if (x <= 5 / 6) {
    b = 255
    r = Math.round((x - 4 / 6) * 6 * 255)
  } else {
    r = 255
    // never let it fall to 0 so the marker does not want to jump to the left
    // (at least in the bottom half of the picker)
    b = ensureBetween(Math.round(255 - (x - 5 / 6) * 6 * 255), 1, 255)
  }

  return { r, g, b }
}

function colorToXFraction(color: ColorPickerColor): number {
  const { r, g, b } = color
  if (r === 255) {
    if (g === 0 && b === 0) {
      return 0
    }
    return g !== 0 ? g / 255 / 6 : 1 - b / 255 / 6
  }
  if (g === 255) {
    return r !== 0 ? 2 / 6 - r / 255 / 6 : 2 / 6 + b / 255 / 6
  }
  if (b === 255) {
    return g !== 0 ? 4 / 6 - g / 255 / 6 : 4 / 6 + r / 255 / 6
  }
  return 0
}

export function positionToColor(
  position: ColorPickerPosition | null
): ColorPickerColor {
  if (position === null) return black

  const { x, y } = position

  const lightness = Math.round(ensureBetween(1 - y, 0, 1) * 255)

  const rawColor = xFractionToColor(x)

  const [r, g, b] = colorToArray(rawColor).map(
    c => lightness + Math.round((255 - lightness) * (c / 255))
  )
  return {
    r,
    g,
    b,
  }
}

export function colorToPosition(
  color: ColorPickerColor
): ColorPickerPosition | null {
  const colorArray = colorToArray(color)
  if (Math.max(...colorArray) === 0) return null

  const lightness = Math.min(...colorArray)
  const y = 1 - lightness / 255
  if (lightness === 255) {
    return { x: 0, y: 0 }
  }
  const normalizedColor = normalizeColor(mapColor(color, c => c - lightness))
  const x = colorToXFraction(normalizedColor)
  return { x, y }
}
