import cx from 'classnames'
import { css } from 'linaria'
import React, { memo, useRef } from 'react'

import { getFractionWithMargin, getTouchEventOffset } from '../../../util/touch'
import { Touchable } from '../../helpers/touchable'
import { baselinePx, iconShade } from '../../styles'

import { ColorPickerBackground } from './background'
import {
  ColorPickerColor,
  colorPickerFractionToColor,
  colorPresets,
  colorToCss,
  isSameColor,
} from './util'

const colorPickerWidth = baselinePx * 60
const colorPresetMarginPx = 2

const container = css`
  width: ${colorPickerWidth}px;
`

const colorPresetBar = css`
  display: flex;
  height: ${baselinePx * 8}px;
  overflow: hidden;
`

const colorPreset = css`
  flex: 1 1 auto;
  margin-left: ${colorPresetMarginPx}px;
  padding: 2px;

  $:first-child {
    margin-left: 0;
  }
`

const colorPresetActive = css`
  border: 2px solid ${iconShade(0)};
  padding: 0;
`

export interface Props {
  r?: number
  g?: number
  b?: number
  onChange: (color: ColorPickerColor) => void
}

const _ColorPicker: React.SFC<Props> = ({ r = 0, g = 0, b = 0, onChange }) => {
  const touchRef = useRef<HTMLDivElement>(null)
  const currentColor: ColorPickerColor = { r, g, b }
  const lastColorRef = useRef<ColorPickerColor>(currentColor)
  lastColorRef.current = currentColor

  // TODO display current color

  return (
    <div className={container}>
      <Touchable
        ref={touchRef}
        onTouch={event => {
          const offset = getTouchEventOffset(event, touchRef)
          if (!offset) {
            return
          }
          const { x, y } = getFractionWithMargin(offset, 4)
          const newColor = colorPickerFractionToColor(x, y)
          if (
            lastColorRef.current &&
            isSameColor(lastColorRef.current, newColor)
          ) {
            return
          }
          onChange(newColor)
        }}
      >
        <ColorPickerBackground />
      </Touchable>
      <div className={colorPresetBar}>
        {colorPresets.map((presetColor, index) => (
          <div
            key={index}
            className={cx(colorPreset, {
              [colorPresetActive]: isSameColor(presetColor, currentColor),
            })}
            style={{ background: colorToCss(presetColor) }}
            onClick={() => onChange(presetColor)}
          />
        ))}
      </div>
    </div>
  )
}

export const ColorPicker = memo(_ColorPicker)
