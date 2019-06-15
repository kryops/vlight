import cx from 'classnames'
import { css } from 'linaria'
import React, { memo, useRef } from 'react'

import { getFractionWithMargin, getTouchEventOffset } from '../../../util/touch'
import { Touchable } from '../../helpers/touchable'
import { baselinePx, iconShade, primaryShade } from '../../styles'
import { memoInProduction } from '../../../util/development'

import { ColorPickerBackground } from './background'
import {
  ColorPickerColor,
  ColorPickerPosition,
  colorPresets,
  colorToCss,
  colorToPosition,
  isSameColor,
  positionToColor,
} from './util'

const colorPickerWidth = baselinePx * 54
const positionMarkerSize = baselinePx * 6
const colorPresetMargin = 2

const container = css`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  width: ${colorPickerWidth}px;
  margin: ${baselinePx * 1.5}px;
  flex: 0 0 auto;
`

const colorPicker = css`
  position: relative;
  margin-bottom: 2px;
  height: 0; // to make the SVG not scale beyond the max-height
  flex-grow: 1;
`

const markerContainer = css`
  position: absolute;
  top: ${positionMarkerSize / 2}px;
  right: ${positionMarkerSize / 2}px;
  bottom: ${positionMarkerSize / 2}px;
  left: ${positionMarkerSize / 2}px;
`

const positionMarker = css`
  position: absolute;
  width: ${positionMarkerSize - 4}px;
  height: ${positionMarkerSize - 4}px;
  margin: -${positionMarkerSize / 2}px;
  border: 2px solid ${primaryShade(0)};
`

const colorPresetBar = css`
  display: flex;
  height: ${baselinePx * 8}px;
  overflow: hidden;
`

const colorPreset = css`
  flex: 1 1 auto;
  margin-left: ${colorPresetMargin}px;
  padding: 2px;

  &:first-child {
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
  const positionFromColor = colorToPosition(currentColor)

  const lastPositionRef = useRef<ColorPickerPosition>(positionFromColor)

  const position =
    lastPositionRef.current &&
    isSameColor(currentColor, positionToColor(lastPositionRef.current))
      ? lastPositionRef.current
      : positionFromColor

  return (
    <div className={container}>
      <Touchable
        className={colorPicker}
        ref={touchRef}
        onTouch={event => {
          const offset = getTouchEventOffset(event, touchRef)
          if (!offset) {
            return
          }
          const { x, y } = getFractionWithMargin(offset, 4)
          const newPosition = { x, y }
          const newColor = positionToColor(newPosition)
          if (
            lastPositionRef.current &&
            isSameColor(positionToColor(lastPositionRef.current), newColor)
          ) {
            return
          }
          lastPositionRef.current = newPosition
          onChange(newColor)
        }}
      >
        <ColorPickerBackground />
        <div className={markerContainer}>
          <div
            className={positionMarker}
            style={{
              top: `${position.y * 100}%`,
              left: `${position.x * 100}%`,
              background: colorToCss(currentColor),
            }}
          />
        </div>
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

export const ColorPicker = memoInProduction(_ColorPicker)
