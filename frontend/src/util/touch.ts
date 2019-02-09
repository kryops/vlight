import { RefObject } from 'react'

export interface NormalizedTouchEvent<T extends HTMLElement = HTMLElement> {
  type: string
  clientX: number
  clientY: number
  originalEvent: React.PointerEvent<T> | React.TouchEvent<T>
}

export function normalizeTouchEvent<T extends HTMLElement = HTMLElement>(
  e: React.PointerEvent<T> | React.TouchEvent<T>
): NormalizedTouchEvent<T> {
  if ((e as any).clientX) {
    const pointerEvent = e as React.PointerEvent<T>
    return {
      type: e.type,
      clientX: pointerEvent.clientX,
      clientY: pointerEvent.clientY,
      originalEvent: e,
    }
  }

  const touchEvent = e as React.TouchEvent<T>
  const touch = touchEvent.targetTouches.length
    ? touchEvent.targetTouches[0]
    : touchEvent.changedTouches[0]
  return {
    type: e.type,
    clientX: touch.clientX,
    clientY: touch.clientY,
    originalEvent: e,
  }
}

export interface OffsetCoordinates {
  x: number
  y: number
  xFraction: number
  yFraction: number
  width: number
  height: number
}

export function getTouchEventOffset(
  e: NormalizedTouchEvent<HTMLElement>,
  ref: RefObject<HTMLElement>
): OffsetCoordinates | null {
  if (!ref.current) {
    return null
  }

  const elPosition = ref.current.getBoundingClientRect()

  const { width, height } = elPosition
  const x = e.clientX - elPosition.left
  const y = e.clientY - elPosition.top
  const xFraction = x / width
  const yFraction = y / height

  return { x, y, xFraction, yFraction, width, height }
}
