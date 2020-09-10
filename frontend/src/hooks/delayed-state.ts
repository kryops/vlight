import { useState, useEffect, useRef, useCallback } from 'react'

export function useDelayedState<T>(
  initialValue: T,
  ms = 300
): [T, (value: T, delay?: boolean) => void] {
  const timeoutRef = useRef<any>()
  const [state, setState] = useState(initialValue)

  // clean up on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ms]
  )

  return [state, setStateDelayed]
}
