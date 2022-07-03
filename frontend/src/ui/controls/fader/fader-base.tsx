import { css } from '@linaria/core'
import { ReactNode, useRef } from 'react'
import { ensureBetween } from '@vlight/utils'

import { Touchable } from '../../components/touchable'
import { getTouchEventOffset } from '../../../util/touch'
import { cx } from '../../../util/styles'
import { baseline, iconShade, baselinePx } from '../../styles'

export const faderWidth = baselinePx * 12
export const faderHeight = baselinePx * 60
export const trackWidth = faderWidth / 3
export const trackHeight = faderHeight - faderWidth
export const trackMargin = (faderWidth - trackWidth) / 2
export const trackOffset = (faderHeight - trackHeight) / 2

const faderBase = css`
  position: relative;
  flex: 0 0 auto;
  width: ${faderWidth}px;
  height: ${faderHeight}px;
  margin: ${baseline(1.5)};
`

const colorPickerFader = css`
  margin-left: ${baseline(3.5)};
  margin-right: ${baseline(3.5)};
`

const track = css`
  position: absolute;
  top: ${trackOffset}px;
  left: ${trackMargin}px;
  background: ${iconShade(3)};
  width: ${trackWidth}px;
  height: ${trackHeight}px;
`

const cornerLabelStyle = css`
  position: absolute;
  font-size: 0.65rem;
  z-index: 3;
  top: ${baseline(0.5)};
  left: ${baseline(1)};
`

const cornerLabel_overflow = css`
  min-width: ${baseline(32)};
`

export interface FaderBaseProps {
  /**
   * Label to display in the top-left corner.
   *
   * The display of long labels can be controlled via {@link cornerLabelOverflow}.
   */
  cornerLabel?: string

  /**
   * Controls whether the corner label can overflow the fader container.
   *
   * Defaults to `false`.
   */
  cornerLabelOverflow?: boolean

  /**
   * Controls whether the fader is part of a color picker.
   *
   * Changes the margins so the content will not jump when switching between
   * the color picker and the faders.
   *
   * Defaults to `false`.
   */
  colorPicker?: boolean

  className?: string

  /**
   * Touch handler that is called with the touch position as fraction from 0-1.
   */
  onTouch?: (fraction: number) => void

  /**
   * Handler to be called when the mouse/finger is lifted.
   */
  onUp?: () => void

  children?: ReactNode
}

/**
 * Base component for a fader without a button.
 *
 * Displays
 * - the track
 * - an optional corner label
 */
export function FaderBase({
  cornerLabel,
  cornerLabelOverflow = false,
  colorPicker = false,
  className,
  onTouch,
  onUp,
  children,
}: FaderBaseProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <Touchable
      className={cx(faderBase, colorPicker && colorPickerFader, className)}
      onTouch={event => {
        const offset = getTouchEventOffset(event, trackRef)
        if (!offset) {
          return
        }
        const fraction = ensureBetween(1 - offset.yFraction, 0, 1)
        onTouch?.(fraction)
      }}
      onUp={onUp}
      preventScroll
    >
      <div className={track} ref={trackRef} />
      {children}
      {cornerLabel && (
        <div
          className={cx(
            cornerLabelStyle,
            cornerLabelOverflow && cornerLabel_overflow
          )}
        >
          {cornerLabel}
        </div>
      )}
    </Touchable>
  )
}
