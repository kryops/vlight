import { useContext, useEffect, useEffectEvent } from 'react'

import { HotkeyContext } from './hotkey'

/** Keys to move a fader up and down while they are held, e.g. `q` and `a`. */
export interface FaderHotkeys {
  up: string
  down: string
}

/**
 * Conventional fader hotkeys: The up key is placed directly above the down key,
 * to be assigned to the faders of a widget from left to right.
 */
export const faderHotkeys: FaderHotkeys[] = [
  { up: 'q', down: 'a' },
  { up: 'w', down: 's' },
  { up: 'e', down: 'd' },
  { up: 'r', down: 'f' },
  { up: 't', down: 'g' },
  { up: 'u', down: 'j' },
]

/** Time in seconds to move a fader across its full range. */
const fullRangeSeconds = 3

/** Speed multiplier while Shift is held. */
const shiftSpeedFactor = 4

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

/**
 * React Hook to move a fader with the keyboard at a constant speed
 * as long as a key is held. Shift increases the speed.
 *
 * Keys are matched by their physical position (`event.code`), so that holding
 * Shift does not change them. Key presses with Ctrl, Alt or Meta are ignored.
 *
 * Matching key events are not propagated further, so that they take precedence
 * over other hotkeys (e.g. Shift+Q for navigation).
 *
 * Active according to the {@link HotkeyContext}.
 *
 * @param onMove called on every animation frame with the fraction (0-1) to move by
 * @param onStop called when the movement ends
 * @returns whether the hotkeys are active
 */
export function useFaderHotkeys(
  hotkeys: FaderHotkeys | undefined,
  onMove: (fractionDelta: number) => void,
  onStop: () => void
): boolean {
  const active = useContext(HotkeyContext)
  const enabled = !!hotkeys && active

  const upCode = hotkeys ? `Key${hotkeys.up.toUpperCase()}` : undefined
  const downCode = hotkeys ? `Key${hotkeys.down.toUpperCase()}` : undefined

  const move = useEffectEvent(onMove)
  const stop = useEffectEvent(onStop)

  useEffect(() => {
    if (!enabled || !upCode || !downCode) return

    /** Currently held directions, the last one wins. */
    let pressed: Array<1 | -1> = []
    let shift = false
    let frame: number | null = null
    let lastTime: number | null = null

    const tick = (time: number) => {
      const direction = pressed.at(-1)
      if (!direction) return
      if (lastTime !== null) {
        const seconds = Math.min((time - lastTime) / 1000, 0.1)
        const speed = (shift ? shiftSpeedFactor : 1) / fullRangeSeconds
        move(direction * speed * seconds)
      }
      lastTime = time
      frame = requestAnimationFrame(tick)
    }

    const stopMovement = () => {
      const wasMoving = pressed.length > 0
      pressed = []
      lastTime = null
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      if (wasMoving) stop()
    }

    const getDirection = (code: string) =>
      code === upCode ? 1 : code === downCode ? -1 : null

    const keydown = (event: KeyboardEvent) => {
      shift = event.shiftKey
      const direction = getDirection(event.code)
      if (!direction) return
      if (event.ctrlKey || event.altKey || event.metaKey) return
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (event.repeat || pressed.includes(direction)) return
      pressed.push(direction)
      frame ??= requestAnimationFrame(tick)
    }

    const keyup = (event: KeyboardEvent) => {
      shift = event.shiftKey
      const direction = getDirection(event.code)
      if (!direction || !pressed.includes(direction)) return
      event.stopImmediatePropagation()
      pressed = pressed.filter(it => it !== direction)
      if (!pressed.length) stopMovement()
    }

    const visibilityChange = () => {
      if (document.hidden) stopMovement()
    }

    // capture phase to run before other hotkey listeners
    window.addEventListener('keydown', keydown, true)
    window.addEventListener('keyup', keyup, true)
    window.addEventListener('blur', stopMovement)
    document.addEventListener('visibilitychange', visibilityChange)

    return () => {
      window.removeEventListener('keydown', keydown, true)
      window.removeEventListener('keyup', keyup, true)
      window.removeEventListener('blur', stopMovement)
      document.removeEventListener('visibilitychange', visibilityChange)
      stopMovement()
    }
  }, [enabled, upCode, downCode])

  return enabled
}
