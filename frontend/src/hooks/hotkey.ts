import { createRangeArray } from '@vlight/utils'
import { createContext, useContext, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

/** Context to indicate whether keyboard hotkeys should be active. */
export const HotkeyContext = createContext(false)

/**
 * Context to indicate whether user-configured page-wide hotkeys
 * (e.g. of programmable buttons) should be active.
 *
 * Pages with number hotkeys disable them while a widget is selected,
 * so that they don't conflict with the widget's own hotkeys.
 */
export const PageHotkeyContext = createContext(true)

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

  const args = useMemo(
    () => ({
      enabled,
      keydown: true,
      keyup,
    }),
    [enabled, keyup]
  )

  // without explicit dependencies, useHotkeys always calls the latest callback
  useHotkeys(hotkey ?? emptyArray, event => callback?.(event), args)

  return enabled
}

const numberHotkeys = [...createRangeArray(1, 9).map(String), '0', 'Shift+0']

/**
 * React Hook to select an item in a list with the number keys:
 * - 1-9 select a number 0-8 directly
 * - 0 increments the number
 * - Shift+0 decrements the number
 * - Pressing the currently active key again resets the item
 *
 * Changing the `resetKey` (e.g. a search query) resets the active item.
 */
export function useNumberHotkey(
  itemCount: number,
  resetKey?: unknown
): number | null {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setActiveIndex(null)
  }

  useHotkeys(
    numberHotkeys,
    (_event, hotkey) => {
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
  return activeIndex !== null && activeIndex < itemCount ? activeIndex : null
}

export function getHotkeyLabel(index: number): string | undefined {
  if (index > 8) return undefined

  return String(index + 1)
}
