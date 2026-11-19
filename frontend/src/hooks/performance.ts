import { deepEqual, shallowEqual } from '@vlight/utils'
import { useState } from 'react'

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
