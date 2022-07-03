import { css } from '@linaria/core'
import { forwardRef, PointerEvent, TouchEvent, useRef } from 'react'

import { NormalizedTouchEvent, normalizeTouchEvent } from '../../util/touch'
import { cx } from '../../util/styles'

const pointerEventSupport = 'PointerEvent' in window

const preventScrollStyle = css`
  touch-action: none;
`

export type TouchEventListener = (
  e: NormalizedTouchEvent<HTMLDivElement>
) => void
export type RawTouchEventListener = (
  e: PointerEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>
) => void

export interface TouchableProps {
  /** Listener for all touch or mouse events. */
  onTouch?: TouchEventListener

  /** Listener for touch/mouse down events. */
  onDown?: TouchEventListener

  /** Listener for touch/mouse up events. */
  onUp?: TouchEventListener

  /** Listener for touch/mouse move events. */
  onMove?: TouchEventListener

  /**
   * Controls whether to prevent scrolling.
   *
   * Defaults to `false`.
   */
  preventScroll?: boolean

  /** Title to display as tooltip. */
  title?: string

  className?: string
}

/**
 * Container element that normalizes mouse, touch and pointer events.
 */
export const Touchable = forwardRef<
  HTMLDivElement,
  TouchableProps & { children: any }
>(
  (
    {
      onTouch,
      onDown,
      onUp,
      onMove,
      className,
      children,
      title,
      preventScroll,
    },
    ref
  ) => {
    const pointerActive = useRef(false)

    const downListener: RawTouchEventListener | undefined =
      (onTouch || onDown) &&
      (e => {
        const normalized = normalizeTouchEvent(e)
        if (onTouch) {
          onTouch(normalized)
        }
        if (onDown) {
          onDown(normalized)
        }
      })
    const upListener: RawTouchEventListener | undefined =
      (onTouch || onUp) &&
      (e => {
        if (pointerEventSupport && !pointerActive.current) {
          return
        }
        const normalized = normalizeTouchEvent(e)
        if (onTouch) {
          onTouch(normalized)
        }
        if (onUp) {
          onUp(normalized)
        }
      })
    const moveListener: RawTouchEventListener | undefined =
      (onTouch || onMove) &&
      (e => {
        const normalized = normalizeTouchEvent(e)
        if (pointerEventSupport && !pointerActive.current) {
          return
        }
        if (onTouch) {
          onTouch(normalized)
        }
        if (onMove) {
          onMove(normalized)
        }
      })

    return (
      <div
        className={cx(preventScroll && preventScrollStyle, className)}
        title={title}
        ref={ref}
        onPointerDown={
          pointerEventSupport
            ? e => {
                ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
                pointerActive.current = true
                if (downListener) {
                  downListener(e)
                }
              }
            : undefined
        }
        onPointerUp={
          pointerEventSupport
            ? e => {
                if (upListener) {
                  upListener(e)
                }
                pointerActive.current = false
              }
            : undefined
        }
        onPointerMove={pointerEventSupport ? moveListener : undefined}
        onTouchStart={!pointerEventSupport ? downListener : undefined}
        onTouchEnd={!pointerEventSupport ? upListener : undefined}
        onTouchMove={!pointerEventSupport ? moveListener : undefined}
        onContextMenu={event => event.preventDefault()}
      >
        {children}
      </div>
    )
  }
)
