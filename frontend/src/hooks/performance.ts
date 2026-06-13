import { deepEqual, shallowEqual } from '@vlight/utils'
import { useCallback, useRef, useState } from 'react'

/**
 * React Hook that memoizes a value as long as its shallowly equal to the value before.
 */
export function useShallowEqualMemo<T>(value: T) {
  const [state, setState] = useState<T>(value)

  if (!shallowEqual(state, value)) {
    setState(value)
  }

  return state
}

/**
 * React Hook that memoizes a value as long as its deeply equal to the value before.
 */
export function useDeepEqualMemo<T>(value: T) {
  const [state, setState] = useState<T>(value)

  if (!deepEqual(state, value)) {
    setState(value)
  }

  return state
}

// via https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function useEvent<T extends Function>(handler: T): T {
  const handlerRef = useRef<T>(handler)
  // eslint-disable-next-line react-hooks/refs
  handlerRef.current = handler

  return useCallback((...args: any[]) => handlerRef.current(...args), []) as any
}
