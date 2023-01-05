import { deepEqual, shallowEqual } from '@vlight/utils'
import { useCallback, useRef } from 'react'

/**
 * React Hook that memoizes a value as long as its shallowly equal to the value before.
 */
export function useShallowEqualMemo<T>(value: T) {
  const ref = useRef<T>(value)

  if (!shallowEqual(ref.current, value)) {
    ref.current = value
  }

  return ref.current
}

/**
 * React Hook that memoizes a value as long as its deeply equal to the value before.
 */
export function useDeepEqualMemo<T>(value: T) {
  const ref = useRef<T>(value)

  if (!deepEqual(ref.current, value)) {
    ref.current = value
  }

  return ref.current
}

// via https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md
export function useEvent<T extends Function>(handler: T): T {
  const handlerRef = useRef<T>(handler)
  handlerRef.current = handler

  return useCallback((...args: any[]) => handlerRef.current(...args), []) as any
}
