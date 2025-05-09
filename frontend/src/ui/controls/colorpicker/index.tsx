import { css } from '@linaria/core'
import { useRef } from 'react'

import {
  getFractionWithMargin,
  getTouchEventOffset,
  NormalizedTouchEvent,
} from '../../../util/touch'
import { Touchable } from '../../components/touchable'
import { useDelayedState } from '../../../hooks/delayed-state'
import { baseline, iconShade, primaryShade, baselinePx } from '../../styles'
import { memoInProduction } from '../../../util/development'
import { cx } from '../../../util/styles'
import { useEvent } from '../../../hooks/performance'

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

const defaultHeight = css`
  height: ${baseline(48)};
`

export interface ColorPickerProps {
  /** Red color. Defaults to 0. */
  r?: number

  /** Green color. Defaults to 0. */
  g?: number

  /** Blue color. Defaults to 0. */
  b?: number

  onChange: (color: ColorPickerColor) => void

  /**
   * If set, a default height is applied to the color picker;
   * otherwise, it stretches to fill the available height.
   *
   * Defaults to `false`.
   */
  setDefaultHeight?: boolean

  className?: string
}

/**
 * RGB color picker component.
 *
 * Displays a 2D color gradient as well as color presets.
 */
export const ColorPicker = memoInProduction(
  ({
    r = 0,
    g = 0,
    b = 0,
    onChange,
    setDefaultHeight = false,
    className,
  }: ColorPickerProps) => {
    const [localColor, setLocalColor] =
      useDelayedState<ColorPickerColor | null>(null)
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

    const onTouch = useEvent(
      (event: NormalizedTouchEvent<HTMLDivElement>): void => {
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
      }
    )

    const onUp = useEvent(() => setLocalColor(null, true))

    return (
      <div
        className={cx(container, setDefaultHeight && defaultHeight, className)}
      >
        <Touchable
          className={colorPicker}
          ref={touchRef}
          onTouch={onTouch}
          onUp={onUp}
          preventScroll
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
