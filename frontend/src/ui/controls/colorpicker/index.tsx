import { css } from 'linaria'
import React, { useRef } from 'react'

import { getFractionWithMargin, getTouchEventOffset } from '../../../util/touch'
import { Touchable } from '../../components/touchable'
import { useDelayedState } from '../../../hooks/delayed-state'
import { useSettings } from '../../../hooks/settings'
import { baseline, iconShade, primaryShade, baselinePx } from '../../styles'
import { memoInProduction } from '../../../util/development'
import { cx } from '../../../util/styles'

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
  margin: ${baseline(1.5)};
  flex: 0 0 auto;
`

const colorPicker = css`
  position: relative;
  margin-bottom: 2px;
  /* to make the SVG not scale beyond the max-height */
  height: 0;
  flex-grow: 1;
`

const colorPicker_light = css`
  border: 1px solid ${iconShade(3, true)};
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
  height: ${baseline(8)};
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

export interface ColorPickerProps {
  r?: number
  g?: number
  b?: number
  onChange: (color: ColorPickerColor) => void
}

export const ColorPicker = memoInProduction(
  ({ r = 0, g = 0, b = 0, onChange }: ColorPickerProps) => {
    const { lightMode } = useSettings()
    const [
      localColor,
      setLocalColor,
    ] = useDelayedState<ColorPickerColor | null>(null)
    const touchRef = useRef<HTMLDivElement>(null)

    const currentColor: ColorPickerColor = localColor ?? { r, g, b }
    const positionFromColor = colorToPosition(currentColor)

    const lastPositionRef = useRef<ColorPickerPosition | null>(
      positionFromColor
    )

    const position =
      lastPositionRef.current &&
      isSameColor(currentColor, positionToColor(lastPositionRef.current))
        ? lastPositionRef.current
        : positionFromColor

    return (
      <div className={container}>
        <Touchable
          className={cx(colorPicker, lightMode && colorPicker_light)}
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
            setLocalColor(newColor)
            onChange(newColor)
          }}
          onUp={() => setLocalColor(null, true)}
        >
          <ColorPickerBackground />
          {position && (
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
          )}
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
)
