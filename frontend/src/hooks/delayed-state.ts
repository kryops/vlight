import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * React Hook that allows setting a state that is only applied after a delay.
 *
 * Useful for components that want to switch to a local state during interaction.
 */
export function useDelayedState<T>(
  initialValue: T,
  ms = 300
): [T, (value: T, delay?: boolean) => void] {
  const timeoutRef = useRef<any>()
  const [state, setState] = useState(initialValue)

  // clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const setStateDelayed = useCallback(
    (value: T, delayed = false) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (delayed) {
        timeoutRef.current = setTimeout(() => setState(value), ms)
      } else {
        setState(value)
      }
    },
    [ms]
  )

  return [state, setStateDelayed]
}
