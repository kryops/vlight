import { css } from '@linaria/core'
import {
  AriaAttributes,
  PointerEvent,
  TouchEvent,
  useRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react'

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

export interface TouchableProps extends AriaAttributes {
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

  style?: CSSProperties

  children?: ReactNode

  ref?: Ref<HTMLDivElement>

  role?: string
}

/**
 * Container element that normalizes mouse, touch and pointer events.
 */
export const Touchable = ({
  onTouch,
  onDown,
  onUp,
  onMove,
  className,
  style,
  children,
  title,
  preventScroll,
  ref,
  ...aria
}: TouchableProps) => {
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

  // A cancelled pointer (e.g. by a system gesture) never receives an up event,
  // so we treat it as one to not leave the control in its active state
  const pointerUpOrCancelListener = pointerEventSupport
    ? (e: PointerEvent<HTMLDivElement>) => {
        if (upListener) {
          upListener(e)
        }
        pointerActive.current = false
      }
    : undefined

  return (
    <div
      className={cx(preventScroll && preventScrollStyle, className)}
      style={style}
      title={title}
      ref={ref}
      {...aria}
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
      onPointerUp={pointerUpOrCancelListener}
      onPointerCancel={pointerUpOrCancelListener}
      onPointerMove={pointerEventSupport ? moveListener : undefined}
      onTouchStart={!pointerEventSupport ? downListener : undefined}
      onTouchEnd={!pointerEventSupport ? upListener : undefined}
      onTouchCancel={!pointerEventSupport ? upListener : undefined}
      onTouchMove={!pointerEventSupport ? moveListener : undefined}
      onContextMenu={event => event.preventDefault()}
    >
      {children}
    </div>
  )
}
