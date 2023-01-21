import { createRangeArray } from '@vlight/utils'
import { createContext, useContext, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useEvent } from './performance'

/** Context to indicate whether keyboard hotkeys should be active. */
export const HotkeyContext = createContext(false)

export interface UseHotKeyOptions {
  /**
   * Force-control whether the hotkey should be active.
   *
   * By default, this uses the {@link HotkeyContext}
   */
  forceActive?: boolean

  /**
   * Controls whether to listen to the keyup event in addition to the keydown event.
   */
  keyup?: boolean
}

const emptyArray: string[] = []

/**
 * React Hook to trigger a callback when pressing a key on the keyboard.
 */
export function useHotkey(
  hotkey: string | undefined,
  callback: ((event: KeyboardEvent) => void) | undefined,
  { forceActive, keyup }: UseHotKeyOptions = {}
): boolean {
  const active = useContext(HotkeyContext)

  const enabled = !!hotkey && !!callback && (forceActive ?? active)

  const eventHandler = useEvent((event: KeyboardEvent) => callback?.(event))

  const args = useMemo(
    () => ({
      enabled,
      keydown: true,
      keyup,
    }),
    [enabled, keyup]
  )

  useHotkeys(hotkey ?? emptyArray, eventHandler, args)

  return enabled
}

const numberHotkeys = [...createRangeArray(1, 9).map(String), '0', 'Shift+0']

/**
 * React Hook to select an item in a list with the number keys:
 * - 1-9 select a number 0-8 directly
 * - 0 increments the number
 * - Shift+0 decrements the number
 * - Pressing the currently active key again resets the item
 */
export function useNumberHotkey(itemCount: number): number | null {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useHotkeys(
    numberHotkeys,
    (_event, hotkey) => {
      console.log(hotkey.keys)
      const number = Number(hotkey.keys?.[0])
      const maxNumber = itemCount - 1

      if (number) {
        const index = number - 1
        setActiveIndex(oldIndex => (index === oldIndex ? null : index))
      } else if (number === 0) {
        const reverse = !!hotkey.shift
        setActiveIndex(oldIndex => {
          if (oldIndex === null) {
            return reverse ? maxNumber : 0
          }

          const newIndex = oldIndex + (reverse ? -1 : 1)
          if (newIndex === -1) return maxNumber
          if (newIndex > maxNumber) return 0
          return newIndex
        })
      }
    },
    [itemCount]
  )
  return activeIndex
}
