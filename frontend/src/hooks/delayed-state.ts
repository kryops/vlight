import { useState, useEffect, useRef } from 'react'

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
  }, [timeoutRef])

  function setStateDelayed(value: T, delayed = false) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (delayed) {
      timeoutRef.current = setTimeout(() => setState(value), ms)
    } else {
      setState(value)
    }
  }

  return [state, setStateDelayed]
}
