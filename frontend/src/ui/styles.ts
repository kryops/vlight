import { mix } from 'polished'

// !!! SCSS references in _variables.scss

export const baselinePx = 4
export const fontSizePx = 16

export const zNavigation = 10

export const backgroundColor = '#000c15'

const primaryColor = '#0084db'
const successColor = '#1ed246'
const errorColor = '#d21e1e'
const warnColor = '#eea300'
const textColor = '#ddd'
const iconColor = '#fff'

const colorLevels = [1, 0.5, 0.2, 0.1, 0.05]

function colorLevelFactory(color: string) {
  return function colorLevel(level: number): string {
    return mix(colorLevels[level] || 1, color, backgroundColor)
  }
}

export const primaryShade = colorLevelFactory(primaryColor)
export const successShade = colorLevelFactory(successColor)
export const errorShade = colorLevelFactory(errorColor)
export const warnShade = colorLevelFactory(warnColor)
export const textShade = colorLevelFactory(textColor)
export const iconShade = colorLevelFactory(iconColor)
