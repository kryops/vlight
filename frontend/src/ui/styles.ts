import { mix } from 'polished'

export const baselinePx = 4
export const fontSizePx = 16

/**
 * Returns a size applying the given factor to a baseline size.
 */
export function baseline(factor = 1): string {
  return `${factor * baselinePx}px`
}

export const inputWidth = baseline(64)

// z-index levels

export const zNavigation = 10
export const zOverlay = 20
export const zCornerOverlay = 30

const backgroundColorVariable = '--bg'
export const backgroundColor = `var(${backgroundColorVariable})`

type ThemeColor =
  | 'background'
  | 'primary'
  | 'success'
  | 'error'
  | 'warn'
  | 'text'
  | 'icon'

const colors: { [key in ThemeColor]: string | [string, string] } = {
  // the first letter must be unique
  background: ['#000c15', '#fff'],
  primary: ['#096099', '#0a9afa'],
  success: '#1ed246',
  error: '#d21e1e',
  warn: '#eea300',
  text: ['#ddd', '#000'],
  icon: ['#eee', '#111'],
}

const colorShades = [1, 0.5, 0.25, 0.125, 0.075]

function getColor(name: ThemeColor, level: number, isLight = false): string {
  const color = Array.isArray(colors[name])
    ? colors[name][isLight ? 1 : 0]
    : (colors[name] as string)
  return mix(colorShades[level] ?? 1, color, colors.background[isLight ? 1 : 0])
}

function getCssVariableName(name: ThemeColor, level?: number) {
  return `--${name[0]}${level}`
}

/**
 * Returns the CSS strings for the CSS variable definitions
 * controlling all colors.
 */
export function getCssVariableDefinitions(isLight = false): string {
  return Object.keys(colors)
    .filter(key => key !== 'background')
    .flatMap(name =>
      colorShades.map(
        (_, level) =>
          `${getCssVariableName(name as ThemeColor, level)}: ${getColor(
            name as ThemeColor,
            level,
            isLight
          )};`
      )
    )
    .concat([
      `${backgroundColorVariable}: ${colors.background[isLight ? 1 : 0]};`,
    ])
    .join('\n')
}

function getCssVariable(name: ThemeColor, level?: number): string {
  return `var(${getCssVariableName(name, level)})`
}

function cssVariableFactory(name: ThemeColor) {
  return function colorLevel(level: number) {
    return getCssVariable(name, level)
  }
}

export const primaryShade = cssVariableFactory('primary')
export const successShade = cssVariableFactory('success')
export const errorShade = cssVariableFactory('error')
export const warnShade = cssVariableFactory('warn')
export const textShade = cssVariableFactory('text')
export const iconShade = cssVariableFactory('icon')
