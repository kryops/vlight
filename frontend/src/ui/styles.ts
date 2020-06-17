import { mix } from 'polished'

export const baselinePx = 4
export const fontSizePx = 16

export function baseline(factor: number): string {
  return `${factor * baselinePx}px`
}

export const zNavigation = 10
export const zOverlay = 20

export const backgroundColor = '#000c15'
export const backgroundColorLight = '#fff'

const primaryColor = '#0084db'
const successColor = '#1ed246'
const errorColor = '#d21e1e'
const warnColor = '#eea300'
const textColor = '#ddd'
const iconColor = '#fff'

const textColorLight = '#000'

const colorShades = [1, 0.5, 0.2, 0.1, 0.05]

function colorLevelFactory(color: string) {
  return function colorLevel(level: number): string {
    return mix(colorShades[level] ?? 1, color, backgroundColor)
  }
}

export const primaryShade = colorLevelFactory(primaryColor)
export const successShade = colorLevelFactory(successColor)
export const errorShade = colorLevelFactory(errorColor)
export const warnShade = colorLevelFactory(warnColor)
export const textShade = colorLevelFactory(textColor)
export const iconShade = colorLevelFactory(iconColor)

export const textShadeLight = colorLevelFactory(textColorLight)
